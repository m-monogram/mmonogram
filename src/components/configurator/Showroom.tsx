import { useEffect, useMemo } from "react";
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

/* Пол: радиальный градиент в цвет циклорамы, стык с ней не читается.
   Светлые тона на пару ступеней темнее задника: пол освещается сценой и
   окружением, и на прежних значениях он выбивался в тот же белый, что и
   циклорама, — машина оставалась без опоры, а контактная тень пропадала. */
const FLOOR_STOPS = {
  light: ["#989ea3", "#aab0b5", "#bbc0c4"],
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

/* Каждая текстура и решётка живут в видеопамяти до явного dispose. Showroom
   пересоздаётся по key при переключении «студия ↔ гараж», и без освобождения
   каждое переключение оставляло в GPU по паре мегабайт. */
function useDisposable<T extends { dispose(): void }>(value: T): T {
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

function useCoveTexture(dark: boolean) {
  return useDisposable(
    useMemo(
      () =>
        gradientTexture(
          (ctx) => ctx.createLinearGradient(0, 512, 0, 0),
          COVE_STOPS[dark ? "dark" : "light"],
          COVE_OFFSETS,
          4,
          512,
        ),
      [dark],
    ),
  );
}

function useFloorTexture(dark: boolean) {
  return useDisposable(
    useMemo(
      () =>
        gradientTexture(
          (ctx) => ctx.createRadialGradient(256, 256, 30, 256, 256, 256),
          FLOOR_STOPS[dark ? "dark" : "light"],
          FLOOR_OFFSETS,
          512,
          512,
        ),
      [dark],
    ),
  );
}

/* Профиль вращается вокруг оси Y, шва не видно ни с одного ракурса.
   Скругление выходит из пола касательно и приходит в стену вертикально —
   иначе на горизонте читается линия стыка. */
function useCoveGeometry() {
  return useDisposable(useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2);
      pts.push(new THREE.Vector2(COVE_RADIUS + COVE_FILLET * Math.sin(a), COVE_FILLET * (1 - Math.cos(a))));
    }
    pts.push(new THREE.Vector2(COVE_RADIUS + COVE_FILLET, 18));
    return new THREE.LatheGeometry(pts, 96);
  }, []));
}

function Cove({ dark }: { dark: boolean }) {
  const tex = useCoveTexture(dark);
  const geom = useCoveGeometry();
  /* Циклорама — задник, а не освещаемый предмет. Со стандартным материалом её
     красил свет сцены: днём при направленном источнике 1.45 весь верх выбивало
     в чистый белый, а на горизонте проступала жёсткая линия — там, где
     скругление переходит в стену, свет падает под другим углом, и это ровно
     тот шов, ради отсутствия которого скругление и строилось. Без освещения
     на задник ложится ровно тот градиент, который нарисован. */
  return (
    <mesh geometry={geom}>
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function Floor({ dark }: { dark: boolean }) {
  const tex = useFloorTexture(dark);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={dark}>
        <circleGeometry args={[COVE_RADIUS + 0.12, 128]} />
        {/* Ночью пол освещается сценой и слегка зеркалит — под машиной иначе
            проваливается пустота.

            Днём — как задник, без освещения. Верхний софтбокс студии светит с
            силой 7, ambient и направленный добавляют сверху ещё столько же:
            измерено, что к каждому каналу пола прибавляется около половины
            шкалы. Любая светлая заливка после этого упирается в белый —
            проверка чистым красным дала розовый. Пол сливался с циклорамой,
            машина оставалась без опоры, а вместе с полом пропадала и тень.
            Контактную тень при этом рисует отдельная подложка
            (SoftGroundShadow), так что видимую тень мы не теряем. */}
        {dark ? (
          <meshStandardMaterial map={tex} roughness={0.64} metalness={0.18} />
        ) : (
          <meshBasicMaterial map={tex} toneMapped={false} />
        )}
      </mesh>
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.16, 160]} />
        <meshBasicMaterial color={dark ? "#dfe8ff" : "#ffffff"} transparent opacity={dark ? 0.18 : 0.12} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.6, 7.66, 192]} />
        <meshBasicMaterial color={dark ? "#8090a0" : "#ffffff"} transparent opacity={dark ? 0.12 : 0.1} toneMapped={false} />
      </mesh>
    </group>
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
