/**
 * Ключевые запросы, под которые пишутся заголовки и описания страниц.
 *
 * Список не выдуман: он собран по выдаче конкурентов и профильных площадок
 * в августе 2026 года — Mansory, Brabus, Larte Design, Urban Automotive,
 * Vorsteiner, Carbonov и Kubay Design в Дубае, плюс материалы Carscoops и
 * ТопЖир про наш собственный G 3.0 Iconic. Отсюда видно, какими словами
 * рынок называет то, что мы делаем, а какими — нет.
 *
 * Правило: марки чужих ателье (Brabus, Mansory) в заголовки и описания не
 * идут. Запросы по ним есть, но чужой товарный знак в своей выдаче — это
 * и юридический риск, и обещание, которого мы не выполняем. Стиль называем
 * стилем: «Maybach-style grille» — честно, «Maybach modifications» — нет.
 */

/** Что мы делаем — ядро тематики. */
export const CRAFT = [
  "G-Class customization",
  "G-Wagon body kit",
  "G63 body kit",
  "widebody G63",
  "forged wheels",
  "carbon fibre body kit",
  "bespoke car customization",
  "coachbuilding",
  "custom luxury SUV",
  "interior retrim",
] as const;

/** Где мы это делаем — локальная выдача даёт самый тёплый трафик. */
export const PLACE = [
  "Dubai",
  "luxury car customization Dubai",
  "car tuning Dubai",
  "G-Wagon tuning Dubai",
  "bespoke car atelier Dubai",
  "UAE",
] as const;

/** Как нас ищут по имени — брендовые запросы и названия проектов. */
export const BRAND = [
  "M Monogram",
  "M-Monogram atelier",
  "M Monogram ICONIC",
  "G 3.0 Iconic",
  "M Monogram G-Class",
] as const;

/** Вторая линейка — Rolls-Royce. */
export const COACHBUILD = [
  "Rolls-Royce customization",
  "Rolls-Royce coachbuild",
  "bespoke Rolls-Royce",
  "custom Rolls-Royce Dubai",
] as const;

/** Собрать список ключей для страницы без повторов. */
export const merge = (...groups: readonly (readonly string[])[]): string[] => [
  ...new Set(groups.flat()),
];
