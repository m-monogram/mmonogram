/**
 * Печатает структуру GLB-файла: меши, материалы, полигоны, габариты.
 *
 * Нужен, чтобы понять, к каким частям модели привязывать опции конфигуратора
 * (краску — к кузову, отделку — к дискам и т.д.).
 *
 * Запуск: node scripts/inspect-glb.mjs <file.glb> [...]
 *
 * Зависимостей нет: GLB — это заголовок из 12 байт и следом JSON-чанк
 * с описанием сцены, его достаточно прочитать напрямую.
 */

import { readFileSync, statSync } from "node:fs";

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"

function readGlbJson(file) {
  const buf = readFileSync(file);
  if (buf.length < 12 || buf.readUInt32LE(0) !== GLB_MAGIC) {
    throw new Error("это не GLB-файл (нет сигнатуры glTF)");
  }
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (type === CHUNK_JSON) {
      return JSON.parse(buf.subarray(start, start + length).toString("utf8"));
    }
    offset = start + length;
  }
  throw new Error("в файле нет JSON-чанка");
}

/** Треугольники примитива: по индексам, если они есть, иначе по вершинам. */
function primitiveTris(gltf, prim) {
  const mode = prim.mode ?? 4; // 4 = TRIANGLES
  if (mode !== 4) return 0;
  const accessorIdx = prim.indices ?? prim.attributes?.POSITION;
  const count = gltf.accessors?.[accessorIdx]?.count ?? 0;
  return Math.floor(count / 3);
}

/** Габариты сцены из min/max позиционных аксессоров — без чтения бинарника. */
function bounds(gltf) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const mesh of gltf.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const acc = gltf.accessors?.[prim.attributes?.POSITION];
      if (!acc?.min || !acc?.max) continue;
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], acc.min[i]);
        max[i] = Math.max(max[i], acc.max[i]);
      }
    }
  }
  if (!Number.isFinite(min[0])) return null;
  return { min, max, size: max.map((v, i) => v - min[i]) };
}

function inspect(file) {
  const sizeMb = statSync(file).size / 1024 / 1024;
  console.log(`\n${"=".repeat(70)}\n${file}  (${sizeMb.toFixed(1)} МБ)\n${"=".repeat(70)}`);

  const gltf = readGlbJson(file);
  const materials = gltf.materials ?? [];
  const meshes = gltf.meshes ?? [];

  console.log(`Генератор: ${gltf.asset?.generator ?? "—"}`);
  const ext = gltf.extensionsUsed ?? [];
  console.log(`Расширения: ${ext.length ? ext.join(", ") : "—"}`);
  console.log(`Мешей: ${meshes.length}   материалов: ${materials.length}   текстур: ${(gltf.textures ?? []).length}`);

  const box = bounds(gltf);
  if (box) {
    const fmt = (a) => a.map((v) => v.toFixed(2)).join(" × ");
    console.log(`Габариты (X × Y × Z): ${fmt(box.size)}`);
    console.log(`  от [${fmt(box.min)}] до [${fmt(box.max)}]`);
  }

  let totalTris = 0;
  const rows = [];
  meshes.forEach((mesh, i) => {
    let tris = 0;
    const mats = new Set();
    for (const prim of mesh.primitives ?? []) {
      tris += primitiveTris(gltf, prim);
      if (prim.material != null) mats.add(materials[prim.material]?.name ?? `#${prim.material}`);
    }
    totalTris += tris;
    rows.push({ name: mesh.name ?? `mesh_${i}`, tris, mats: [...mats] });
  });

  console.log(`\nВсего треугольников: ${totalTris.toLocaleString("ru-RU")}`);

  console.log(`\n--- Меши (по убыванию полигонов) ---`);
  rows.sort((a, b) => b.tris - a.tris);
  for (const r of rows.slice(0, 40)) {
    const share = totalTris ? ((r.tris / totalTris) * 100).toFixed(1) : "0.0";
    console.log(`  ${r.tris.toLocaleString("ru-RU").padStart(10)}  ${share.padStart(5)}%  ${r.name}`);
    if (r.mats.length) console.log(`${" ".repeat(21)}материал: ${r.mats.join(", ")}`);
  }
  if (rows.length > 40) console.log(`  ... и ещё ${rows.length - 40} мешей`);

  console.log(`\n--- Материалы ---`);
  materials.forEach((m, i) => {
    const pbr = m.pbrMetallicRoughness ?? {};
    const base = pbr.baseColorFactor
      ? `rgb(${pbr.baseColorFactor.slice(0, 3).map((v) => Math.round(v * 255)).join(",")})`
      : "—";
    const tex = pbr.baseColorTexture ? " +текстура" : "";
    console.log(`  [${i}] ${m.name ?? "без имени"}  цвет: ${base}${tex}`);
  });
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Использование: node scripts/inspect-glb.mjs <file.glb> [...]");
  process.exit(1);
}
for (const f of files) {
  try {
    inspect(f);
  } catch (err) {
    console.error(`\n${f}: ${err.message}`);
  }
}
