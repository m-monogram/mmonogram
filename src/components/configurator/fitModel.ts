import * as THREE from "three";
import {
  CHROME_PROPS,
  GLASS_ALPHA_THRESHOLD,
  MATERIAL_RULES,
  MESH_RULES,
  TARGET_LENGTH,
  TIRE_MAX_LUMA,
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
  centerY: number,
  carHeight: number,
  meshName = "",
): PartRole {
  const byName = MESH_RULES.find((r) => r.test.test(meshName));
  if (byName) return byName.role;

  if (material) {
    const rule = MATERIAL_RULES.find((r) => r.test.test(material.name));
    if (rule) return rule.role;

    if (material.metalness >= CHROME_PROPS.minMetalness && material.roughness <= CHROME_PROPS.maxRoughness) {
      return "chrome";
    }
    if (material.opacity < GLASS_ALPHA_THRESHOLD) return "glass";
  }

  if (carHeight > 0 && centerY / carHeight < WHEEL_ZONE_TOP) {
    return !material || material.luma < TIRE_MAX_LUMA ? "tire" : "wheel";
  }
  return "trim";
}
