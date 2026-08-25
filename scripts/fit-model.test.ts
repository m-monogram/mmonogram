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
import { computeFit, classifyPart, isDebris, type MaterialDesc } from "../src/components/configurator/fitModel";
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

const CAR_SIZE = new THREE.Vector3(4.82, 1.98, 2.0);

/** Компактная деталь с центром на заданной высоте, у кормы машины. */
const at = (centerY: number, span = 0.6, x = -2.1) =>
  new THREE.Box3(
    new THREE.Vector3(x - span / 2, centerY - span / 2, -span / 2),
    new THREE.Vector3(x + span / 2, centerY + span / 2, span / 2),
  );

const cases: [string, MaterialDesc | null, number, string, PartRole][] = [
  ["кузовной лак",            mat("Car Paint", { metalness: 1, roughness: 0.5, luma: 0 }), 1.0, "Plane.010", "body"],
  ["светлая деталь диска",    mat("Rolls royce car paint", { luma: 0.8 }),                 0.3, "Mesh.5",    "wheelAccent"],
  ["поле диска по имени меша", mat("Car Paint", { metalness: 1, luma: 0 }),                0.4, "2F_4056_12x24_5x130_ET16_D84", "wheel"],
  ["спицы по имени меша",     mat("Material.015", { luma: 0.8 }),                          0.4, "3F_4056_10x24_5x130_ET0_D84",  "wheelAccent"],
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
  check(label, classifyPart(material, at(centerY), CAR_SIZE, meshName), expected);
}

// Фонарь и фара бывают только на торцах: тот же материал в середине машины
// это обломок прореживания, а не фонарь
check(
  "красное стекло в середине салона",
  classifyPart(mat("glass_0.003", { luma: 0.2 }), at(1.0, 0.4, 0.3), CAR_SIZE, "Mesh176_1"),
  "trim",
);
check(
  "красное стекло на корме",
  classifyPart(mat("glass_0.001", { luma: 0.2 }), at(0.7, 0.2, -2.15), CAR_SIZE, "Group_83001"),
  "taillight",
);
check(
  "диоды решётки",
  classifyPart(mat("Material.016", { metalness: 1, roughness: 0.09 }), at(0.7, 0.3, 2.1), CAR_SIZE, "диоды_решетки"),
  "light",
);
check(
  "корпус диодов решётки",
  classifyPart(mat("Material.016", { metalness: 1, roughness: 0.09 }), at(0.7, 0.3, 2.1), CAR_SIZE, "корпус_диодов_решетки"),
  "chrome",
);

// Порог лежит на высоте колеса, но тянется вдоль всей машины — не колесо
check(
  "порог вдоль борта",
  classifyPart(mat("Material.015", { luma: 0.8 }), new THREE.Box3(
    new THREE.Vector3(-1.6, 0.2, 0.8), new THREE.Vector3(1.6, 0.4, 0.95),
  ), CAR_SIZE, "Plane.004"),
  "trim",
);

/* ---- отсев обломков прореживания ---- */

/** Меш из заданного числа треугольников с заданным габаритным ящиком. */
const scrap = (tris: number, [x, y, z]: [number, number, number]) => {
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array(tris * 9);
  // первый треугольник растягиваем на весь габарит, остальные вырожденные
  verts.set([0, 0, 0, x, y, 0, x, y, z]);
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.setIndex([...Array(tris * 3).keys()].map((i) => i % (tris * 3)));
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
  return { mesh: m, box: new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)) };
};

console.log("\nотсев обломков прореживания:");
const debrisCases: [string, number, [number, number, number], boolean][] = [
  ["схлопнутый фонарь, плоский лоскут", 2, [1.54, 0.74, 2.65], true],
  ["молдинг по борту",                  6, [1.58, 0.01, 0.01], false],
  ["полоса стоп-сигнала",               6, [0.53, 0.03, 0.01], false],
  ["нормальная деталь",              1200, [1.50, 0.70, 2.60], false],
];
for (const [label, tris, size, expected] of debrisCases) {
  const { mesh, box } = scrap(tris, size);
  check(label, isDebris(mesh, box), expected);
}

console.log(`\n${failures === 0 ? "всё сошлось" : `${failures} расхождений`}`);
process.exit(failures === 0 ? 0 : 1);
