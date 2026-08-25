import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import GClassModel from "./GClassModel";
import { BuildConfig } from "./config";

/**
 * Студийное окружение собрано из Lightformer-панелей и рендерится в кубкарту
 * локально — без загрузки HDRI с внешних CDN, поэтому работает офлайн и
 * не зависит от сторонних хостов.
 */
function StudioEnvironment({ night }: { night: boolean }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={[night ? "#050505" : "#3a3d40"]} />
      {/* Верхний софтбокс */}
      <Lightformer intensity={night ? 4 : 7} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 6, 1]} />
      {/* Боковые панели — длинные блики на бортах */}
      <Lightformer intensity={night ? 1.5 : 2.5} position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 1.2, 1]} />
      <Lightformer intensity={night ? 1.5 : 2.5} position={[6, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 1.2, 1]} />
      {/* Передняя и задняя подсветка */}
      <Lightformer intensity={night ? 1 : 1.8} position={[0, 2, 7]} rotation={[0, Math.PI, 0]} scale={[7, 1.5, 1]} />
      <Lightformer intensity={night ? 0.8 : 1.4} position={[0, 2, -7]} scale={[7, 1.5, 1]} />
    </Environment>
  );
}

export default function ConfiguratorScene({ config }: { config: BuildConfig }) {
  const controls = useRef<OrbitControlsImpl>(null);
  // Плавное авто-вращение до первого касания пользователем
  const [autoSpin, setAutoSpin] = useState(true);
  const bg = config.night ? "#070708" : "#c7cbce";
  const floor = config.night ? "#0b0b0c" : "#b4b8bb";
  // На узких экранах машина видна в верхней половине над панелью — отходим дальше
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: isMobile ? [8.6, 3.1, 8.4] : [5.4, 2.1, 5.2], fov: 38 }}
      className="touch-none"
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 18, 40]} />

      <Suspense fallback={null}>
        <StudioEnvironment night={config.night} />

        <ambientLight intensity={config.night ? 0.15 : 0.45} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={config.night ? 0.7 : 1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        {config.night && <pointLight position={[-4, 3, -4]} intensity={6} color="#3d5a80" />}

        <group position={[0, 0, 0]}>
          <GClassModel config={config} />
        </group>

        {/* Пол */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <circleGeometry args={[16, 64]} />
          <meshStandardMaterial color={floor} metalness={0.15} roughness={0.85} />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={config.night ? 0.85 : 0.6} scale={12} blur={2.2} far={3} resolution={512} />
      </Suspense>

      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={3.4}
        maxDistance={13}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.2}
        target={[0, isMobile ? 0.35 : 0.9, 0]}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoSpin}
        autoRotateSpeed={0.6}
        onStart={() => setAutoSpin(false)}
      />
    </Canvas>
  );
}
