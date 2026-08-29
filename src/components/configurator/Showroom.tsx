import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";

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

/* Вертикальная растяжка циклорамы: за машиной приглушённое световое гало,
   выше и по краям кадра уходит почти в чёрное. Тёмный павильон с одним
   пятном света — так снимают ателье, и чёрный кузов на нём читается
   контуром. Белый задник, который тут был до этого, наоборот съедал
   машину: силуэт получался светлее фона только по бликам. */
const COVE_STOPS = {
  light: ["#575c61", "#41464a", "#2c3033", "#1b1e20", "#111315"],
  dark: ["#23262a", "#1c1f22", "#15181b", "#101215", "#0a0b0d"],
} as const;

/* Пол: светлый круг под машиной, к краю гаснет ровно в нижний стоп
   циклорамы (#575c61) — иначе на горизонте читается ступенька яркости и по
   кадру идёт дуга там, где круг пола встречается со скруглением. Опору под
   машиной держит не тёмный пол, а контактная тень (SoftGroundShadow). */
const FLOOR_STOPS = {
  light: ["#9aa0a6", "#767c81", "#575c61"],
  dark: ["#1c1f22", "#17191c", "#121416"],
} as const;

/* Тот же пол под отражающим материалом. Отражение считается материалом, который
   освещается сценой, а дневной софтбокс силой 7 плюс ambient добавляют к каждому
   каналу около половины шкалы — нарисованный светлый градиент от этого уходит в
   чистый белый, и пятно под машиной пропадает вместе с контактной тенью.
   Поэтому для отражающего варианта градиент нарисован заметно темнее: после
   освещения он приходит примерно туда, где неосвещаемый был изначально. */
const FLOOR_STOPS_REFLECTIVE = {
  light: ["#41454a", "#31353a", "#22262a"],
  dark: ["#141619", "#101215", "#0b0d0f"],
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

function useFloorTexture(dark: boolean, reflective = false) {
  return useDisposable(
    useMemo(
      () =>
        gradientTexture(
          (ctx) => ctx.createRadialGradient(256, 256, 30, 256, 256, 256),
          (reflective ? FLOOR_STOPS_REFLECTIVE : FLOOR_STOPS)[dark ? "dark" : "light"],
          FLOOR_OFFSETS,
          512,
          512,
        ),
      [dark, reflective],
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

function Floor({ dark, reflections }: { dark: boolean; reflections: boolean }) {
  const tex = useFloorTexture(dark, reflections);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={dark}>
        <circleGeometry args={[COVE_RADIUS + 0.12, 128]} />
        {/* Ночью пол освещается сценой и слегка зеркалит — под машиной иначе
            проваливается пустота.

            Днём — как задник, без освещения: со стандартным материалом верхний
            софтбокс силой 7 плюс ambient и направленный добавляли к каждому
            каналу около половины шкалы, и любая светлая заливка упиралась в
            白 — проверка чистым красным давала розовый. С basic на пол ложится
            ровно нарисованный градиент, поэтому световое пятно управляемое. */}
        {reflections ? (
          /* Отражение кузова в полу — то, чем студийный рендер отличается от
             картинки из браузера. Считается отдельным проходом и только когда
             кадр перерисовывается: у канваса frameloop="demand", поэтому в
             покое отражение не стоит ничего.

             mixStrength держим низким: полное зеркало превращает павильон в
             каток и спорит с контактной тенью. Нужен влажный бетон, а не лёд.
             blur по горизонтали вчетверо сильнее, чем по вертикали, — так
             отражение вытягивается вниз и не читается как вторая машина. */
          <MeshReflectorMaterial
            map={tex}
            resolution={1024}
            mixBlur={1.1}
            mixStrength={dark ? 2.4 : 1.5}
            blur={[420, 110]}
            depthScale={1.1}
            minDepthThreshold={0.35}
            maxDepthThreshold={1.35}
            roughness={dark ? 0.82 : 0.9}
            metalness={0.1}
            mirror={0}
          />
        ) : dark ? (
          <meshStandardMaterial map={tex} roughness={0.64} metalness={0.18} />
        ) : (
          <meshBasicMaterial map={tex} toneMapped={false} />
        )}
      </mesh>
      {/* Разметку площадки — два кольца поворотного круга — убрал. В студийной
          съёмке ателье пол чистый: любая линия на полу спорит с машиной и
          выдаёт, что это сцена, а не павильон. */}
    </group>
  );
}

/**
 * @param reflections Отражать ли машину в полу. На телефоне выключено: лишний
 *   проход рендера на каждый кадр там стоит заметно дороже, чем выглядит.
 */
export default function Showroom({
  night,
  reflections,
}: {
  night: boolean;
  reflections: boolean;
}) {
  return (
    <group>
      <Cove dark={night} />
      <Floor dark={night} reflections={reflections} />
    </group>
  );
}
