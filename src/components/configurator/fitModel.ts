import * as THREE from "three";
import {
  CABIN_PARTS,
  CHROME_PROPS,
  DEBRIS,
  LIGHT_ZONE_FROM_CENTER,
  GLASS_ALPHA_THRESHOLD,
  GLASS_PANEL,
  MATERIAL_RULES,
  MESH_RULES,
  TARGET_LENGTH,
  TIRE_MAX_LUMA,
  TIRE_MIN_HEIGHT,
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
export function computeFit(object: THREE.Object3D, targetLength = TARGET_LENGTH): Fit {
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

  const scale = fitted.x > 0 ? targetLength / fitted.x : 1;
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
    if (rule && isLight(rule.role) && !atEnd) {
      /* Материал говорит «стекло фонаря», а деталь сидит посреди машины.
         Фонарей там не бывает: это обломок, разлетевшийся при прореживании.
         Раньше он просто переставал светиться и уходил в trim — и тёмный
         лоскут 29 x 18 см оставался висеть в проходе между рядами, прямо
         перед интерьерной камерой. Прячем. */
      return "debris";
    }
    if (rule) return refineWheel(rule.role, material);

    if (material.metalness >= CHROME_PROPS.minMetalness && material.roughness <= CHROME_PROPS.maxRoughness) {
      return "brightwork";
    }
    if (material.opacity < GLASS_ALPHA_THRESHOLD) return "glass";
  }

  // Стекло по форме — только для деталей без материала
  const [thickness, width, span] = [size.x, size.y, size.z].sort((a, b) => a - b);
  if (
    !material &&
    carSize.y > 0 &&
    center.y / carSize.y > GLASS_PANEL.minCenterY &&
    span > 0 &&
    thickness / span < GLASS_PANEL.maxThicknessRatio &&
    width > GLASS_PANEL.minWidth
  ) {
    return "glass";
  }

  const low = carSize.y > 0 && center.y / carSize.y < WHEEL_ZONE_TOP;
  const compact = Math.max(size.x, size.z) < WHEEL_MAX_SPAN;
  const dark = !material || material.luma < TIRE_MAX_LUMA;

  if (low && compact) return dark ? "tire" : refineWheel("wheel", material);
  // Покрышки идут одним мешем на всю длину машины: их выдаёт рост
  if (low && dark && size.y > TIRE_MIN_HEIGHT) return "tire";
  return "trim";
}

/**
 * С какого торца кабины стоит передняя панель.
 *
 * Знать это нужно, чтобы не покрасить руль в бордовый вместе с сиденьями,
 * но снаружи направление не приходит: подгонка разворачивает модель по
 * габариту, а не по «носу». Зато торпедо выдаёт себя само — это набор
 * накладок во всю ширину кабины и не выше ладони. Берём медиану их
 * положения вдоль машины: одиночные широкие полосы в середине салона
 * (перегородка за передними креслами) её не сдвинут.
 */
export function cabinDashAtMax(boxes: readonly THREE.Box3[], cabin: THREE.Box3): boolean {
  const cabinSize = cabin.getSize(new THREE.Vector3());
  if (cabinSize.x <= 0) return true;

  const along: number[] = [];
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  for (const box of boxes) {
    box.getSize(size);
    if (size.z < CABIN_PARTS.fasciaWidthShare * cabinSize.z) continue;
    if (size.y > CABIN_PARTS.fasciaMaxHeight) continue;
    box.getCenter(center);
    along.push((center.x - cabin.min.x) / cabinSize.x);
  }
  if (!along.length) return true;

  along.sort((a, b) => a - b);
  const half = along.length >> 1;
  const median = along.length % 2 ? along[half] : (along[half - 1] + along[half]) / 2;
  return median >= 0.5;
}

/**
 * Роль детали салона по её размеру и месту в габарите кабины.
 *
 * Модель интерьера пришла без единого материала — весь салон лежит в одном
 * безымянном слоте, а имена мешей блендеровские. Значит, роль остаётся
 * читать по геометрии, и размер здесь важнее положения: сетка динамика,
 * накладка торпедо и подушка кресла отличаются в первую очередь габаритом.
 *
 * Ось X направлена вдоль машины, Z — поперёк.
 */
export function classifyCabin(box: THREE.Box3, cabin: THREE.Box3, dashAtMax: boolean): PartRole {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const cabinSize = cabin.getSize(new THREE.Vector3());
  const cabinMid = cabin.getCenter(new THREE.Vector3());
  const [thin, , largest] = [size.x, size.y, size.z].sort((a, b) => a - b);

  // Мелочёвка — хром салона. Проверяется первой: часы и клавиши стоят
  // ровно на торпедо и иначе ушли бы в накладки.
  if (largest <= CABIN_PARTS.jewelMaxSize) return "cabinMetal";

  // Накладка передней панели: от борта до борта и узкая
  if (
    cabinSize.z > 0 &&
    size.z > CABIN_PARTS.fasciaWidthShare * cabinSize.z &&
    size.y <= CABIN_PARTS.fasciaMaxHeight
  ) {
    return "cabinTrim";
  }

  const up = cabinSize.y > 0 ? (center.y - cabin.min.y) / cabinSize.y : 0.5;
  if (up < CABIN_PARTS.floorTop) return "cabinFloor";
  if (up > CABIN_PARTS.roofBottom) return "cabinRoof";

  const alongMin = cabinSize.x > 0 ? (center.x - cabin.min.x) / cabinSize.x : 0.5;
  const front = dashAtMax ? alongMin : 1 - alongMin;
  const side = cabinSize.z > 0 ? Math.abs(center.z - cabinMid.z) / (cabinSize.z / 2) : 0;

  // Сиденья — единственный бордовый элемент салона. Всё прочее чёрное:
  // так контраст читается, а не расплывается по всей кабине.
  if (
    thin >= CABIN_PARTS.seatMinThickness &&
    largest <= CABIN_PARTS.seatMaxSize &&
    side < CABIN_PARTS.seatMaxSide &&
    front < CABIN_PARTS.seatMaxFront &&
    up < CABIN_PARTS.seatMaxUp
  ) {
    return "cabinAccent";
  }

  return "cabinLeather";
}

/** Обломок прореживания: лоскут без плотности или объём без геометрии. */
export function isDebris(mesh: THREE.Mesh, box: THREE.Box3): boolean {
  const index = mesh.geometry.getIndex();
  const count = index ? index.count : (mesh.geometry.getAttribute("position")?.count ?? 0);
  const tris = count / 3;
  if (tris <= DEBRIS.alwaysHideAtOrBelow) return true;

  const size = box.getSize(new THREE.Vector3());
  const [thin, median, largest] = [size.x, size.y, size.z].sort((a, b) => a - b);

  // Видимую площадь считаем по двум большим измерениям: у лоскута третье нулевое
  if (tris / Math.max(median * largest, 1e-4) < DEBRIS.minDensity) return true;

  return tris < DEBRIS.ghostMaxTriangles && thin >= DEBRIS.ghostMinThickness;
}
