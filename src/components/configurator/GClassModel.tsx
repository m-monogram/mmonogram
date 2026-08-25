import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BuildConfig, PAINTS, RIM_FINISHES } from "./config";

/**
 * Стилизованная модель G-Class без внешних 3D-файлов.
 * Кузов построен экструзией бокового профиля с вырезами под колёсные арки —
 * колёса сидят внутри кузова, силуэт узнаваем. При появлении оцифрованного
 * кита M-Monogram (GLB) компонент заменяется загрузкой useGLTF
 * с тем же набором пропсов.
 */

const GLASS = new THREE.MeshPhysicalMaterial({
  color: "#10151a",
  metalness: 0.25,
  roughness: 0.05,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
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

const WHEEL_X = 1.47;
const WHEEL_Y = 0.49;
const WHEEL_Z = 0.78;
const ARCH_R = 0.6;

/* Нижний кузов: боковой профиль с арками, экструзия по ширине */
function useBodyGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(2.42, 0.42);
    s.lineTo(2.42, 1.0);
    s.lineTo(2.34, 1.08);
    s.lineTo(0.9, 1.08); // капот
    s.lineTo(0.84, 1.18); // подоконная линия почти вровень с капотом
    s.lineTo(-2.42, 1.18); // борт до кормы
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
}

function Wheel({ position, design, finishIdx }: WheelProps) {
  const finish = RIM_FINISHES[finishIdx];
  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: finish.color,
        metalness: finish.metalness,
        roughness: finish.roughness,
      }),
    [finish]
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
      <mesh position={[0.24, 0.065, 0.1]} rotation={[0, 0.45, 0]}>
        <boxGeometry args={[0.13, 0.06, 0.1]} />
        <meshStandardMaterial color="#7a1616" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Обод и внешняя губа */}
      <mesh material={rimMat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.28, 48, 1, true]} />
      </mesh>
      <mesh material={rimMat} position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.018, 12, 48]} />
      </mesh>
      {/* Тарелка монолитного диска */}
      {design === 0 && (
        <mesh material={rimMat} position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 48]} />
        </mesh>
      )}
      {holes.map((a, i) => (
        <mesh key={i} material={TRIM} position={[Math.cos(a) * 0.25, 0.16, Math.sin(a) * 0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
        </mesh>
      ))}
      {/* Спицы: слегка вогнутые к ступице */}
      {spokes.map((s, i) => (
        <group key={i} rotation={[0, s.rot, 0]}>
          <mesh material={rimMat} position={[0.18, 0.12, 0]} rotation={[0, s.tilt, -0.12]}>
            <boxGeometry args={[0.32, 0.05, design === 2 ? 0.04 : 0.055]} />
          </mesh>
        </group>
      ))}
      {/* Ступица */}
      <mesh material={rimMat} position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.06, 28]} />
      </mesh>
      <mesh material={TRIM} position={[0, 0.175, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.015, 20]} />
      </mesh>
    </group>
  );
}

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

