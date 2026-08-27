import { useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import Interior from "./Interior";
import { CABIN_BELT_Y, CABIN_FLOOR_Y, CABIN_FRONT_X, CABIN_REAR_X } from "./cabin";
import { BuildConfig, CALIPER_FINISHES, PAINTS, RIM_FINISHES } from "./config";

/* Стойки стоят по краю остекления (оно доходит до z = ±0.82) */
const PILLAR_Z = 0.83;

/**
 * Стилизованная модель G-Class без внешних 3D-файлов.
 * Кузов построен экструзией бокового профиля с вырезами под колёсные арки —
 * колёса сидят внутри кузова, силуэт узнаваем. При появлении оцифрованного
 * кита M-Monogram (GLB) компонент заменяется загрузкой useGLTF
 * с тем же набором пропсов.
 */

const GLASS = new THREE.MeshPhysicalMaterial({
  color: "#0e1319",
  metalness: 0.1,
  roughness: 0.04,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  transparent: true,
  opacity: 0.42,
  /* Остекление — сплошной объём, а не оболочка. FrontSide обязателен:
     при DoubleSide камера внутри салона смотрит сквозь несколько тонированных
     граней подряд и кабина уходит в чёрное. Снаружи видна ближняя грань,
     сквозь неё — салон; изнутри стекло отбраковывается и окна чистые. */
  side: THREE.FrontSide,
  depthWrite: false,
});
const TRIM = new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.4, roughness: 0.6 });
const CHROME = new THREE.MeshStandardMaterial({ color: "#cfd3d6", metalness: 1, roughness: 0.12 });
const TIRE = new THREE.MeshStandardMaterial({ color: "#0e0e0e", metalness: 0, roughness: 0.95 });
const CARBON = new THREE.MeshPhysicalMaterial({
  color: "#1a1b1f",
  metalness: 0.55,
  roughness: 0.4,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
const RED_GLOW = new THREE.MeshStandardMaterial({ color: "#2a0707", emissive: "#a11212", emissiveIntensity: 0.6 });
const RUBBER = new THREE.MeshStandardMaterial({ color: "#050505", metalness: 0.1, roughness: 0.72 });
const DRL = new THREE.MeshStandardMaterial({ color: "#eef7ff", emissive: "#d8ecff", emissiveIntensity: 1.35, roughness: 0.22 });
const AMBIENT_STRIP = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#83a7cc", emissiveIntensity: 0.75 });
const SHADOW_GAP = new THREE.MeshStandardMaterial({ color: "#030303", metalness: 0.05, roughness: 0.82 });

const WHEEL_X = 1.47;
const WHEEL_Y = 0.49;
const WHEEL_Z = 0.78;
const ARCH_R = 0.6;

interface DoorSpec {
  id: string;
  hingeX: number;
  width: number;
  centerOffset: number;
  angle: number;
}

const DOORS: DoorSpec[] = [
  { id: "front", hingeX: 0.76, width: 0.86, centerOffset: -0.43, angle: 1.18 },
  { id: "rear", hingeX: -0.14, width: 0.82, centerOffset: -0.41, angle: 0.92 },
];

/* Нижний кузов: боковой профиль с арками, экструзия по ширине */
function useBodyGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(2.42, 0.42);
    s.lineTo(2.42, 1.0);
    s.lineTo(2.34, 1.08);
    s.lineTo(0.9, 1.08); // капот
    s.lineTo(CABIN_FRONT_X, CABIN_BELT_Y); // подоконная линия почти вровень с капотом
    // колодец салона: моторный щит — пол — задняя стенка
    s.lineTo(CABIN_FRONT_X, CABIN_FLOOR_Y);
    s.lineTo(CABIN_REAR_X, CABIN_FLOOR_Y);
    s.lineTo(CABIN_REAR_X, CABIN_BELT_Y);
    s.lineTo(-2.42, CABIN_BELT_Y); // борт до кормы
    s.lineTo(-2.42, 0.42); // корма
    s.lineTo(-2.07, 0.42);
    s.absarc(-1.47, 0.42, ARCH_R, Math.PI, 0, true); // задняя арка
    s.lineTo(0.87, 0.42);
    s.absarc(1.47, 0.42, ARCH_R, Math.PI, 0, true); // передняя арка
    s.lineTo(2.42, 0.42);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 1.8,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
      curveSegments: 40,
    });
    g.translate(0, 0, -0.9);
    return g;
  }, []);
}

