import * as THREE from "three";
import {
  GLASS_ALPHA_THRESHOLD,
  GLASS_RULES,
  TARGET_LENGTH,
  WHEEL_RULES,
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

/**
 * Роль меша по его габаритному ящику в мировых координатах — то есть уже
 * после разворота и нормировки, где X это длина, Y высота от земли,
 * Z ширина.
 */
export function classifyExterior(mesh: THREE.Mesh, carSize: THREE.Vector3): PartRole {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const source = mesh.material;
  const first = Array.isArray(source) ? source[0] : source;
  if (first?.transparent && "opacity" in first && (first.opacity as number) < GLASS_ALPHA_THRESHOLD) return "glass";

  const rel = Math.max(size.x, size.y, size.z) / carSize.x;
  if (rel < WHEEL_RULES.minSizeRatio) return "trim";

  const lowEnough = center.y / carSize.y < WHEEL_RULES.maxCenterY;
  const offAxis = Math.abs(center.z) / (carSize.z / 2) > WHEEL_RULES.minCenterOffsetZ;
  const round = size.y > 0 && Math.abs(size.x - size.y) / Math.max(size.x, size.y) < WHEEL_RULES.maxAspectSkew;
  const narrow = size.z / Math.max(size.x, size.y) < WHEEL_RULES.maxWidthRatio;
  if (lowEnough && offAxis && round && narrow) return "wheel";

  // Остекление: тонкая панель заметного размера выше подоконной линии.
  // Без неё кузов остаётся глухой скорлупой и интерьера не видно.
  const thickness = Math.min(size.x, size.y, size.z);
  const span = Math.max(size.x, size.y, size.z);
  const highUp = center.y / carSize.y > GLASS_RULES.minCenterY;
  const thin = span > 0 && thickness / span < GLASS_RULES.maxThicknessRatio;
  if (highUp && thin && rel > GLASS_RULES.minSizeRatio) return "glass";

  return "body";
}

