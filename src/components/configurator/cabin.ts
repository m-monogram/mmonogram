/**
 * Габариты салона — общие для кузова и интерьера.
 * Вынесены в отдельный модуль: GClassModel импортирует Interior, поэтому
 * обратный импорт констант из GClassModel давал цикл и TDZ-ошибку.
 *
 * Колодец салона вырезан в объёме кузова (см. useBodyGeometry): без выреза
 * экструзия остаётся сплошной до подоконной линии и мебель тонет в кузове.
 */
export const CABIN_FLOOR_Y = 0.86;
export const CABIN_FRONT_X = 0.84;
export const CABIN_REAR_X = -2.12;
export const CABIN_SIDE_Z = 0.87;
export const CABIN_ROOF_Y = 1.8;
export const CABIN_BELT_Y = 1.18;

export const CABIN_LEN = CABIN_FRONT_X - CABIN_REAR_X;
export const CABIN_MID_X = (CABIN_FRONT_X + CABIN_REAR_X) / 2;
