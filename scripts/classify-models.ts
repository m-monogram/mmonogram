/**
 * Прогоняет классификатор конфигуратора по выложенным моделям и показывает,
 * какая доля геометрии в какую роль попала.
 *
 * Запуск: npx tsx scripts/classify-models.ts public/models/*.glb
 *
 * Нужен, чтобы правила из models.ts проверялись на настоящих файлах, а не
 * на предположениях о том, как они устроены.
 */

import * as THREE from "three";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { classifyCabin, classifyPart, type MaterialDesc } from "../src/components/configurator/fitModel";
import type { PartRole } from "../src/components/configurator/models";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
});

const INTERIOR_FILES = /custom-interior|steering-wheel/;

for (const file of process.argv.slice(2)) {
  const doc = await io.read(file);
  const scene = doc.getRoot().listScenes()[0];
  const bounds = getBounds(scene);
  const carSize = new THREE.Vector3(
    bounds.max[0] - bounds.min[0],
    bounds.max[1] - bounds.min[1],
    bounds.max[2] - bounds.min[2],
  );
  /* Файлы лежат в своих осях: длина по Z, ширина по X. Классификатор ждёт
     сцену после посадки, где длина по X, — переставляем. */
  const swap = (v: number[]) => new THREE.Vector3(v[2], v[1], v[0]);
  const carSizeFitted = new THREE.Vector3(carSize.z, carSize.y, carSize.x);

  // Салон делится по зонам, поэтому его габарит нужен целиком
  const cabinBox = new THREE.Box3(swap(bounds.min), swap(bounds.max));
  const byRole = new Map<PartRole | "interior", { tris: number; mats: Set<string> }>();
  let total = 0;

  const walk = (node: ReturnType<typeof scene.listChildren>[number]) => {
    const mesh = node.getMesh();
    if (mesh) {
      const b = getBounds(node);
      const box = new THREE.Box3(swap(b.min), swap(b.max));
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
        const role = INTERIOR_FILES.test(file)
          ? classifyCabin(box.getCenter(new THREE.Vector3()), cabinBox)
          : classifyPart(desc, box, carSizeFitted, node.getName() || mesh.getName());
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
  console.log(`${file.split("/").pop()}   высота машины ${carSize.y.toFixed(2)} м, треугольников ${total.toLocaleString("ru-RU")}`);
  const order = [...byRole.entries()].sort((a, b) => b[1].tris - a[1].tris);
  for (const [role, s] of order) {
    const pct = ((s.tris / total) * 100).toFixed(1);
    console.log(`  ${String(role).padEnd(10)} ${String(s.tris).padStart(7)}  ${pct.padStart(5)}%   ${[...s.mats].map(m=>m.trim()).join(", ").slice(0, 90)}`);
  }
}
