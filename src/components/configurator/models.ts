/**
 * Подключение оцифрованных моделей M-Monogram к конфигуратору.
 *
 * Модели выгружены из FBX через FBX2glTF со сжатием Draco. Материалы при
 * выгрузке схлопнулись в один DefaultMaterial, а имена мешей достались от
 * заводского CAD (_463_B_lenkr_voli_amgnap) и от Blender (Плоскость.029) —
 * опираться на них нельзя. Поэтому роль каждой части определяется
 * геометрически, по её месту и пропорциям в габаритах машины.
 */

/** Файлы лежат в public/models, декодер Draco — в public/draco. */
export const MODEL_BASE = "/models";
export const DRACO_PATH = "/draco/";

export const MODEL_FILES = {
  body: `${MODEL_BASE}/stock-body.glb`,
  kit: `${MODEL_BASE}/body-kit-wheels.glb`,
  interior: `${MODEL_BASE}/custom-interior.glb`,
  wheel: `${MODEL_BASE}/steering-wheel.glb`,
} as const;

/** Длина G63 по кузову, метры: под неё нормируется масштаб всей сборки. */
export const TARGET_LENGTH = 4.82;

/**
 * Пороги распознавания колеса среди мешей. Доли берутся от габаритов сборки,
 * поэтому не зависят от единиц измерения исходного FBX.
 */
export const WHEEL_RULES = {
  /** Центр колеса лежит в нижней части кузова. */
  maxCenterY: 0.45,
  /** Колесо смещено от продольной оси к борту. */
  minCenterOffsetZ: 0.2,
  /** Диск круглый: длина и высота его габарита близки. */
  maxAspectSkew: 0.35,
  /** Колесо заметно уже, чем длиннее. */
  maxWidthRatio: 0.55,
  /** Совсем мелкие детали (болты, шильдики) колёсами не считаем. */
  minSizeRatio: 0.08,
} as const;

/**
 * Пороги распознавания остекления. Материалов в моделях нет, поэтому стекло
 * ищется по форме: тонкая панель в верхней половине кузова.
 */
export const GLASS_RULES = {
  /** Стекло начинается выше подоконной линии. */
  minCenterY: 0.5,
  /** Панель тонкая относительно своей площади. */
  maxThicknessRatio: 0.06,
  /** И при этом заметного размера — не зеркало и не поводок дворника. */
  minSizeRatio: 0.1,
} as const;

/** Прозрачность исходного материала, ниже которой меш считается стеклом. */
export const GLASS_ALPHA_THRESHOLD = 0.9;

export type PartRole = "body" | "wheel" | "tire" | "glass" | "trim" | "interior";

/** Роль, назначаемая всем мешам файла целиком, без разбора геометрии. */
export type FileRole = "exterior" | "interior";

export const FILE_ROLES: Record<keyof typeof MODEL_FILES, FileRole> = {
  body: "exterior",
  kit: "exterior",
  interior: "interior",
  wheel: "interior",
};
