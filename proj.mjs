import fs from "node:fs";
import * as THREE from "three";
const [file, px, py] = process.argv.slice(2);
const cam = new THREE.PerspectiveCamera(56, 1280 / 800, 0.1, 100);
cam.position.set(-1.12, 1.64, 0);
cam.lookAt(0.5, 1.1, 0.05);
cam.updateMatrixWorld(true);
// Луч через пиксель
const ndc = new THREE.Vector2((+px / 1280) * 2 - 1, -((+py / 800) * 2 - 1));
const ray = new THREE.Raycaster();
ray.setFromCamera(ndc, cam);
const hits = [];
for (const line of fs.readFileSync(file, "utf8").split("\n").filter(Boolean)) {
  const [role, tris, mins, maxs, ...rest] = line.split(" ");
  const box = new THREE.Box3(
    new THREE.Vector3(...mins.split(",").map(Number)),
    new THREE.Vector3(...maxs.split(",").map(Number)),
  );
  const p = ray.ray.intersectBox(box, new THREE.Vector3());
  if (p) hits.push({ role, tris: +tris, d: p.distanceTo(cam.position), name: rest.join(" "), box });
}
hits.sort((a, b) => a.d - b.d);
console.log(`пиксель ${px},${py}:`);
for (const h of hits.slice(0, 8)) {
  const s = h.box.getSize(new THREE.Vector3());
  console.log("  ", h.d.toFixed(2).padStart(5), h.role.padEnd(13), String(h.tris).padStart(6) + "t",
    "s=" + [s.x, s.y, s.z].map((v) => v.toFixed(2)).join(","), " ", h.name);
}
