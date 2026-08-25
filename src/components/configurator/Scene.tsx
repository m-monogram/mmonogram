import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, N8AO } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import GClassModel from "./GClassModel";
import Showroom from "./Showroom";
import { BuildConfig, type CameraFocus } from "./config";

export type { CameraFocus };



/**
 * Пресеты камер, привязанные к разделам панели — как orbit-пресеты у Mansory:
 * открыл «Диски» — камера сама подлетела к переднему колесу.
 * azimuth — угол от оси +X (перед машины) к +Z, в градусах; polar — от зенита.
 */
interface CameraPreset {
  azimuth: number;
  polar: number;
  distance: number;
  target: [number, number, number];
}

const PRESETS: Record<CameraFocus, { desktop: CameraPreset; mobile: CameraPreset }> = {
  default: {
    desktop: { azimuth: 44, polar: 76, distance: 7.6, target: [0, 0.9, 0] },
    mobile: { azimuth: 44, polar: 74, distance: 11.0, target: [0, -0.45, 0] },
  },
  exterior: {
    desktop: { azimuth: 78, polar: 80, distance: 7.0, target: [0, 0.85, 0] },
    mobile: { azimuth: 78, polar: 78, distance: 10.2, target: [0, -0.4, 0] },
  },
  wheels: {
    desktop: { azimuth: 52, polar: 83, distance: 3.6, target: [1.45, 0.55, 0.4] },
    mobile: { azimuth: 52, polar: 81, distance: 4.6, target: [1.45, -0.25, 0.3] },
  },
  kit: {
    desktop: { azimuth: 148, polar: 77, distance: 7.4, target: [-0.4, 0.85, 0] },
    mobile: { azimuth: 148, polar: 75, distance: 10.4, target: [-0.4, -0.4, 0] },
  },
  carbon: {
    desktop: { azimuth: 26, polar: 55, distance: 5.6, target: [1.1, 1.05, 0] },
    mobile: { azimuth: 26, polar: 55, distance: 7.6, target: [1.1, -0.1, 0] },
  },
  lights: {
    desktop: { azimuth: 8, polar: 79, distance: 5.8, target: [1.6, 0.85, 0] },
    mobile: { azimuth: 8, polar: 77, distance: 7.6, target: [1.6, -0.25, 0] },
  },
  env: {
    desktop: { azimuth: 60, polar: 70, distance: 9.0, target: [0, 0.9, 0] },
    mobile: { azimuth: 60, polar: 70, distance: 11.0, target: [0, -0.45, 0] },
  },
};

function presetToPosition(p: CameraPreset): THREE.Vector3 {
  const azimuth = THREE.MathUtils.degToRad(p.azimuth);
  const polar = THREE.MathUtils.degToRad(p.polar);
  return new THREE.Vector3(
    p.target[0] + p.distance * Math.sin(polar) * Math.cos(azimuth),
    p.target[1] + p.distance * Math.cos(polar),
    p.target[2] + p.distance * Math.sin(polar) * Math.sin(azimuth)
  );
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface FlightState {
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  start: number;
  duration: number;
}

/**
 * Перелёты камеры к пресетам (0.9 с, ease-in-out) + интро-облёт при загрузке.
 * Работает при frameloop="demand": пока летим — invalidate() каждый кадр,
 * долетели — цикл рендера останавливается и GPU простаивает.
 */
function CameraRig({
  focus,
  isMobile,
  controlsRef,
  flightRef,
}: {
  focus: CameraFocus;
  isMobile: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  flightRef: React.MutableRefObject<FlightState | null>;
}) {
  const { camera, invalidate } = useThree();
  const mounted = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    const preset = PRESETS[focus][isMobile ? "mobile" : "desktop"];
    const toPos = presetToPosition(preset);
    const toTarget = new THREE.Vector3(...preset.target);

    if (!mounted.current) {
      // Интро-облёт: стартуем издалека и сверху, плавно прилетаем к дефолту
      mounted.current = true;
      const introPreset: CameraPreset = { ...preset, azimuth: preset.azimuth - 55, polar: 55, distance: preset.distance * 1.9 };
      camera.position.copy(presetToPosition(introPreset));
      flightRef.current = {
        fromPos: camera.position.clone(),
        toPos,
        fromTarget: toTarget.clone(),
        toTarget,
        start: performance.now(),
        duration: 2200,
      };
    } else {
      flightRef.current = {
        fromPos: camera.position.clone(),
        toPos,
        fromTarget: controls ? controls.target.clone() : toTarget.clone(),
        toTarget,
        start: performance.now(),
        duration: 900,
      };
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, isMobile]);

  useFrame(() => {
    const flight = flightRef.current;
    const controls = controlsRef.current;
    if (!flight || !controls) return;
    const t = Math.min(1, (performance.now() - flight.start) / flight.duration);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(flight.fromPos, flight.toPos, e);
    controls.target.lerpVectors(flight.fromTarget, flight.toTarget, e);
    controls.update();
    if (t >= 1) {
      flightRef.current = null;
    } else {
      invalidate();
    }
  });

  return null;
}

/**
 * Камера физически не должна выходить за стены и потолок помещения.
 * Предел по высоте зависит от текущей дистанции, поэтому minPolarAngle
 * пересчитывается каждый кадр: вблизи можно смотреть почти сверху,
 * издалека — только с уровня зала.
 */