/* Остекление кабины единым объёмом */
function useGlassGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.84, 1.18);
    s.lineTo(0.6, 1.82);
    s.lineTo(-2.1, 1.82);
    s.lineTo(-2.3, 1.18);
    s.lineTo(0.84, 1.18);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 1.64,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 8,
    });
    g.translate(0, 0, -0.82);
    return g;
  }, []);
}

interface WheelProps {
  position: [number, number, number];
  design: number;
  finishIdx: number;
  caliperIdx: number;
}

function Wheel({ position, design, finishIdx, caliperIdx }: WheelProps) {
  const finish = RIM_FINISHES[finishIdx];
  const caliper = CALIPER_FINISHES[caliperIdx] ?? CALIPER_FINISHES[0];
  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: finish.color,
        metalness: finish.metalness,
        roughness: finish.roughness,
      }),
    [finish]
  );
  const caliperMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: caliper.color, metalness: 0.42, roughness: 0.36 }),
    [caliper]
  );

  const spokes = useMemo(() => {
    const arr: { rot: number; tilt: number }[] = [];
    if (design === 1) {
      for (let i = 0; i < 12; i++) arr.push({ rot: (i / 12) * Math.PI * 2, tilt: 0 });
    } else if (design === 2) {
      for (let i = 0; i < 6; i++) {
        const base = (i / 6) * Math.PI * 2;
        arr.push({ rot: base - 0.15, tilt: 0.24 });
        arr.push({ rot: base + 0.15, tilt: -0.24 });
      }
    } else if (design === 3) {
      for (let i = 0; i < 10; i++) arr.push({ rot: (i / 10) * Math.PI * 2, tilt: 0.42 });
    } else if (design === 4) {
      for (let i = 0; i < 18; i++) arr.push({ rot: (i / 18) * Math.PI * 2, tilt: i % 2 ? -0.18 : 0.18 });
    }
    return arr;
  }, [design]);

  const holes = useMemo(() => {
    if (design !== 0) return [];
    return Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  }, [design]);

  return (
    /* Лицевая сторона диска смотрит наружу на обоих бортах */
    <group position={position} rotation={[position[2] > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
      {/* Шина с закруглёнными плечами */}
      <mesh material={TIRE}>
        <cylinderGeometry args={[0.49, 0.49, 0.32, 48]} />
      </mesh>
      {[0.16, -0.16].map((y) => (
        <mesh key={y} material={TIRE} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.44, 0.05, 12, 48]} />
        </mesh>
      ))}
      {/* Заглушка глубины, тормозной диск и суппорт */}
      <mesh material={TRIM} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.02, 40]} />
      </mesh>
      <mesh material={CHROME} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.025, 40]} />
      </mesh>
      <mesh position={[0.24, 0.065, 0.1]} rotation={[0, 0.45, 0]} material={caliperMat}>
        <boxGeometry args={[0.13, 0.06, 0.1]} />
      </mesh>
      {/* Обод и внешняя губа */}
      <mesh material={rimMat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.28, 48, 1, true]} />
      </mesh>
      <mesh material={rimMat} position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.018, 12, 48]} />
      </mesh>
      {/* Тарелка монолитного диска — у самого устья обода: в глубине бочонка
          дизайн съедали AO и тень, и любой диск выглядел чёрным блином */}
      {(design === 0 || design === 4) && (
        <mesh material={rimMat} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[design === 4 ? 0.31 : 0.35, design === 4 ? 0.31 : 0.35, 0.05, 48]} />
        </mesh>
      )}
      {holes.map((a, i) => (
        <mesh key={i} material={TRIM} position={[Math.cos(a) * 0.25, 0.185, Math.sin(a) * 0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
        </mesh>
      ))}
      {/* Спицы: в плоскости губы, слегка вогнутые к ступице */}
      {spokes.map((s, i) => (
        <group key={i} rotation={[0, s.rot, 0]}>
          <mesh material={rimMat} position={[0.18, 0.155, 0]} rotation={[0, s.tilt, -0.12]}>
            <boxGeometry args={[0.32, 0.05, design === 2 ? 0.04 : 0.055]} />
          </mesh>
        </group>
      ))}
      {/* Ступица */}
      <mesh material={rimMat} position={[0, 0.165, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.06, 28]} />
      </mesh>
      <mesh material={TRIM} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.015, 20]} />
      </mesh>
    </group>
  );
}

