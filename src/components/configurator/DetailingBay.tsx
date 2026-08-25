import { useEffect, useMemo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

const ROOM = { w: 20, l: 24, h: 5.45 };

function makeNoiseCanvas(
  size: number,
  base: string,
  grain: number,
  joints?: { color: string; step: number; width: number }
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * grain;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  if (joints) {
    ctx.strokeStyle = joints.color;
    ctx.lineWidth = joints.width;
    for (let i = 0; i <= size; i += joints.step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function LedPanel({
  position,
  size,
  night,
}: {
  position: [number, number, number];
  size: [number, number];
  night: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[size[0] + 0.1, 0.05, size[1] + 0.1]} />
        <meshStandardMaterial color="#1c1e22" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color={night ? "#dce8ff" : "#f4f6fa"}
          emissive={night ? "#9eb6ff" : "#ffffff"}
          emissiveIntensity={night ? 2.4 : 1.55}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function WindowBay({ night, z }: { night: boolean; z: number }) {
  const panes: [number, number][] = [
    [-5.4, 1.55],
    [0, 1.55],
    [5.4, 1.55],
  ];
  const facing = z > 0 ? -1 : 1;
  return (
    <group position={[0, 0, z]}>
      {panes.map(([x, y], i) => (
        <group key={i} position={[x, y, facing * 0.06]}>
          <mesh>
            <boxGeometry args={[4.4, 2.85, 0.08]} />
            <meshStandardMaterial color="#141518" metalness={0.7} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, facing * 0.05]}>
            <planeGeometry args={[4.05, 2.5]} />
            <meshStandardMaterial
              color={night ? "#1c2836" : "#d5dee8"}
              roughness={0.18}
              metalness={0.08}
              emissive={night ? "#3d5470" : "#f2f6fa"}
              emissiveIntensity={night ? 0.55 : 0.28}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Физический бокс детейлинг-центра: эпоксидный пол, стены, потолочные LED-панели.
 * Environment остаётся только для бликов на краске — фон рисует эта геометрия.
 */
export default function DetailingBay({ night }: { night: boolean }) {
  const floorMap = useMemo(() => {
    const tex = makeNoiseCanvas(512, night ? "#1a1c1f" : "#c9ced3", night ? 10 : 14, {
      color: night ? "rgba(0,0,0,0.45)" : "rgba(70,74,80,0.28)",
      step: 256,
      width: 5,
    });
    tex.repeat.set(10, 8);
    return tex;
  }, [night]);

  const wallMap = useMemo(() => {
    const tex = makeNoiseCanvas(512, night ? "#2a2d32" : "#eef0f3", night ? 8 : 7);
    tex.repeat.set(6, 2);
    return tex;
  }, [night]);

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wallMap,
        color: night ? "#2c3036" : "#eceff2",
        roughness: 0.78,
        metalness: 0.04,
      }),
    [night, wallMap]
  );

  useEffect(
    () => () => {
      floorMap.dispose();
      wallMap.dispose();
      wallMat.dispose();
    },
    [floorMap, wallMap, wallMat]
  );

  const trim = night ? "#0d0e10" : "#1a1c1f";
  const ceil = night ? "#16181b" : "#f3f4f6";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const leds: [number, number, number][] = [];
  for (let x = -7.5; x <= 7.5; x += 5) {
    for (let z = -5; z <= 5; z += 5) {
      leds.push([x, ROOM.h - 0.08, z]);
    }
  }

  return (
    <group>
      {/* Эпоксидный пол с отражением кузова */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.l, ROOM.w]} />
        <MeshReflectorMaterial
          map={floorMap}
          color={night ? "#1c1e22" : "#c2c7cc"}
          metalness={night ? 0.55 : 0.42}
          roughness={night ? 0.22 : 0.18}
          resolution={isMobile ? 384 : 1024}
          blur={[40, 20]}
          mixBlur={0.22}
          mixStrength={night ? 28 : 22}
          mixContrast={1.05}
          mirror={0.55}
          depthScale={0.6}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.2}
          reflectorOffset={0.02}
        />
      </mesh>

      {/* Стены */}
      <mesh position={[0, ROOM.h / 2, -ROOM.w / 2]} material={wallMat} receiveShadow>
        <planeGeometry args={[ROOM.l, ROOM.h]} />
      </mesh>
      <mesh position={[0, ROOM.h / 2, ROOM.w / 2]} rotation={[0, Math.PI, 0]} material={wallMat} receiveShadow>
        <planeGeometry args={[ROOM.l, ROOM.h]} />
      </mesh>
      <mesh position={[-ROOM.l / 2, ROOM.h / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMat} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
      </mesh>
      <mesh position={[ROOM.l / 2, ROOM.h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={wallMat} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
      </mesh>

      {/* Потолок */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.h, 0]}>
        <planeGeometry args={[ROOM.l, ROOM.w]} />
        <meshStandardMaterial color={ceil} roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Тёмная акцентная стена сзади + плинтус */}
      <mesh position={[-ROOM.l / 2 + 0.04, 1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM.w - 0.4, 2.7]} />
        <meshStandardMaterial color={night ? "#0c0d0f" : "#16181b"} roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[-ROOM.l / 2 + 0.05, 2.72, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM.w - 0.8, 0.025]} />
        <meshStandardMaterial
          color={night ? "#c9a56a" : "#b7bdc4"}
          metalness={0.9}
          roughness={0.22}
          emissive={night ? "#6a5228" : "#000000"}
          emissiveIntensity={night ? 0.35 : 0}
        />
      </mesh>

      {[-ROOM.w / 2, ROOM.w / 2].map((z) => (
        <mesh key={`sk-${z}`} position={[0, 0.08, z + (z > 0 ? -0.03 : 0.03)]}>
          <boxGeometry args={[ROOM.l, 0.16, 0.06]} />
          <meshStandardMaterial color={trim} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[-ROOM.l / 2 + 0.03, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, ROOM.w]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.3} />
      </mesh>

      <WindowBay night={night} z={-ROOM.w / 2} />
      <WindowBay night={night} z={ROOM.w / 2} />

      {leds.map((p, i) => (
        <LedPanel key={i} position={p} size={[3.6, 1.7]} night={night} />
      ))}

      {/* Кове-свет по периметру потолка */}
      {(
        [
          [0, ROOM.h - 0.14, -ROOM.w / 2 + 0.18, ROOM.l - 0.8, 0.05, 0.07],
          [0, ROOM.h - 0.14, ROOM.w / 2 - 0.18, ROOM.l - 0.8, 0.05, 0.07],
          [-ROOM.l / 2 + 0.18, ROOM.h - 0.14, 0, 0.07, 0.05, ROOM.w - 0.8],
          [ROOM.l / 2 - 0.18, ROOM.h - 0.14, 0, 0.07, 0.05, ROOM.w - 0.8],
        ] as const
      ).map((b, i) => (
        <mesh key={`cove-${i}`} position={[b[0], b[1], b[2]]}>
          <boxGeometry args={[b[3], b[4], b[5]]} />
          <meshStandardMaterial
            color="#fff"
            emissive={night ? "#8aa4ff" : "#ffffff"}
            emissiveIntensity={night ? 1.8 : 1.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
