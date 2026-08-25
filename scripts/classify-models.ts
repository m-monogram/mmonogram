/**
 * Прогоняет классификатор конфигуратора по выложенным моделям и показывает,
 * какая доля геометрии в какую роль попала.
 *
 * Запуск: npx tsx scripts/classify-models.ts public/models/*.glb
 *
 * Нужен, чтобы правила из models.ts проверялись на настоящих файлах, а не
 * на предположениях о том, как они устроены.
 */

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { classifyPart, type MaterialDesc } from "../src/components/configurator/fitModel";
import type { PartRole } from "../src/components/configurator/models";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
});

const INTERIOR_FILES = /custom-interior|steering-wheel/;

for (const file of process.argv.slice(2)) {
  const doc = await io.read(file);
  const scene = doc.getRoot().listScenes()[0];
  const carHeight = (() => {
    const b = getBounds(scene);
    return b.max[1] - b.min[1];
  })();

  const byRole = new Map<PartRole | "interior", { tris: number; mats: Set<string> }>();
  let total = 0;

  const walk = (node: ReturnType<typeof scene.listChildren>[number]) => {
    const mesh = node.getMesh();
    if (mesh) {
      const b = getBounds(node);
      const centerY = (b.max[1] + b.min[1]) / 2;
      for (const prim of mesh.listPrimitives()) {
        const m = prim.getMaterial();
        const idx = prim.getIndices();
        const tris = Math.floor((idx ? idx.getCount() : prim.getAttribute("POSITION")!.getCount()) / 3);
        const desc: MaterialDesc | null = m && {
          name: m.getName(),
          metalness: m.getMetallicFactor(),
          roughness: m.getRoughnessFactor(),
          opacity: m.getBaseColorFactor()[3],
          luma: 0.2126 * m.getBaseColorFactor()[0] + 0.7152 * m.getBaseColorFactor()[1] + 0.0722 * m.getBaseColorFactor()[2],
        };
        const role = INTERIOR_FILES.test(file) ? "interior" : classifyPart(desc, centerY, carHeight, node.getName() || mesh.getName());
        const slot = byRole.get(role) ?? { tris: 0, mats: new Set<string>() };
        slot.tris += tris;
        slot.mats.add(m?.getName() || "(без материала)");
        byRole.set(role, slot);
        total += tris;
      }
    }
    node.listChildren().forEach(walk);
  };
  scene.listChildren().forEach(walk);

  console.log(`\n${"=".repeat(84)}`);
  console.log(`${file.split("/").pop()}   высота машины ${carHeight.toFixed(2)} м, треугольников ${total.toLocaleString("ru-RU")}`);
  const order = [...byRole.entries()].sort((a, b) => b[1].tris - a[1].tris);
  for (const [role, s] of order) {
    const pct = ((s.tris / total) * 100).toFixed(1);
    console.log(`  ${String(role).padEnd(10)} ${String(s.tris).padStart(7)}  ${pct.padStart(5)}%   ${[...s.mats].map(m=>m.trim()).join(", ").slice(0, 90)}`);
  }
}
