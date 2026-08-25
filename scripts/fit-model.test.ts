/**
 * Проверка посадки моделей в сцену и разбора частей по ролям.
 *
 * Запуск: npx tsx scripts/fit-model.test.ts
 *
 * Первая часть кормит computeFit машиной в том виде, в каком её отдаёт CAD —
 * сантиметры, ось Z вверх — и ждёт, что она сама встанет в метры колёсами на
 * землю. Вторая проверяет classifyPart на материалах, реально встреченных
 * в моделях G63.
 */

import * as THREE from "three";
import { computeFit, classifyPart, type MaterialDesc } from "../src/components/configurator/fitModel";
import type { PartRole } from "../src/components/configurator/models";

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "OK  " : "ФЕЙЛ"} ${label.padEnd(46)} ${actual}${ok ? "" : `   (ожидалось ${expected})`}`);
};

/* ---- посадка в сцену ---- */

const root = new THREE.Group();
const add = (name: string, geo: THREE.BufferGeometry, pos: [number, number, number]) => {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
  m.name = name;
  m.position.set(...pos);
  root.add(m);
};

add("shell", new THREE.BoxGeometry(482, 198, 130), [0, 0, 105]);
add("windshield", new THREE.BoxGeometry(100, 180, 3), [80, 0, 150]);
for (const x of [150, -150]) for (const y of [84, -84]) {
  add(`wheel-${x}-${y}`, new THREE.CylinderGeometry(40, 40, 30, 24), [x, y, 40]);
}

const fit = computeFit(root);
root.quaternion.copy(fit.quaternion);
root.scale.setScalar(fit.scale);
root.position.copy(fit.position);
root.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(root);
const size = box.getSize(new THREE.Vector3());
const round = (v: number) => Number(v.toFixed(2));

console.log("посадка сборки в сцену:");
check("масштаб из сантиметров", round(fit.scale), 0.01);
check("длина по X, м", round(size.x), 4.82);
check("высота меньше длины", size.y < size.x, true);
check("колёса на земле", round(box.min.y), 0);
check("центр по X", round((box.min.x + box.max.x) / 2), 0);
check("центр по Z", round((box.min.z + box.max.z) / 2), 0);

/* ---- разбор частей по ролям ---- */

const mat = (name: string, o: Partial<MaterialDesc> = {}): MaterialDesc => ({
  name, metalness: 0, roughness: 0.55, opacity: 1, luma: 0.2, ...o,
});

const CAR_HEIGHT = 1.98;
const cases: [string, MaterialDesc | null, number, string, PartRole][] = [
  ["кузовной лак",            mat("Car Paint", { metalness: 1, roughness: 0.5, luma: 0 }), 1.0, "Plane.010", "body"],
  ["лак на диске",            mat("Rolls royce car paint", { luma: 0.8 }),                 0.3, "Mesh.5",    "wheel"],
  ["диск по имени меша",      mat("Car Paint", { metalness: 1, luma: 0 }),                 0.4, "2F_4056_12x24_5x130_ET16_D84", "wheel"],
  ["остекление",              mat("glass.001", { luma: 0.6 }),                             1.3, "Mesh.019",  "glass"],
  ["тонированное стекло",     mat("Glass dark.001", { opacity: 0.55, metalness: 1 }),      1.1, "Mesh.031",  "glass"],
  ["красный рассеиватель",    mat("glass_0.001", { luma: 0.2 }),                           0.7, "Mesh.020",  "taillight"],
  ["фара",                    mat("light on _1.001", { luma: 1 }),                         0.8, "Group_13",  "light"],
  ["хром по имени",           mat("chrome.001"),                                           0.9, "Mesh.007",  "chrome"],
  ["хром по свойствам",       mat("Material.016", { metalness: 1, roughness: 0.09 }),      0.9, "Mesh.027",  "chrome"],
  ["карбон",                  mat("carbono1_001.001"),                                     0.9, "Mesh.5747", "carbon"],
  ["покрышка",                mat("Material.014", { metalness: 0.71, roughness: 0.58, luma: 0 }), 0.3, "Mesh.010", "tire"],
  ["чёрный пластик",          mat("mat_2.001"),                                            0.9, "Mesh.006",  "trim"],
  ["меш без материала внизу", null,                                                        0.2, "Mesh.064",  "tire"],
];

console.log("\nразбор частей по ролям:");
for (const [label, material, centerY, meshName, expected] of cases) {
  check(label, classifyPart(material, centerY, CAR_HEIGHT, meshName), expected);
}

console.log(`\n${failures === 0 ? "всё сошлось" : `${failures} расхождений`}`);
process.exit(failures === 0 ? 0 : 1);