function Door({
  side,
  spec,
  bodyMat,
  open,
}: {
  side: 1 | -1;
  spec: DoorSpec;
  bodyMat: THREE.Material;
  open: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  const target = open ? side * spec.angle : 0;

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const next = THREE.MathUtils.damp(group.rotation.y, target, 7.5, 1 / 60);
    if (Math.abs(next - group.rotation.y) > 0.0005) {
      group.rotation.y = next;
      invalidate();
    } else if (group.rotation.y !== target) {
      group.rotation.y = target;
      invalidate();
    }
  });

  return (
    <group ref={ref} position={[spec.hingeX, 0, side * 0.91]}>
      <RoundedBox
        args={[spec.width, 0.56, 0.065]}
        radius={0.026}
        smoothness={3}
        position={[spec.centerOffset, 0.99, side * 0.025]}
        material={bodyMat}
        castShadow
      />
      <RoundedBox
        args={[spec.width - 0.1, 0.42, 0.035]}
        radius={0.025}
        smoothness={3}
        position={[spec.centerOffset - 0.02, 1.48, side * 0.037]}
        material={GLASS}
        renderOrder={2}
      />
      <RoundedBox
        args={[spec.width - 0.08, 0.045, 0.052]}
        radius={0.015}
        position={[spec.centerOffset - 0.02, 1.21, side * 0.057]}
        material={RUBBER}
      />
      <RoundedBox
        args={[spec.width - 0.16, 0.07, 0.045]}
        radius={0.02}
        position={[spec.centerOffset - 0.05, 1.03, -side * 0.035]}
        material={LEATHER_DOOR}
      />
      <mesh position={[spec.centerOffset - 0.05, 1.1, -side * 0.07]} rotation={[0, side > 0 ? Math.PI : 0, 0]} material={AMBIENT_STRIP}>
        <planeGeometry args={[spec.width - 0.18, 0.012]} />
      </mesh>
      <RoundedBox
        args={[0.2, 0.045, 0.035]}
        radius={0.015}
        position={[spec.centerOffset - 0.12, 1.04, side * 0.07]}
        material={CHROME}
      />
    </group>
  );
}

function DoorAperture({ side }: { side: 1 | -1 }) {
  return (
    <group position={[0, 0, side * 0.902]}>
      <RoundedBox args={[1.82, 0.62, 0.045]} radius={0.028} smoothness={3} position={[-0.55, 0.98, 0]} material={SHADOW_GAP} />
      <RoundedBox args={[1.88, 0.045, 0.055]} radius={0.018} position={[-0.55, 1.26, side * 0.012]} material={RUBBER} />
      <RoundedBox args={[0.045, 0.6, 0.055]} radius={0.018} position={[0.36, 1.0, side * 0.012]} material={RUBBER} />
      <RoundedBox args={[0.045, 0.6, 0.055]} radius={0.018} position={[-1.46, 1.0, side * 0.012]} material={RUBBER} />
      <RoundedBox args={[0.07, 0.68, 0.06]} radius={0.02} position={[-0.14, 1.0, side * 0.018]} material={TRIM} />
    </group>
  );
}

function OpeningPanel({
  open,
  target,
  children,
  position,
}: {
  open: boolean;
  target: [number, number, number];
  children: ReactNode;
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const tx = open ? target[0] : 0;
    const ty = open ? target[1] : 0;
    const tz = open ? target[2] : 0;
    const nx = THREE.MathUtils.damp(group.rotation.x, tx, 7.2, 1 / 60);
    const ny = THREE.MathUtils.damp(group.rotation.y, ty, 7.2, 1 / 60);
    const nz = THREE.MathUtils.damp(group.rotation.z, tz, 7.2, 1 / 60);
    if (
      Math.abs(nx - group.rotation.x) > 0.0005 ||
      Math.abs(ny - group.rotation.y) > 0.0005 ||
      Math.abs(nz - group.rotation.z) > 0.0005
    ) {
      group.rotation.set(nx, ny, nz);
      invalidate();
    }
  });

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

