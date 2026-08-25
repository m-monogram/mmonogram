import * as THREE from "three";
import { computeFit, classifyExterior } from "../src/components/configurator/fitModel";

/* Машина как её отдаёт CAD: сантиметры, ось Z вверх, длина вдоль X. */
const root = new THREE.Group();
const add = (name: string, geo: THREE.BufferGeometry, pos: [number, number, number]) => {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
  m.name = name;
  m.position.set(...pos);
  root.add(m);
  return m;
};

const shell = add("shell", new THREE.BoxGeometry(482, 198, 130), [0, 0, 105]);
const glass: THREE.Mesh[] = [];
glass.push(add("windshield", new THREE.BoxGeometry(100, 180, 3), [80, 0, 150]));
glass.push(add("side-left", new THREE.BoxGeometry(200, 3, 60), [-30, 99, 145]));
const wheels: THREE.Mesh[] = [];
for (const x of [150, -150]) for (const y of [84, -84]) {
  wheels.push(add(`wheel-${x}-${y}`, new THREE.CylinderGeometry(40, 40, 30, 24), [x, y, 40]));
}
const bolt = add("bolt", new THREE.BoxGeometry(4, 4, 4), [150, 90, 40]);

const fit = computeFit(root);
root.quaternion.copy(fit.quaternion);
root.scale.setScalar(fit.scale);
root.position.copy(fit.position);
root.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(root);
const size = box.getSize(new THREE.Vector3());
const f = (v: number) => v.toFixed(2);

console.log(`масштаб: ${fit.scale.toFixed(4)}  (ожидается 0.0100)`);
console.log(`габариты после посадки: ${f(size.x)} × ${f(size.y)} × ${f(size.z)} м`);
console.log(`низ сборки по Y: ${f(box.min.y)}  (ожидается 0.00 — колёса на земле)`);
console.log(`центр по X/Z: ${f((box.min.x + box.max.x) / 2)} / ${f((box.min.z + box.max.z) / 2)}  (ожидается 0.00 / 0.00)`);

const role = (m: THREE.Mesh) => classifyExterior(m, fit.carSize);
let failures = 0;
const check = (label: string, actual: string, expected: string) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "OK  " : "ФЕЙЛ"} ${label.padEnd(18)} → ${actual}${ok ? "" : `  (ожидалось ${expected})`}`);
};

console.log("\nроли:");
check("кузов", role(shell), "body");
glass.forEach((g) => check(g.name, role(g), "glass"));
wheels.forEach((w) => check(w.name, role(w), "wheel"));
check("мелкая деталь", role(bolt), "trim");

const geomOk =
  Math.abs(fit.scale - 0.01) < 1e-6 &&
  Math.abs(box.min.y) < 1e-6 &&
  Math.abs((box.min.x + box.max.x) / 2) < 1e-6 &&
  size.y < size.x;
console.log(`\nгеометрия: ${geomOk ? "OK" : "ФЕЙЛ"}   роли: ${failures === 0 ? "OK" : `${failures} ошибок`}`);
process.exit(geomOk && failures === 0 ? 0 : 1);
