import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, N8AO } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import GClassModel from "./GClassModel";
import DetailingBay from "./DetailingBay";
import { BuildConfig, type CameraFocus } from "./config";

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
    mobile: { azimuth: 44, polar: 76, distance: 11.8, target: [0, 0.35, 0] },
  },
  exterior: {
    desktop: { azimuth: 78, polar: 80, distance: 7.0, target: [0, 0.85, 0] },
    mobile: { azimuth: 78, polar: 80, distance: 10.5, target: [0, 0.4, 0] },
  },
  wheels: {
    desktop: { azimuth: 52, polar: 83, distance: 3.6, target: [1.45, 0.55, 0.4] },
    mobile: { azimuth: 52, polar: 83, distance: 4.6, target: [1.45, 0.35, 0.3] },
  },
  kit: {
    desktop: { azimuth: 148, polar: 77, distance: 7.4, target: [-0.4, 0.85, 0] },
    mobile: { azimuth: 148, polar: 77, distance: 10.8, target: [-0.4, 0.4, 0] },
  },
  carbon: {
    desktop: { azimuth: 26, polar: 55, distance: 5.6, target: [1.1, 1.05, 0] },
    mobile: { azimuth: 26, polar: 55, distance: 7.6, target: [1.1, 0.7, 0] },
  },
  lights: {
    desktop: { azimuth: 8, polar: 79, distance: 5.8, target: [1.6, 0.85, 0] },
    mobile: { azimuth: 8, polar: 79, distance: 7.8, target: [1.6, 0.5, 0] },
  },
  env: {
    desktop: { azimuth: 60, polar: 70, distance: 9.0, target: [0, 0.9, 0] },
    mobile: { azimuth: 60, polar: 70, distance: 13.0, target: [0, 0.35, 0] },
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
      const introPreset: CameraPreset = {
        ...preset,
        azimuth: preset.azimuth - 38,
        polar: 72,
        distance: preset.distance * 1.22,
      };
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

/* Любое изменение конфигурации должно перерисовать кадр в demand-режиме */
function InvalidateOnConfig({ config }: { config: BuildConfig }) {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [config, invalidate]);
  return null;
}

/**
 * Кубкарта только для бликов на ЛКП — фон рисует DetailingBay, не HDRI.
 */
function StudioEnvironment({ night }: { night: boolean }) {
  return (
    <Environment resolution={512} frames={1} background={false}>
      <Lightformer intensity={night ? 5 : 8} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 8, 1]} />
      <Lightformer intensity={night ? 1.2 : 2.2} position={[-7, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[10, 1.4, 1]} />
      <Lightformer intensity={night ? 1.2 : 2.2} position={[7, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 1.4, 1]} />
      <Lightformer intensity={night ? 0.9 : 1.6} position={[0, 2.4, 8]} rotation={[0, Math.PI, 0]} scale={[8, 1.6, 1]} />
      <Lightformer intensity={night ? 0.7 : 1.3} position={[0, 2.4, -8]} scale={[8, 1.6, 1]} />
    </Environment>
  );
}

export default function ConfiguratorScene({ config, focus = "default" }: { config: BuildConfig; focus?: CameraFocus }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const flightRef = useRef<FlightState | null>(null);
  const bg = config.night ? "#121416" : "#e6e8eb";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows
      /* always — Environment/Lightformer + demand loop can stall on a blank frame */
      frameloop="always"
      dpr={[1, 1.75]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: isMobile ? [8.6, 3.1, 8.4] : [5.4, 2.1, 5.2], fov: 38 }}
      className="touch-none"
    >
      <color attach="background" args={[bg]} />

      <InvalidateOnConfig config={config} />
      <CameraRig focus={focus} isMobile={isMobile} controlsRef={controls} flightRef={flightRef} />

      <Suspense fallback={null}>
        <StudioEnvironment night={config.night} />

        <ambientLight intensity={config.night ? 0.22 : 0.55} />
        <hemisphereLight
          color={config.night ? "#8aa0c8" : "#f3f5f8"}
          groundColor={config.night ? "#1a1c20" : "#b8bcc2"}
          intensity={config.night ? 0.35 : 0.55}
        />
        <directionalLight
          position={[4.5, 7.2, 3.2]}
          intensity={config.night ? 0.85 : 1.85}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
        />
        <spotLight
          position={[0, 4.8, 0]}
          angle={0.85}
          penumbra={0.55}
          intensity={config.night ? 1.8 : 2.6}
          color={config.night ? "#c8d4ff" : "#ffffff"}
        />
        {config.night && <pointLight position={[-5, 2.4, -3]} intensity={6} color="#3d5a80" />}

        <DetailingBay key={config.night ? "night" : "day"} night={config.night} />
        <GClassModel config={config} />

        <ContactShadows position={[0, 0.015, 0]} opacity={config.night ? 0.7 : 0.45} scale={12} blur={1.6} far={2.8} resolution={512} />

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
        maxDistance={11.5}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.2}
        target={[0, isMobile ? 0.35 : 0.9, 0]}
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