export default function GClassModel({ config }: { config: BuildConfig }) {
  const paint = PAINTS[config.paint];
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
      <mesh geometry={glassGeom} material={GLASS} castShadow />

      {/* Крыша */}
      <RoundedBox args={[3.0, 0.1, 1.72]} radius={0.04} position={[-0.85, 1.86, 0]} material={bodyMat} castShadow />

      {/* Стойки поверх остекления */}
      <RoundedBox args={[0.1, 0.72, 1.68]} radius={0.03} position={[0.71, 1.5, 0]} rotation={[0, 0, 0.37]} material={bodyMat} />
      <RoundedBox args={[0.09, 0.64, 1.68]} radius={0.03} position={[-0.35, 1.5, 0]} material={bodyMat} />
      <RoundedBox args={[0.09, 0.64, 1.68]} radius={0.03} position={[-1.15, 1.5, 0]} material={bodyMat} />
      <RoundedBox args={[0.12, 0.7, 1.68]} radius={0.03} position={[-2.19, 1.5, 0]} rotation={[0, 0, -0.32]} material={bodyMat} />

      {/* Капот-«ракушка» — шире кузова, фирменная черта G-Class */}
      <RoundedBox args={[1.44, 0.05, 1.88]} radius={0.02} position={[1.62, 1.11, 0]} material={accentMat} castShadow />
      {config.kit && (
        <RoundedBox args={[0.6, 0.07, 0.55]} radius={0.02} position={[1.55, 1.14, 0]} material={CARBON} />
      )}

      {/* Поворотники на крыльях — фирменная черта */}
      {[0.79, -0.79].map((z) => (
        <RoundedBox key={z} args={[0.2, 0.07, 0.1]} radius={0.02} position={[2.05, 1.14, z]} material={TRIM} />
      ))}

      {/* Решётка радиатора */}
      <RoundedBox args={[0.07, 0.34, 1.14]} radius={0.02} position={[2.44, 0.86, 0]} material={TRIM} />
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
        </group>
      ))}
      {config.lights && [0.66, -0.66].map((z) => <HeadlightBeam key={z} z={z} />)}

      {/* Передний бампер */}
      <RoundedBox args={[0.3, 0.3, 1.86]} radius={0.05} position={[2.42, 0.44, 0]} material={config.kit ? accentMat : TRIM} castShadow />
      {config.kit && <RoundedBox args={[0.24, 0.09, 1.66]} radius={0.03} position={[2.52, 0.26, 0]} material={CARBON} />}

      {/* Расширители арок — дуги по контуру арок */}
      {[WHEEL_X, -WHEEL_X].map((x) =>
        [1, -1].map((side) => (
          <mesh
            key={`${x}${side}`}
            position={[x, 0.42, side * (config.kit ? 0.97 : 0.94)]}
            material={config.kit ? accentMat : bodyMat}
            castShadow
          >
            <torusGeometry args={[config.kit ? 0.65 : 0.62, config.kit ? 0.075 : 0.05, 10, 32, Math.PI]} />
          </mesh>
        ))
      )}

      {/* Пороги / подножки */}
      {[1, -1].map((side) => (
        <RoundedBox key={side} args={[2.15, 0.08, 0.2]} radius={0.03} position={[0, 0.36, side * 0.96]} material={config.kit ? CARBON : TRIM} />
      ))}

      {/* Кит: боковые выхлопы перед задними арками, как у G63 */}
      {config.kit &&
        [1, -1].map((side) =>
          [-0.62, -0.82].map((x) => (
            <mesh key={`${side}${x}`} material={CHROME} position={[x, 0.4, side * 1.0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.14, 24]} />
            </mesh>
          ))
        )}
      {!config.kit &&
        [0.45, -0.45].map((z) => (
          <mesh key={z} material={TRIM} position={[-2.48, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.14, 20]} />
          </mesh>
        ))}

      {/* Кит: LED-козырёк на крыше */}
      {config.kit && (
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

      {/* Задний бампер, запаска, фонари */}
      <RoundedBox args={[0.26, 0.3, 1.86]} radius={0.05} position={[-2.44, 0.44, 0]} material={config.kit ? accentMat : TRIM} />
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
      {[0.32, -0.72].map((x) =>
        [0.925, -0.925].map((z) => (
          <RoundedBox key={`${x}${z}`} args={[0.22, 0.045, 0.035]} radius={0.015} position={[x, 1.04, z]} material={CHROME} />
        ))
      )}

      {/* Швы дверей — тонкие тёмные линии по борту */}
      {[0.78, -0.12, -1.02].map((x) =>
        [0.943, -0.943].map((z) => (
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
      <Wheel position={[WHEEL_X, WHEEL_Y, WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} />
      <Wheel position={[WHEEL_X, WHEEL_Y, -WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} />
      <Wheel position={[-WHEEL_X, WHEEL_Y, WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} />
      <Wheel position={[-WHEEL_X, WHEEL_Y, -WHEEL_Z]} design={config.rim} finishIdx={config.rimFinish} />
    </group>
  );
}
