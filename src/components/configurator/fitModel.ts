import * as THREE from "three";
import {
  CABIN_ZONES,
  CHROME_PROPS,
  DEBRIS,
  LIGHT_ZONE_FROM_CENTER,
  GLASS_ALPHA_THRESHOLD,
  MATERIAL_RULES,
  MESH_RULES,
  TARGET_LENGTH,
  TIRE_MAX_LUMA,
  WHEEL_ACCENT_MIN_LUMA,
  WHEEL_MAX_SPAN,
  WHEEL_ZONE_TOP,
  type PartRole,
} from "./models";

/**
 * Геометрия посадки моделей в сцену: разворот, масштаб и определение роли
 * каждой части. Вынесено из компонента отдельно — это единственная часть
 * подключения, которую можно проверить без браузера и WebGL.
 */

export interface Fit {
  quaternion: THREE.Quaternion;
  scale: number;
  position: THREE.Vector3;
  carSize: THREE.Vector3;
}

const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

/**
 * Считает разворот и масштаб сборки: высота машины — самый короткий габарит,
 * длина идёт вдоль X, колёса стоят на нулевой отметке.
 */
export function computeFit(object: THREE.Object3D): Fit {
  const raw = new THREE.Box3().setFromObject(object);
  const size = raw.getSize(new THREE.Vector3());

  const quaternion = new THREE.Quaternion();
  const axes = [size.x, size.y, size.z];
  const shortest = axes.indexOf(Math.min(...axes));
  // FBX из CAD чаще всего Z-up: короткая ось приезжает третьей
  if (shortest === 2) quaternion.setFromAxisAngle(AXIS_X, -Math.PI / 2);
  else if (shortest === 0) quaternion.setFromAxisAngle(AXIS_Z, Math.PI / 2);

  const rotated = () => raw.clone().applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(quaternion));

  let box = rotated();
  let fitted = box.getSize(new THREE.Vector3());

  // Машина смотрит вдоль X — как процедурная заглушка, которую заменяем
  if (fitted.z > fitted.x) {
    quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(AXIS_Y, Math.PI / 2));
    box = rotated();
    fitted = box.getSize(new THREE.Vector3());
  }

  const scale = fitted.x > 0 ? TARGET_LENGTH / fitted.x : 1;
  const center = box.getCenter(new THREE.Vector3());

  return {
    quaternion,
    scale,
    position: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
    carSize: fitted.multiplyScalar(scale),
  };
}

/** Материал в том виде, в каком его достаточно знать для классификации. */
export interface MaterialDesc {
  name: string;
  metalness: number;
  roughness: number;
  opacity: number;
  /** Яркость базового цвета, 0..1: отличает покрышку от диска. */
  luma: number;
}

export function describeMaterial(material: THREE.Material | null | undefined): MaterialDesc | null {
  if (!material) return null;
  const std = material as THREE.MeshStandardMaterial;
  const c = std.color;
  return {
    name: material.name ?? "",
    metalness: std.metalness ?? 0,
    roughness: std.roughness ?? 1,
    opacity: material.transparent ? material.opacity : 1,
    // Коэффициенты Rec. 709 — воспринимаемая яркость, а не среднее по каналам
    luma: c ? 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b : 0.5,
  };
}

/** Роли, которые бывают только на торцах машины. */
function isLight(role: PartRole): boolean {
  return role === "light" || role === "taillight";
}

/** Внутри колеса светлые детали — спицы и турбина, тёмные — поле диска. */
function refineWheel(role: PartRole, material: MaterialDesc | null): PartRole {
  if (role !== "wheel" || !material) return role;
  return material.luma >= WHEEL_ACCENT_MIN_LUMA ? "wheelAccent" : "wheel";
}

/**
 * Роль части сборки.
 *
 * Сначала имя меша — им опознаются диски, которые в обвесе покрашены
 * кузовным материалом. Затем имя материала — оно у этих моделей осмысленное и точное. Затем
 * свойства: полированный металл это хром, прозрачное это стекло, как бы
 * материал ни назывался. И только под конец геометрия: что осталось
 * неопознанным в колёсной зоне — покрышка, если тёмное, и диск, если светлое.
 */
export function classifyPart(
  material: MaterialDesc | null,
  box: THREE.Box3,
  carSize: THREE.Vector3,
  meshName = "",
): PartRole {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  /** Насколько деталь смещена к носу или корме: 0 — середина, 1 — торец. */
  const alongCar = carSize.x > 0 ? Math.abs(center.x) / (carSize.x / 2) : 0;
  const atEnd = alongCar > LIGHT_ZONE_FROM_CENTER;

  const byName = MESH_RULES.find((r) => r.test.test(meshName));
  if (byName) return refineWheel(byName.role, material);

  if (material) {
    const rule = MATERIAL_RULES.find((r) => r.test.test(material.name));
    if (rule && (!isLight(rule.role) || atEnd)) return refineWheel(rule.role, material);

    if (material.metalness >= CHROME_PROPS.minMetalness && material.roughness <= CHROME_PROPS.maxRoughness) {
      return "chrome";
    }
    if (material.opacity < GLASS_ALPHA_THRESHOLD) return "glass";
  }

  const low = carSize.y > 0 && center.y / carSize.y < WHEEL_ZONE_TOP;
  const compact = Math.max(size.x, size.z) < WHEEL_MAX_SPAN;

  if (low && compact) {
    return !material || material.luma < TIRE_MAX_LUMA ? "tire" : refineWheel("wheel", material);
  }
  return "trim";
}

/**
 * Роль детали салона по её месту в габарите кабины.
 *
 * Материалов в модели салона нет, имена мешей достались от Blender
 * (Куб.006, Плоскость.007), поэтому делим по зонам: низ — ковролин,
 * верх — потолок, передняя часть — панель, остальное — обивка.
 * Ось X направлена вдоль машины, нос в плюс.
 */
export function classifyCabin(center: THREE.Vector3, cabin: THREE.Box3): PartRole {
  const size = cabin.getSize(new THREE.Vector3());
  const up = size.y > 0 ? (center.y - cabin.min.y) / size.y : 0.5;
  const front = size.x > 0 ? (center.x - cabin.min.x) / size.x : 0.5;

  if (up < CABIN_ZONES.floorTop) return "cabinFloor";
  if (up > CABIN_ZONES.roofBottom) return "cabinRoof";
  if (front > CABIN_ZONES.dashFront) return "cabinAccent";
  return "cabinLeather";
}

/** Схлопнутый прореживанием меш: пара треугольников на объёмный габарит. */
export function isDebris(mesh: THREE.Mesh, box: THREE.Box3): boolean {
  const index = mesh.geometry.getIndex();
  const count = index ? index.count : (mesh.geometry.getAttribute("position")?.count ?? 0);
  if (count / 3 > DEBRIS.maxTriangles) return false;

  const size = box.getSize(new THREE.Vector3());
  const [, median] = [size.x, size.y, size.z].sort((a, b) => a - b);
  return median > DEBRIS.minSpan;
}