const LEATHER_DOOR = new THREE.MeshPhysicalMaterial({
  color: "#171719",
  roughness: 0.62,
  metalness: 0.03,
  clearcoat: 0.25,
  clearcoatRoughness: 0.5,
});

/* Луч фары: цель прожектора должна находиться в графе сцены */
function HeadlightBeam({ z }: { z: number }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <group>
      <primitive object={target} position={[8, 0.3, z]} />
      <spotLight
        position={[2.4, 0.9, z]}
        target={target}
        angle={0.45}
        intensity={40}
        distance={14}
        penumbra={0.7}
        color="#dcebff"
      />
    </group>
  );
}

export default function GClassModel({ config, doorsOpen = false }: { config: BuildConfig; doorsOpen?: boolean }) {
  const paint = PAINTS[config.paint];
  const kitLevel = config.kitPackage;
  const hasKit = kitLevel > 0 || config.kit;
  const doorsActive = doorsOpen || config.doors;
  const bodyMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: paint.color,
        metalness: paint.metalness,
        roughness: paint.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
    [paint]
  );
  const glassMat = useMemo(() => GLASS.clone(), []);
  glassMat.opacity = doorsActive ? 0.18 : 0.42;
  const accentMat = config.carbon ? CARBON : bodyMat;
  const bodyGeom = useBodyGeometry();
  const glassGeom = useGlassGeometry();

  const headlightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e6ebef",
        emissive: config.lights ? "#cfe4ff" : "#0a0a0a",
        emissiveIntensity: config.lights ? 2.4 : 0,
        metalness: 0.2,
        roughness: 0.15,
      }),
    [config.lights]
  );

  return (
    <group>
      {/* Кузов и остекление */}
      <mesh geometry={bodyGeom} material={bodyMat} castShadow receiveShadow />

      {[1, -1].map((side) => <DoorAperture key={`aperture-${side}`} side={side as 1 | -1} />)}
      {[1, -1].map((side) => DOORS.map((spec) => <Door key={`${side}-${spec.id}`} side={side as 1 | -1} spec={spec} bodyMat={bodyMat} open={doorsActive} />))}
      <Interior finishIdx={config.interior} />
      <mesh geometry={glassGeom} material={glassMat} renderOrder={2} />

      {/* Крыша */}
      <RoundedBox args={[3.0, 0.1, 1.72]} radius={0.04} position={[-0.85, 1.86, 0]} material={bodyMat} castShadow />
      <RoundedBox args={[3.2, 0.05, 0.08]} radius={0.018} position={[-0.78, 1.97, 0.82]} material={TRIM} />
      <RoundedBox args={[3.2, 0.05, 0.08]} radius={0.018} position={[-0.78, 1.97, -0.82]} material={TRIM} />

      {/* Стойки поверх остекления — по бортам, а не сплошными плитами поперёк
          кабины: полноширинные плиты изнутри работали глухими перегородками
          в полуметре от камеры и салон уходил в чёрное. */}
      {[PILLAR_Z, -PILLAR_Z].map((z) => (
        <group key={z}>
          <RoundedBox args={[0.1, 0.72, 0.1]} radius={0.03} position={[0.71, 1.5, z]} rotation={[0, 0, 0.37]} material={bodyMat} />
          <RoundedBox args={[0.09, 0.64, 0.09]} radius={0.03} position={[-0.35, 1.5, z]} material={bodyMat} />
          <RoundedBox args={[0.09, 0.64, 0.09]} radius={0.03} position={[-1.15, 1.5, z]} material={bodyMat} />
          <RoundedBox args={[0.12, 0.7, 0.1]} radius={0.03} position={[-2.19, 1.5, z]} rotation={[0, 0, -0.32]} material={bodyMat} />
        </group>
      ))}

      {/* Капот-«ракушка» — шире кузова, фирменная черта G-Class */}
      <OpeningPanel open={config.hood} target={[-0.72, 0, 0]} position={[0.94, 1.06, 0]}>
        <RoundedBox args={[1.44, 0.05, 1.88]} radius={0.02} position={[0.68, 0.05, 0]} material={accentMat} castShadow />
        <mesh material={TRIM} position={[0.66, 0.085, 0]}>
          <boxGeometry args={[1.12, 0.012, 0.018]} />
        </mesh>
        {[0.62, -0.62].map((z) => (
          <mesh key={`hood-line-${z}`} material={TRIM} position={[0.66, 0.088, z]}>
            <boxGeometry args={[1.08, 0.012, 0.014]} />
          </mesh>
        ))}
        {hasKit && (
          <RoundedBox args={[0.6, 0.07, 0.55]} radius={0.02} position={[0.61, 0.08, 0]} material={CARBON} />
        )}
      </OpeningPanel>

      {/* Поворотники на крыльях — фирменная черта */}
      {[0.79, -0.79].map((z) => (
        <RoundedBox key={z} args={[0.2, 0.07, 0.1]} radius={0.02} position={[2.05, 1.14, z]} material={TRIM} />
      ))}

      {/* Решётка радиатора */}
      <RoundedBox args={[0.07, 0.34, 1.14]} radius={0.02} position={[2.44, 0.86, 0]} material={TRIM} />
      <mesh material={CHROME} position={[2.505, 0.86, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.16, 0.012, 10, 36]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} material={config.kit ? CHROME : TRIM} position={[2.48, 0.86, -0.49 + i * 0.14]}>
          <boxGeometry args={[0.02, 0.28, 0.03]} />
        </mesh>
      ))}

      {/* Круглые фары с LED-кольцами */}
      {[0.66, -0.66].map((z) => (
        <group key={z} position={[2.45, 0.9, z]}>
          <mesh material={TRIM} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.17, 0.17, 0.07, 32]} />
          </mesh>
          <mesh material={headlightMat} position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.03, 32]} />
          </mesh>
          <mesh material={headlightMat} position={[0.045, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.14, 0.012, 10, 40]} />
          </mesh>
          <mesh material={DRL} position={[0.055, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.18, 0.006, 8, 48]} />
          </mesh>
        </group>
      ))}
      {config.lights && [0.66, -0.66].map((z) => <HeadlightBeam key={z} z={z} />)}

      {/* Передний бампер */}
      <RoundedBox args={[0.3, 0.3, 1.86]} radius={0.05} position={[2.42, 0.44, 0]} material={hasKit ? accentMat : TRIM} castShadow />
      {hasKit && <RoundedBox args={[0.24, 0.09, 1.66]} radius={0.03} position={[2.52, 0.26, 0]} material={CARBON} />}
      {kitLevel >= 2 && <RoundedBox args={[0.18, 0.06, 1.42]} radius={0.025} position={[2.57, 0.68, 0]} material={CARBON} />}
      <mesh material={TRIM} position={[2.575, 0.52, 0]}>
        <boxGeometry args={[0.035, 0.06, 1.22]} />
      </mesh>

      {/* Расширители арок — дуги по контуру арок */}
      {[WHEEL_X, -WHEEL_X].map((x) =>
        [1, -1].map((side) => (
          <mesh
            key={`${x}${side}`}
            position={[x, 0.42, side * (hasKit ? 0.97 : 0.94)]}
            material={hasKit ? accentMat : bodyMat}
            castShadow
          >
            <torusGeometry args={[hasKit ? 0.65 : 0.62, hasKit ? 0.075 : 0.05, 10, 32, Math.PI]} />
          </mesh>
        ))
      )}

      {/* Пороги / подножки */}
      {[1, -1].map((side) => (
        <RoundedBox key={side} args={[2.35, 0.08, 0.22]} radius={0.03} position={[-0.13, 0.34, side * 1.01]} material={hasKit ? CARBON : TRIM} />
      ))}

      {/* Кит: боковые выхлопы перед задними арками, как у G63 */}
      {hasKit &&
        [1, -1].map((side) =>
          [-0.62, -0.82].map((x) => (
            <mesh key={`${side}${x}`} material={CHROME} position={[x, 0.4, side * 1.0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.14, 24]} />
            </mesh>
          ))
        )}
      {!hasKit &&
        [0.45, -0.45].map((z) => (
          <mesh key={z} material={TRIM} position={[-2.48, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.14, 20]} />
          </mesh>
        ))}

      {/* Кит: LED-козырёк на крыше */}
      {hasKit && (
        <>
          <RoundedBox args={[0.16, 0.1, 1.56]} radius={0.03} position={[0.5, 1.92, 0]} material={CARBON} />
          {config.lights &&
            [-0.52, -0.17, 0.17, 0.52].map((z) => (
              <mesh key={z} material={headlightMat} position={[0.59, 1.92, z]}>
                <boxGeometry args={[0.02, 0.05, 0.18]} />
              </mesh>
            ))}
        </>
      )}
      {kitLevel >= 3 && (
        <RoundedBox args={[1.1, 0.08, 1.3]} radius={0.035} position={[-1.12, 1.98, 0]} material={CARBON} />
      )}

      {/* Задний бампер, запаска, фонари */}
      <OpeningPanel open={config.trunk} target={[0, 0.76, 0]} position={[-2.5, 0.42, 0]}>
        <RoundedBox args={[0.045, 1.08, 1.18]} radius={0.02} position={[-0.005, 0.55, 0]} material={SHADOW_GAP} />
      </OpeningPanel>
      <RoundedBox args={[0.26, 0.3, 1.86]} radius={0.05} position={[-2.44, 0.44, 0]} material={hasKit ? accentMat : TRIM} />
      <group position={[-2.6, 0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={TIRE}>
          <cylinderGeometry args={[0.4, 0.4, 0.24, 40]} />
        </mesh>
        <mesh material={accentMat} position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.05, 40]} />
        </mesh>
      </group>
      {[0.76, -0.76].map((z) => (
        <RoundedBox key={z} args={[0.06, 0.28, 0.13]} radius={0.02} position={[-2.47, 1.0, z]} material={RED_GLOW} />
      ))}

      {/* Зеркала на ножках у A-стойки */}
      {[1, -1].map((side) => (
        <group key={side} position={[0.7, 1.32, side * 0.92]}>
          <mesh material={TRIM} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.14, 12]} />
          </mesh>
          <RoundedBox args={[0.09, 0.13, 0.2]} radius={0.03} position={[0, 0.03, side * 0.13]} material={accentMat} />
        </group>
      ))}

      {/* Дверные ручки */}
      {!doorsActive &&
        [0.32, -0.72].map((x) =>
          [0.925, -0.925].map((z) => (
            <RoundedBox key={`${x}${z}`} args={[0.22, 0.045, 0.035]} radius={0.015} position={[x, 1.04, z]} material={CHROME} />
          ))
        )}

      {/* Швы дверей — тонкие тёмные линии по борту */}
      {!doorsActive && [0.78, -0.12, -1.02].map((x) =>
        [0.948, -0.948].map((z) => (
          <mesh key={`seam${x}${z}`} material={TRIM} position={[x, 0.8, z]}>
            <boxGeometry args={[0.014, 0.72, 0.012]} />
          </mesh>
        ))
      )}

      {/* Защитный молдинг по борту — фирменная горизонталь G-Class */}
      {[1, -1].map((side) => (
        <group key={side}>
          <RoundedBox args={[1.7, 0.07, 0.035]} radius={0.012} position={[0, 0.82, side * 0.945]} material={TRIM} />
          <RoundedBox args={[0.32, 0.07, 0.035]} radius={0.012} position={[2.24, 0.82, side * 0.945]} material={TRIM} />
          <RoundedBox args={[0.32, 0.07, 0.035]} radius={0.012} position={[-2.24, 0.82, side * 0.945]} material={TRIM} />
        </group>
      ))}

      {/* Колёса — внутри арок */}
      <Wheel position={[WHEEL_X, WHEEL_Y, WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} caliperIdx={config.caliper} />
      <Wheel position={[WHEEL_X, WHEEL_Y, -WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} caliperIdx={config.caliper} />
      <Wheel position={[-WHEEL_X, WHEEL_Y, WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} caliperIdx={config.caliper} />
      <Wheel position={[-WHEEL_X, WHEEL_Y, -WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} caliperIdx={config.caliper} />
    </group>
  );
}