function ConfineCamera({
  night,
  controlsRef,
}: {
  night: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}) {
  const { camera } = useThree();
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const ceiling = night ? 5.6 : 10.5; // потолок гаража / высота циклорамы
    const distance = camera.position.distanceTo(controls.target);
    const headroom = ceiling - controls.target.y;
    const minPolar = distance > headroom ? Math.acos(Math.min(1, headroom / distance)) : 0.12;
    controls.minPolarAngle = Math.max(0.12, minPolar);
    // и не опускаться ниже пола
    const floorGap = 0.55 - controls.target.y;
    const maxPolar = distance > Math.abs(floorGap) ? Math.acos(Math.max(-1, floorGap / distance)) : Math.PI / 2.05;
    controls.maxPolarAngle = Math.min(Math.PI / 2.02, maxPolar);
  });
  return null;
}

/* Любое изменение конфигурации должно перерисовать кадр в demand-режиме */
function InvalidateOnConfig({ config }: { config: BuildConfig }) {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [config, invalidate]);
  return null;
}

/**
 * Прогрев demand-режима: текстуры, кубкарта окружения и буфер отражений
 * готовы не в первом кадре. Без этого сцена может остаться пустой до первого
 * действия пользователя, поэтому пару секунд после монтирования просим кадры.
 */
function WarmUpFrames() {
  const { invalidate } = useThree();
  useEffect(() => {
    let raf = 0;
    const started = performance.now();
    const tick = () => {
      invalidate();
      if (performance.now() - started < 2500) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
}

/**
 * Окружение рендерится в кубкарту локально — без загрузки HDRI с внешних CDN.
 * Studio: большой верхний софтбокс и боковые панели.
 * Showroom: три продольные потолочные панели, повторяющие LED-полосы гаража,
 * чтобы отражения в лаке совпадали с тем, что видно в помещении.
 */
function SceneEnvironment({ night }: { night: boolean }) {
  return (
    <Environment resolution={night ? 512 : 256} frames={1}>
      <color attach="background" args={[night ? "#08090a" : "#3a3d40"]} />
      {night ? (
        <>
          {[-5.4, 0, 5.4].map((z) => (
            <Lightformer
              key={z}
              form="rect"
              intensity={9}
              position={[0, 6.3, z]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[19, 0.8, 1]}
            />
          ))}
          <Lightformer intensity={0.6} position={[-13, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[9, 3, 1]} />
          <Lightformer intensity={0.6} position={[13, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[9, 3, 1]} />
        </>
      ) : (
        <>
          <Lightformer intensity={7} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 6, 1]} />
          <Lightformer intensity={2.5} position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 1.2, 1]} />
          <Lightformer intensity={2.5} position={[6, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 1.2, 1]} />
          <Lightformer intensity={1.8} position={[0, 2, 7]} rotation={[0, Math.PI, 0]} scale={[7, 1.5, 1]} />
          <Lightformer intensity={1.4} position={[0, 2, -7]} scale={[7, 1.5, 1]} />
        </>
      )}
    </Environment>
  );
}

export default function ConfiguratorScene({ config, focus = "default" }: { config: BuildConfig; focus?: CameraFocus }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const flightRef = useRef<FlightState | null>(null);
  const bg = config.night ? "#08090a" : "#c7cbce";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: isMobile ? [7.9, 2.6, 7.6] : [5.4, 2.1, 5.2], fov: 38 }}
      className="touch-none"
    >
      <color attach="background" args={[bg]} />

      <InvalidateOnConfig config={config} />
      <ConfineCamera night={config.night} controlsRef={controls} />
      <CameraRig focus={focus} isMobile={isMobile} controlsRef={controls} flightRef={flightRef} />

      <Suspense fallback={null}>
        <SceneEnvironment night={config.night} />

        <ambientLight intensity={config.night ? 0.55 : 0.45} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={config.night ? 1.25 : 1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <GClassModel config={config} />

        <Showroom key={config.night ? "night" : "day"} night={config.night} />
        <WarmUpFrames />
        <ContactShadows position={[0, 0.012, 0]} opacity={config.night ? 0.9 : 0.62} scale={12} blur={2.2} far={3} resolution={512} />

        {/* «Дорогая картинка» по пресету MANSORY — Quality: SAO в стыках,
            аккуратный bloom только на бликах, лёгкая студийная десатурация.
            На мобильных AO в половинном разрешении (ТЗ 6.9). */}
        <EffectComposer multisampling={isMobile ? 0 : 4}>
          <N8AO aoRadius={0.5} intensity={4} distanceFalloff={1} quality={isMobile ? "performance" : "medium"} halfRes={isMobile} />
          <Bloom intensity={0.15} luminanceThreshold={0.95} luminanceSmoothing={0.2} mipmapBlur />
          <BrightnessContrast contrast={-0.01} />
          <HueSaturation saturation={-0.05} />
        </EffectComposer>
      </Suspense>

      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={3.0}
        maxDistance={config.night ? 11.5 : 12.5}
        target={[0, isMobile ? -0.45 : 0.9, 0]}
        enableDamping
        dampingFactor={0.08}
        onStart={() => {
          /* пользователь взялся за орбиту — прерываем перелёт */
          flightRef.current = null;
        }}
      />
    </Canvas>
  );
}
