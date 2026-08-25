import { useMemo } from "react";
import * as THREE from "three";

/**
 * Окружение конфигуратора: круговая бесшовная циклорама (infinity cove)
 * и пол под ней. Работает с любого угла орбиты — шва не видно.
 *
 * Светлая и тёмная версии отличаются только палитрой: в обеих машина стоит
 * в чистой студии, ничто не спорит с ней за внимание. Геометрия строится
 * процедурно, текстуры рисуются на canvas, поэтому внешних файлов нет.
 */

const COVE_RADIUS = 10;
const COVE_FILLET = 5.5;

/* Вертикальная растяжка циклорамы: светлее у пола, мягко темнеет кверху */
const COVE_STOPS = {
  light: ["#dcdfe2", "#d2d6d9", "#c3c8cc", "#b2b7bc", "#a3a8ad"],
  dark: ["#23262a", "#1c1f22", "#15181b", "#101215", "#0a0b0d"],
} as const;

/* Пол: радиальный градиент в цвет циклорамы, стык с ней не читается */
const FLOOR_STOPS = {
  light: ["#b7bbbf", "#c9cdd0", "#d7dadd"],
  dark: ["#1c1f22", "#17191c", "#121416"],
} as const;

const COVE_OFFSETS = [0, 0.3, 0.6, 0.82, 1];
const FLOOR_OFFSETS = [0, 0.5, 1];

function gradientTexture(
  draw: (ctx: CanvasRenderingContext2D, size: number) => CanvasGradient,
  stops: readonly string[],
  offsets: readonly number[],
  width: number,
  height: number,
) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  const g = draw(ctx, Math.max(width, height));
  stops.forEach((color, i) => g.addColorStop(offsets[i], color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function useCoveTexture(dark: boolean) {
  return useMemo(
    () =>
      gradientTexture(
        (ctx) => ctx.createLinearGradient(0, 512, 0, 0),
        COVE_STOPS[dark ? "dark" : "light"],
        COVE_OFFSETS,
        4,
        512,
      ),
    [dark],
  );
}

function useFloorTexture(dark: boolean) {
  return useMemo(
    () =>
      gradientTexture(
        (ctx) => ctx.createRadialGradient(256, 256, 30, 256, 256, 256),
        FLOOR_STOPS[dark ? "dark" : "light"],
        FLOOR_OFFSETS,
        512,
        512,
      ),
    [dark],
  );
}

/* Профиль вращается вокруг оси Y, шва не видно ни с одного ракурса.
   Скругление выходит из пола касательно и приходит в стену вертикально —
   иначе на горизонте читается линия стыка. */
function useCoveGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2);
      pts.push(new THREE.Vector2(COVE_RADIUS + COVE_FILLET * Math.sin(a), COVE_FILLET * (1 - Math.cos(a))));
    }
    pts.push(new THREE.Vector2(COVE_RADIUS + COVE_FILLET, 18));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
}

function Cove({ dark }: { dark: boolean }) {
  const tex = useCoveTexture(dark);
  const geom = useCoveGeometry();
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial map={tex} side={THREE.BackSide} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function Floor({ dark }: { dark: boolean }) {
  const tex = useFloorTexture(dark);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[COVE_RADIUS + 0.12, 96]} />
      {/* В темноте пол чуть зеркальнее: иначе под машиной проваливается пустота */}
      <meshStandardMaterial map={tex} roughness={dark ? 0.55 : 0.62} metalness={dark ? 0.28 : 0.2} />
    </mesh>
  );
}

export default function Showroom({ night }: { night: boolean }) {
  return (
    <group>
      <Cove dark={night} />
      <Floor dark={night} />
    </group>
  );
}
