import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CABIN_BELT_Y, CABIN_FLOOR_Y, CABIN_LEN, CABIN_MID_X, CABIN_ROOF_Y, CABIN_SIDE_Z } from "./cabin";
import { INTERIOR_FINISHES } from "./config";

/**
 * Салон: торпедо, руль, приборка, сиденья, центральный тоннель, потолок
 * со «звёздным небом» и обшивка дверей. Виден снаружи через полупрозрачные
 * стёкла и изнутри — в режиме «Интерьер», куда залетает камера.
 * Геометрия процедурная, как и вся демо-модель.
 */

const LEATHER = new THREE.MeshPhysicalMaterial({
  color: "#4a201b",
  roughness: 0.66,
  metalness: 0.02,
  clearcoat: 0.22,
  clearcoatRoughness: 0.58,
});
const LEATHER_DARK = new THREE.MeshPhysicalMaterial({
  color: "#111012",
  roughness: 0.62,
  metalness: 0.03,
  clearcoat: 0.3,
  clearcoatRoughness: 0.5,
});
const LEATHER_DEEP = new THREE.MeshPhysicalMaterial({
  color: "#251211",
  roughness: 0.7,
  metalness: 0.01,
  clearcoat: 0.16,
  clearcoatRoughness: 0.7,
});
const PIPING = new THREE.MeshStandardMaterial({ color: "#b39562", metalness: 0.55, roughness: 0.34 });
const STITCH = new THREE.MeshStandardMaterial({ color: "#d4b27c", metalness: 0.05, roughness: 0.65 });
const ALCANTARA = new THREE.MeshStandardMaterial({ color: "#111114", roughness: 0.96, metalness: 0 });
const TRIM_CARBON = new THREE.MeshPhysicalMaterial({
  color: "#090a0d",
  roughness: 0.35,
  metalness: 0.6,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
const CHROME = new THREE.MeshStandardMaterial({ color: "#cfd3d6", metalness: 1, roughness: 0.14 });
const SCREEN = new THREE.MeshStandardMaterial({
  color: "#04060a",
  emissive: "#18314a",
  emissiveIntensity: 0.62,
  roughness: 0.18,
});
const SCREEN_LINE = new THREE.MeshBasicMaterial({ color: "#74b6ff", transparent: true, opacity: 0.72, toneMapped: false });
const SCREEN_DIM = new THREE.MeshBasicMaterial({ color: "#26394b", transparent: true, opacity: 0.65, toneMapped: false });

function StitchLines({ zPositions, width }: { zPositions: number[]; width: number }) {
  return (
    <>
      {zPositions.map((z) => (
        <RoundedBox
          key={z}
          args={[width, 0.007, 0.008]}
          radius={0.003}
          smoothness={1}
          position={[0.005, 0.068, z]}
          material={STITCH}
        />
      ))}
    </>
  );
}

function ScreenDetails({ position, rotation, size }: { position: [number, number, number]; rotation: [number, number, number]; size: [number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh material={SCREEN}>
        <planeGeometry args={size} />
      </mesh>
      {[-0.09, -0.03, 0.03, 0.09].map((y) => (
        <mesh key={y} position={[0, y, 0.003]} material={SCREEN_DIM}>
          <planeGeometry args={[size[0] * 0.78, 0.01]} />
        </mesh>
      ))}
      <mesh position={[size[0] * -0.26, size[1] * 0.18, 0.004]} material={SCREEN_LINE}>
        <planeGeometry args={[size[0] * 0.28, 0.012]} />
      </mesh>
      <mesh position={[size[0] * 0.24, size[1] * -0.22, 0.004]} material={SCREEN_LINE}>
        <planeGeometry args={[size[0] * 0.34, 0.012]} />
      </mesh>
    </group>
  );
}

/* Кресло: подушка, спинка, подголовник, боковая поддержка */
function Seat({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <RoundedBox args={[0.6, 0.08, 0.56]} radius={0.06} smoothness={3} position={[0.01, -0.035, 0]} material={LEATHER_DARK} />
      <RoundedBox args={[0.46, 0.105, 0.36]} radius={0.045} smoothness={3} position={[0.02, 0.025, 0]} material={LEATHER} />
      <RoundedBox args={[0.5, 0.026, 0.018]} radius={0.008} position={[0.015, 0.086, 0.2]} material={PIPING} />
      <RoundedBox args={[0.5, 0.026, 0.018]} radius={0.008} position={[0.015, 0.086, -0.2]} material={PIPING} />
      <StitchLines zPositions={[-0.12, 0, 0.12]} width={0.42} />
      <RoundedBox
        args={[0.15, 0.66, 0.5]}
        radius={0.06}
        smoothness={3}
        position={[-0.24, 0.34, 0]}
        rotation={[0, 0, 0.11]}
        material={LEATHER_DARK}
      />
      <RoundedBox
        args={[0.052, 0.5, 0.34]}
        radius={0.035}
        smoothness={3}
        position={[-0.17, 0.34, 0]}
        rotation={[0, 0, 0.11]}
        material={LEATHER}
      />
      <RoundedBox
        args={[0.028, 0.46, 0.32]}
        radius={0.034}
        smoothness={3}
        position={[-0.322, 0.34, 0]}
        rotation={[0, 0, 0.11]}
        material={LEATHER}
      />
      {[-0.12, 0, 0.12].map((z) => (
        <RoundedBox
          key={`back-stitch-${z}`}
          args={[0.01, 0.48, 0.006]}
          radius={0.003}
          smoothness={1}
          position={[-0.137, 0.34, z]}
          rotation={[0, 0, 0.11]}
          material={STITCH}
        />
      ))}
      {[-0.1, 0.1].map((z) => (
        <RoundedBox
          key={`rear-back-stitch-${z}`}
          args={[0.006, 0.4, 0.006]}
          radius={0.002}
          smoothness={1}
          position={[-0.342, 0.34, z]}
          rotation={[0, 0, 0.11]}
          material={STITCH}
        />
      ))}
      {[0.2, 0.36, 0.52].map((y) => (
        <RoundedBox
          key={`rear-back-horizontal-${y}`}
          args={[0.006, 0.006, 0.28]}
          radius={0.002}
          smoothness={1}
          position={[-0.344, y, 0]}
          rotation={[0, 0, 0.11]}
          material={STITCH}
        />
      ))}
      {[0.22, -0.22].map((z) => (
        <RoundedBox
          key={z}
          args={[0.12, 0.58, 0.1]}
          radius={0.04}
          smoothness={3}
          position={[-0.19, 0.33, z]}
          rotation={[0, 0, 0.11]}
          material={LEATHER_DEEP}
        />
      ))}
      <RoundedBox args={[0.12, 0.2, 0.3]} radius={0.05} smoothness={3} position={[-0.29, 0.77, 0]} material={LEATHER_DARK} />
      <RoundedBox args={[0.135, 0.12, 0.18]} radius={0.04} smoothness={3} position={[-0.275, 0.77, 0]} material={LEATHER} />
      {[0.2, -0.2].map((z) => (
        <RoundedBox key={z} args={[0.48, 0.09, 0.085]} radius={0.04} smoothness={3} position={[0.01, 0.04, z]} material={LEATHER_DEEP} />
      ))}
    </group>
  );
}

const STAR_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#dce8ff",
  emissiveIntensity: 1.6,
  side: THREE.DoubleSide,
});

function Interior({ finishIdx = 0 }: { finishIdx?: number }) {
  const finish = INTERIOR_FINISHES[finishIdx] ?? INTERIOR_FINISHES[0];

  useLayoutEffect(() => {
    LEATHER_DARK.color.set(finish.primary);
    LEATHER_DEEP.color.set(finish.primary).lerp(new THREE.Color("#000000"), 0.28);
    LEATHER.color.set(finish.accent);
    ALCANTARA.color.set(finish.primary).lerp(new THREE.Color("#050506"), 0.45);
  }, [finish]);

  /* «Звёздное небо» в потолке — точки распределены детерминированно */
  const stars = useMemo(() => {
    const pts: Array<{ position: [number, number, number]; scale: number }> = [];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < 90; i++) {
      pts.push({
        position: [-1.95 + rnd() * 2.6, CABIN_ROOF_Y - 0.008, -0.7 + rnd() * 1.4],
        scale: 0.75 + rnd() * 0.65,
      });
    }
    return pts;
  }, []);
  const starsRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = starsRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < stars.length; i++) {
      dummy.position.set(...stars[i].position);
      dummy.rotation.set(Math.PI / 2, 0, 0);
      dummy.scale.setScalar(stars[i].scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [stars]);

  return (
    <group>
      {/* Пол салона — на дне колодца, вырезанного в кузове */}
      <mesh position={[CABIN_MID_X, CABIN_FLOOR_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ALCANTARA}>
        <planeGeometry args={[CABIN_LEN, CABIN_SIDE_Z * 2]} />
      </mesh>

      {/* Боковые панели колодца: экструзия кузова идёт вдоль Z, поэтому вырез
          остаётся открытым по бортам — эти панели его закрывают и работают
          нижней частью обшивки дверей. */}
      {[CABIN_SIDE_Z, -CABIN_SIDE_Z].map((z) => (
        <RoundedBox
          key={`liner${z}`}
          args={[CABIN_LEN, CABIN_BELT_Y - CABIN_FLOOR_Y, 0.08]}
          radius={0.02}
          smoothness={2}
          position={[CABIN_MID_X, (CABIN_FLOOR_Y + CABIN_BELT_Y) / 2, z]}
          material={LEATHER_DARK}
        />
      ))}

      {/* Торпедо */}
      <RoundedBox args={[0.5, 0.34, 1.66]} radius={0.055} smoothness={3} position={[0.62, 1.25, 0]} material={LEATHER_DARK} />
      <RoundedBox args={[0.52, 0.065, 1.62]} radius={0.02} position={[0.58, 1.43, 0]} material={TRIM_CARBON} />
      <RoundedBox args={[0.03, 0.035, 1.52]} radius={0.012} position={[0.36, 1.32, 0]} material={PIPING} />
      {/* Декоративная вставка по торпедо */}
      <RoundedBox args={[0.05, 0.09, 1.5]} radius={0.02} position={[0.42, 1.24, 0]} material={TRIM_CARBON} />

      {/* Два экрана: приборка и мультимедиа. Разворот на -90° по Y обязателен —
          у planeGeometry нормаль вдоль +Z, и без него экраны смотрят вбок,
          а из салона видны тонкой синей полоской. */}
      <ScreenDetails position={[0.382, 1.32, 0.4]} rotation={[0, -Math.PI / 2 - 0.1, 0]} size={[0.36, 0.17]} />
      <ScreenDetails position={[0.382, 1.32, -0.03]} rotation={[0, -Math.PI / 2 + 0.06, 0]} size={[0.32, 0.17]} />

      {/* Руль справа от центра (правый руль, как в ОАЭ — слева) */}
      <group position={[0.3, 1.18, 0.38]} rotation={[0, 0, -0.42]}>
        <mesh material={LEATHER_DARK} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.17, 0.026, 14, 40]} />
        </mesh>
        <mesh material={PIPING} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.171, 0.004, 8, 40]} />
        </mesh>
        <mesh material={TRIM_CARBON} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.058, 0.058, 0.045, 28]} />
        </mesh>
        {[0.54, Math.PI - 0.54, -Math.PI / 2].map((a, i) => (
          <mesh key={i} material={i === 2 ? PIPING : CHROME} position={[0, Math.sin(a) * 0.09, Math.cos(a) * 0.09]} rotation={[a, 0, 0]}>
            <boxGeometry args={[0.026, 0.155, 0.028]} />
          </mesh>
        ))}
      </group>
      {/* Рулевая колонка */}
      <mesh position={[0.46, 1.16, 0.38]} rotation={[0, 0, Math.PI / 2 - 0.42]} material={LEATHER_DARK}>
        <cylinderGeometry args={[0.045, 0.05, 0.22, 16]} />
      </mesh>

      {/* Центральный тоннель с селектором */}
      <RoundedBox args={[1.15, 0.24, 0.36]} radius={0.05} smoothness={3} position={[-0.15, 1.03, 0.06]} material={LEATHER_DARK} />
      <RoundedBox args={[0.92, 0.035, 0.29]} radius={0.016} position={[-0.18, 1.16, 0.06]} material={TRIM_CARBON} />
      <RoundedBox args={[0.86, 0.012, 0.018]} radius={0.006} position={[-0.18, 1.182, 0.195]} material={PIPING} />
      <RoundedBox args={[0.86, 0.012, 0.018]} radius={0.006} position={[-0.18, 1.182, -0.075]} material={PIPING} />
      <mesh position={[0.12, 1.21, 0.06]} material={CHROME}>
        <cylinderGeometry args={[0.032, 0.04, 0.1, 16]} />
      </mesh>

      {/* Передние кресла — масштаб подобран так, чтобы подголовник не пробивал потолок */}
      <Seat position={[-0.02, 0.98, 0.42]} scale={0.93} />
      <Seat position={[-0.02, 0.98, -0.42]} scale={0.93} />

      {/* Задний диван */}
      <group>
        <RoundedBox args={[0.64, 0.13, 1.38]} radius={0.055} smoothness={3} position={[-1.28, 1.0, 0]} material={LEATHER_DARK} />
        {[-0.42, 0, 0.42].map((z) => (
          <RoundedBox key={`rear-cushion-${z}`} args={[0.58, 0.145, 0.36]} radius={0.045} smoothness={3} position={[-1.26, 1.035, z]} material={LEATHER} />
        ))}
        {[-0.42, 0, 0.42].map((z) => (
          <RoundedBox key={`rear-cushion-stitch-${z}`} args={[0.42, 0.01, 0.012]} radius={0.004} position={[-1.26, 1.115, z + 0.12]} material={STITCH} />
        ))}
        <RoundedBox args={[0.18, 0.66, 1.38]} radius={0.06} smoothness={3} position={[-1.56, 1.36, 0]} rotation={[0, 0, 0.09]} material={LEATHER_DARK} />
        {[-0.42, 0, 0.42].map((z) => (
          <RoundedBox key={`rear-back-${z}`} args={[0.08, 0.56, 0.34]} radius={0.042} smoothness={3} position={[-1.49, 1.34, z]} rotation={[0, 0, 0.09]} material={LEATHER} />
        ))}
        {[-0.42, 0, 0.42].map((z) =>
          [1.18, 1.36, 1.54].map((y) => (
            <RoundedBox
              key={`rear-back-stitch-${z}-${y}`}
              args={[0.012, 0.008, 0.26]}
              radius={0.003}
              position={[-1.435, y, z]}
              rotation={[0, 0, 0.09]}
              material={STITCH}
            />
          ))
        )}
        {[0.42, -0.42].map((z) => (
          <RoundedBox key={z} args={[0.13, 0.16, 0.26]} radius={0.05} smoothness={3} position={[-1.6, 1.72, z]} material={LEATHER} />
        ))}
        {/* центральный подлокотник */}
        <RoundedBox args={[0.5, 0.1, 0.28]} radius={0.04} position={[-1.3, 1.13, 0]} material={LEATHER_DEEP} />
        <RoundedBox args={[0.42, 0.014, 0.02]} radius={0.006} position={[-1.3, 1.19, 0.15]} material={PIPING} />
      </group>

      {/* Обшивка дверей: карбоновый молдинг по подоконнику, подсветка, подлокотник */}
      {[CABIN_SIDE_Z, -CABIN_SIDE_Z].map((z) => (
        <group key={z}>
          <RoundedBox args={[2.5, 0.05, 0.06]} radius={0.02} position={[-0.5, 1.15, z * 0.95]} material={TRIM_CARBON} />
          {/* контурная подсветка */}
          <mesh position={[-0.5, 1.06, z * 0.93]} rotation={[0, z > 0 ? Math.PI : 0, 0]}>
            <planeGeometry args={[2.4, 0.012]} />
            <meshStandardMaterial color="#ffffff" emissive="#8fa6c4" emissiveIntensity={0.8} />
          </mesh>
          {/* подлокотник двери */}
          <RoundedBox args={[0.72, 0.1, 0.15]} radius={0.04} position={[-0.4, 1.02, z * 0.9]} material={LEATHER_DARK} />
        </group>
      ))}

      {/* Потолок салона + звёздное небо */}
      <mesh position={[CABIN_MID_X, CABIN_ROOF_Y, 0]} rotation={[Math.PI / 2, 0, 0]} material={ALCANTARA}>
        <planeGeometry args={[CABIN_LEN, CABIN_SIDE_Z * 2]} />
      </mesh>
      <instancedMesh ref={starsRef} args={[undefined, undefined, stars.length]} material={STAR_MATERIAL}>
        <circleGeometry args={[0.008, 6]} />
      </instancedMesh>

      {/* Свет кабины: крыша непрозрачная, поэтому салону нужны свои источники */}
      {/* Крыша непрозрачная, поэтому салон освещается сам. Источники размазаны
          вдоль потолка и с мягким decay: одна яркая точка выжигала ближнее
          кресло, оставляя остальную кабину чёрной. */}
      {[0.45, -0.1, -0.65, -1.2, -1.75].map((x) => (
        <pointLight key={x} position={[x, 1.74, 0]} intensity={0.2} distance={3.0} decay={1.35} color="#ffeedd" />
      ))}
      <pointLight position={[0.5, 1.34, 0.1]} intensity={0.13} distance={1.8} decay={1.35} color="#bcd4f0" />
    </group>
  );
}

export default memo(Interior);
