/**
 * Подключение оцифрованных моделей M-Monogram к конфигуратору.
 *
 * Все четыре файла выгружены из одной сцены: они уже в метрах, осью Y вверх,
 * с общим началом координат — машина тянется от Z = -4.2 до Z = 0.7, салон и
 * руль стоят внутри неё. Поэтому трансформ считается по кузову и применяется
 * ко всем файлам сразу.
 *
 * Материалы сохранили осмысленные имена (Car Paint, glass.001, chrome.001),
 * так что роль части берётся из них. Имена мешей, наоборот, достались от
 * заводского CAD и от Blender вперемешку — на них не опираемся.
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

/** Роль части в сборке: определяет, каким материалом она будет покрашена. */
export type PartRole =
  | "body"      // кузовные панели — красятся выбранной краской
  | "wheel"     // диски — красятся выбранной отделкой
  | "tire"      // покрышки
  | "glass"     // остекление
  | "taillight" // красные рассеиватели фонарей
  | "light"     // светящиеся элементы фар
  | "chrome"
  | "carbon"
  | "interior"  // всё внутри салона
  | "trim";     // остальной чёрный пластик и мелочь

/**
 * Роль по имени материала. Модели пришли с осмысленными именами
 * (Car Paint, glass.001, chrome.001, light on _1.001), и это надёжнее любой
 * геометрической эвристики. Порядок важен: правила проверяются сверху вниз,
 * а имена перекрываются — «Rolls royce car paint» на дисках содержит
 * «car paint», «glass_0» это красный фонарь, а не окно.
 */
export const MATERIAL_RULES: ReadonlyArray<{ test: RegExp; role: PartRole }> = [
  { test: /light\s*on/i, role: "light" },
  { test: /glass_0|qara_0/i, role: "taillight" },
  { test: /glass/i, role: "glass" },
  { test: /rolls\s*royce\s*car\s*paint/i, role: "wheel" },
  { test: /car\s*paint|painted\s*plastic/i, role: "body" },
  { test: /chrome/i, role: "chrome" },
  { test: /carbon/i, role: "carbon" },
  { test: /leather/i, role: "interior" },
  { test: /piano/i, role: "trim" },
];

/**
 * Роль по имени меша. Проверяется раньше материалов: в файле обвеса диски
 * покрашены тем же «Car Paint», что и кузов, и по материалу отличить их
 * нельзя. Зато в имени каждого диска стоит разболтовка — 5x130 у G-Class.
 */
export const MESH_RULES: ReadonlyArray<{ test: RegExp; role: PartRole }> = [
  { test: /\d+x\d+_ET\d+|_5x130_/i, role: "wheel" },
];

/** Полированный металл: хром узнаётся по свойствам, даже когда назван Material.016. */
export const CHROME_PROPS = { minMetalness: 0.95, maxRoughness: 0.15 } as const;

/** Ниже этой высоты (доля от высоты машины) начинается колёсная зона. */
export const WHEEL_ZONE_TOP = 0.45;

/** Тёмная деталь в колёсной зоне — покрышка; светлая — диск. */
export const TIRE_MAX_LUMA = 0.25;

/** Прозрачность материала, ниже которой деталь считается остеклением. */
export const GLASS_ALPHA_THRESHOLD = 0.9;

/** Роль, назначаемая всем мешам файла целиком, без разбора материалов. */
export type FileRole = "exterior" | "interior";

export const FILE_ROLES: Record<keyof typeof MODEL_FILES, FileRole> = {
  body: "exterior",
  kit: "exterior",
  interior: "interior",
  wheel: "interior",
};
