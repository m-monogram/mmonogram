/**
 * Пресеты и состояние 3D-конфигуратора.
 * Состояние кодируется в URL (?c=colorIdx-rimIdx-rimColorIdx-kit-carbon-lights-env),
 * чтобы сборкой можно было делиться ссылкой — как у Mansory.
 */

export interface PaintOption {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
}

export interface RimDesign {
  id: string;
  name: string;
}

export interface RimFinish {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
}

export const PAINTS: PaintOption[] = [
  { id: "obsidian", name: "Obsidian Black", color: "#0b0b0d", metalness: 0.9, roughness: 0.32 },
  { id: "polar", name: "Polar White", color: "#e8e8e6", metalness: 0.55, roughness: 0.3 },
  { id: "nardo", name: "Nardo Grey", color: "#7d8287", metalness: 0.6, roughness: 0.34 },
  { id: "emerald", name: "Emerald", color: "#0e3d2c", metalness: 0.85, roughness: 0.3 },
  { id: "oxblood", name: "Oxblood", color: "#4a0f14", metalness: 0.85, roughness: 0.3 },
  { id: "aurum", name: "Desert Aurum", color: "#8a6d3b", metalness: 0.95, roughness: 0.28 },
];

export const RIM_DESIGNS: RimDesign[] = [
  { id: "monoblock", name: "MG.1 Monoblock" },
  { id: "multispoke", name: "MG.7 Multi-Spoke" },
  { id: "crossspoke", name: "MG.9 Cross-Spoke" },
];

export const RIM_FINISHES: RimFinish[] = [
  { id: "graphite", name: "Graphite", color: "#26282b", metalness: 0.9, roughness: 0.35 },
  { id: "silver", name: "Brushed Silver", color: "#b9bec4", metalness: 1.0, roughness: 0.25 },
  { id: "gold", name: "Champagne Gold", color: "#9c7c45", metalness: 1.0, roughness: 0.28 },
];

export interface BuildConfig {
  paint: number;
  rim: number;
  rimFinish: number;
  kit: boolean;
  carbon: boolean;
  lights: boolean;
  night: boolean;
}

export const DEFAULT_CONFIG: BuildConfig = {
  paint: 0,
  rim: 1,
  rimFinish: 0,
  kit: true,
  carbon: true,
  lights: false,
  night: false,
};

/* Первый сегмент — версия схемы: старые ссылки не ломаются при добавлении опций */
const SCHEMA_VERSION = 1;

export function encodeConfig(c: BuildConfig): string {
  return [SCHEMA_VERSION, c.paint, c.rim, c.rimFinish, +c.kit, +c.carbon, +c.lights, +c.night].join("-");
}

export function decodeConfig(raw: string | null): BuildConfig {
  if (!raw) return DEFAULT_CONFIG;
  let p = raw.split("-").map((n) => parseInt(n, 10));
  if (p.some((n) => Number.isNaN(n))) return DEFAULT_CONFIG;
  // Версионированный код: первый сегмент — версия; 7 сегментов — легаси-ссылки без версии
  if (p.length === 8 && p[0] === 1) p = p.slice(1);
  if (p.length !== 7) return DEFAULT_CONFIG;
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return {
    paint: clamp(p[0], PAINTS.length - 1),
    rim: clamp(p[1], RIM_DESIGNS.length - 1),
    rimFinish: clamp(p[2], RIM_FINISHES.length - 1),
    kit: p[3] === 1,
    carbon: p[4] === 1,
    lights: p[5] === 1,
    night: p[6] === 1,
  };
}
