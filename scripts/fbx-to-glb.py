"""
Конвертация FBX -> сжатый GLB для 3D-конфигуратора.

Запуск (macOS):
  /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python scripts/fbx-to-glb.py -- <папка-с-fbx> <папка-для-glb> [--max-tris 300000]

Каждый .fbx обрабатывается в чистой сцене: импорт, децимация мешей до бюджета
по треугольникам (нужна для CAD-геометрии, где полигонов миллионы), экспорт GLB
со сжатием Draco.
"""

import os
import re
import sys
import glob

import bpy

DEFAULT_MAX_TRIS = 300_000

TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "i", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


# Имена, которые ждёт конфигуратор (src/components/configurator/models.ts).
# Ключ ищется как подстрока в имени исходного FBX, в нижнем регистре.
NAME_MAP = [
    ("stock body", "stock-body"),
    ("body kit", "body-kit-wheels"),
    ("cistom interior", "custom-interior"),
    ("custom interior", "custom-interior"),
    ("руль", "steering-wheel"),
    ("lenkrad", "steering-wheel"),
]

# CAD-исходники тяжелее оцифровки на порядок и для сайта не нужны:
# интерьер берётся из обычной модели. Обрабатываются только по --include-cad.
SKIP_BY_DEFAULT = ("cad ",)


def target_name(stem):
    """Имя выходного файла: известные модели получают имя из NAME_MAP."""
    low = stem.lower()
    for needle, name in NAME_MAP:
        if needle in low:
            return name
    return slugify(stem)


def slugify(name):
    """Имя файла -> безопасное для веба: латиница, нижний регистр, дефисы."""
    name = "".join(TRANSLIT.get(ch, ch) for ch in name.lower())
    name = re.sub(r"[^a-z0-9]+", "-", name)
    return name.strip("-") or "model"


def parse_args(argv):
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []
    if len(argv) < 2:
        sys.exit("Использование: -- <папка-с-fbx> <папка-для-glb> [--max-tris N]")
    src, dst = argv[0], argv[1]
    max_tris = DEFAULT_MAX_TRIS
    if "--max-tris" in argv:
        max_tris = int(argv[argv.index("--max-tris") + 1])
    include_cad = "--include-cad" in argv
    return src, dst, max_tris, include_cad


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def scene_tris():
    total = 0
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            total += sum(len(p.vertices) - 2 for p in obj.data.polygons)
    return total


def decimate(ratio):
    """Схлопывает геометрию всех мешей до заданной доли от исходной."""
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.data.polygons:
            continue
        mod = obj.modifiers.new(name="ccr_decimate", type="DECIMATE")
        mod.decimate_type = "COLLAPSE"
        mod.ratio = ratio
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError as exc:
            print(f"    децимация {obj.name} не удалась: {exc}")
            obj.modifiers.remove(mod)


def import_fbx(path):
    """Blender 5.x завёл нативный импортёр wm.fbx_import рядом со старым
    import_scene.fbx; какой из них есть — зависит от версии, пробуем оба."""
    candidates = []
    if hasattr(bpy.ops.wm, "fbx_import"):
        candidates.append(("wm.fbx_import", bpy.ops.wm.fbx_import))
    if hasattr(bpy.ops.import_scene, "fbx"):
        candidates.append(("import_scene.fbx", bpy.ops.import_scene.fbx))
    if not candidates:
        raise RuntimeError("в этой сборке Blender нет импортёра FBX")

    errors = []
    for name, op in candidates:
        try:
            op(filepath=path)
            print(f"    импорт через {name}")
            return
        except Exception as exc:
            errors.append(f"{name}: {exc}")
    raise RuntimeError("; ".join(errors))


def export_glb(path):
    """Экспорт с Draco. Набор параметров у экспортёра менялся между версиями
    Blender, поэтому неизвестные ключи отбрасываем и пробуем снова."""
    opts = {
        "filepath": path,
        "export_format": "GLB",
        "export_draco_mesh_compression_enable": True,
        "export_draco_mesh_compression_level": 6,
        "export_draco_position_quantization": 14,
        "export_draco_normal_quantization": 10,
        "export_draco_texcoord_quantization": 12,
        "export_apply": True,
        "use_selection": False,
    }
    while True:
        try:
            bpy.ops.export_scene.gltf(**opts)
            return
        except TypeError as exc:
            bad = [k for k in opts if k != "filepath" and k in str(exc)]
            if not bad:
                raise
            for k in bad:
                print(f"    параметр {k} не поддерживается этой версией Blender, пропускаю")
                opts.pop(k)


def main():
    src, dst, max_tris, include_cad = parse_args(sys.argv)
    os.makedirs(dst, exist_ok=True)

    files = sorted(glob.glob(os.path.join(src, "*.fbx")))
    if not files:
        sys.exit(f"В {src} не найдено ни одного .fbx")

    print(f"Найдено файлов: {len(files)}; бюджет полигонов: {max_tris}")

    for fbx in files:
        stem = os.path.splitext(os.path.basename(fbx))[0]
        size_mb = os.path.getsize(fbx) / 1024 / 1024

        if not include_cad and any(s in stem.lower() for s in SKIP_BY_DEFAULT):
            print(f"\n=== {os.path.basename(fbx)} ({size_mb:.0f} МБ) — пропуск, CAD-исходник")
            print("    нужен — запустите с ключом --include-cad")
            continue

        name = target_name(stem)
        out = os.path.join(dst, name + ".glb")
        print(f"\n=== {os.path.basename(fbx)} ({size_mb:.0f} МБ) → {name}.glb ===")

        reset_scene()
        try:
            import_fbx(fbx)
        except Exception as exc:
            print(f"    импорт не удался: {exc}")
            continue

        tris = scene_tris()
        print(f"    треугольников после импорта: {tris}")
        if tris > max_tris:
            ratio = max_tris / tris
            print(f"    децимация до {ratio:.4f} от исходного")
            decimate(ratio)
            print(f"    треугольников после децимации: {scene_tris()}")

        export_glb(out)
        print(f"    готово: {out} ({os.path.getsize(out) / 1024 / 1024:.1f} МБ)")

    print("\nВсе файлы обработаны.")


if __name__ == "__main__":
    main()
