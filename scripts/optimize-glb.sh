#!/usr/bin/env bash
#
# Прореживает выгруженные из CAD модели до пригодного для веба размера.
#
# Использование: scripts/optimize-glb.sh <папка-с-glb> [папка-назначения]
# По умолчанию результат кладётся в public/models.
#
# Цепочка на каждый файл: weld → simplify → draco.
#
# Команда `gltf-transform optimize` здесь не годится: она по умолчанию
# склеивает меши (--join, --flatten), а конфигуратор определяет роль каждой
# части по её отдельному габаритному ящику — после склейки колёса срастутся
# с кузовом и красить будет нечего.

set -euo pipefail

SRC="${1:?укажите папку с исходными .glb}"
DST="${2:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/models}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Крупная геометрия распаковывается в память целиком — heap по умолчанию мал
export NODE_OPTIONS="--max-old-space-size=8192"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GT="$ROOT/node_modules/.bin/gltf-transform"
if [ ! -x "$GT" ]; then
  echo "Ставлю gltf-transform..."
  (cd "$ROOT" && npm install --no-save @gltf-transform/cli >/dev/null 2>&1)
fi

mkdir -p "$DST"

# Доля вершин, которую оставляем. Чем тяжелее исходник, тем агрессивнее рез.
ratio_for() {
  case "$1" in
    custom-interior.glb)   echo 0.05 ;;
    body-kit-wheels.glb)   echo 0.08 ;;
    steering-wheel.glb)    echo 0.30 ;;
    stock-body.glb)        echo 0.50 ;;
    *)                     echo 0.20 ;;
  esac
}

mb() { echo "$(( $(wc -c < "$1") / 1048576 )) МБ"; }

for file in "$SRC"/*.glb; do
  name="$(basename "$file")"
  ratio="$(ratio_for "$name")"
  echo ""
  echo "=== $name  ($(mb "$file"), оставляю ${ratio} вершин) ==="

  "$GT" weld     "$file"          "$WORK/weld.glb"                        >/dev/null
  "$GT" simplify "$WORK/weld.glb" "$WORK/simple.glb" --ratio "$ratio" --error 0.01 >/dev/null
  "$GT" draco    "$WORK/simple.glb" "$DST/$name"                          >/dev/null

  echo "  → $DST/$name  ($(mb "$DST/$name"))"
done

echo ""
echo "Готово. Проверить структуру: node scripts/inspect-glb.mjs $DST/*.glb"
