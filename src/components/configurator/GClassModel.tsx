import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BuildConfig, PAINTS, RIM_FINISHES } from "./config";

/**
 * Стилизованная процедурная модель G-Class, собранная из примитивов —
 * без внешних 3D-файлов. Демонстрирует механику конфигуратора;
 * при появлении настоящей модели кита M-Monogram (GLB) компонент
 * заменяется загрузкой через useGLTF с тем же набором пропсов.
 */

const GLASS = new THREE.MeshPhysicalMaterial({
  color: "#0d1216",
  metalness: 0.1,
  roughness: 0.08,
  transmission: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
});
const TRIM = new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.4, roughness: 0.6 });
const CHROME = new THREE.MeshStandardMaterial({ color: "#cfd3d6", metalness: 1, roughness: 0.15 });
const TIRE = new THREE.MeshStandardMaterial({ color: "#111111", metalness: 0, roughness: 0.95 });
const CARBON = new THREE.MeshPhysicalMaterial({
  color: "#17181c",
  metalness: 0.55,
  roughness: 0.42,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
});
const RED_GLOW = new THREE.MeshStandardMaterial({ color: "#3a0a0a", emissive: "#a11212", emissiveIntensity: 0.7 });

/* Луч фары: цель прожектора должна находиться в графе сцены, иначе three.js её не обновит */
function HeadlightBeam({ z }: { z: number }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <group>
      <primitive object={target} position={[8, 0.3, z]} />
      <spotLight
        position={[2.35, 1.18, z]}
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
        arr.push({ rot: base - 0.16, tilt: 0.22 });
        arr.push({ rot: base + 0.16, tilt: -0.22 });
      }
    }
    return arr;
  }, [design]);

  const holes = useMemo(() => {
    if (design !== 0) return [];
    return Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  }, [design]);

  return (
    /* Лицевая сторона диска должна смотреть наружу на обоих бортах */
    <group position={position} rotation={[position[2] > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
      {/* Шина */}
      <mesh material={TIRE}>
        <cylinderGeometry args={[0.42, 0.42, 0.3, 40]} />
      </mesh>
      {/* Заглушка глубины, тормозной диск и суппорт за спицами */}
      <mesh material={TRIM} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 32]} />
      </mesh>
      <mesh material={CHROME} position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.025, 32]} />
      </mesh>
      <mesh position={[0.19, 0.06, 0.1]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#7a1616" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Обод */}
      <mesh material={rimMat} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.28, 40, 1, true]} />
      </mesh>
      {/* Тарелка монолитного диска */}
      {design === 0 && (
        <mesh material={rimMat} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.05, 40]} />
        </mesh>
      )}
      {holes.map((a, i) => (
        <mesh key={i} material={TRIM} position={[Math.cos(a) * 0.2, 0.13, Math.sin(a) * 0.2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
        </mesh>
      ))}
      {/* Спицы */}
      {spokes.map((s, i) => (
        <group key={i} rotation={[0, s.rot, 0]}>
          <mesh material={rimMat} position={[0.15, 0.1, 0]} rotation={[0, s.tilt, 0]}>
            <boxGeometry args={[0.26, 0.05, design === 2 ? 0.035 : 0.05]} />
          </mesh>
        </group>
      ))}
      {/* Ступица */}
      <mesh material={rimMat} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
      </mesh>
      <mesh material={TRIM} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.015, 16]} />
      </mesh>
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
        clearcoatRoughness: 0.08,
      }),
    [paint]
  );
  const accentMat = config.carbon ? CARBON : bodyMat;

  const headlightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dfe6ea",
        emissive: config.lights ? "#cfe4ff" : "#0a0a0a",
        emissiveIntensity: config.lights ? 2.2 : 0,
        metalness: 0.2,
        roughness: 0.2,
      }),
    [config.lights]
  );

  const wheelX = 1.42;
  const wheelZ = 0.82;
  const wheelY = 0.42;

  return (
    <group>
      {/* Рама и днище */}
      <RoundedBox args={[4.15, 0.32, 1.6]} radius={0.05} position={[0, 0.52, 0]} material={TRIM} />

      {/* Основной корпус */}
      <RoundedBox args={[4.5, 0.72, 1.8]} radius={0.07} position={[0, 1.02, 0]} material={bodyMat} />

      {/* Капот */}
      <RoundedBox args={[1.15, 0.07, 1.66]} radius={0.03} position={[1.62, 1.4, 0]} material={accentMat} />

      {/* Кабина до задней стенки: нижняя часть в цвет кузова, стеклянный пояс, крыша */}
      <RoundedBox args={[3.0, 0.24, 1.78]} radius={0.04} position={[-0.6, 1.44, 0]} material={bodyMat} />
      <RoundedBox args={[2.98, 0.44, 1.72]} radius={0.04} position={[-0.6, 1.74, 0]} material={GLASS} />
      <RoundedBox args={[3.08, 0.14, 1.8]} radius={0.05} position={[-0.6, 2.0, 0]} material={bodyMat} />

      {/* Цоколь под лобовым стеклом (капот-кабина без зазора) */}
      <RoundedBox args={[0.5, 0.18, 1.66]} radius={0.03} position={[1.02, 1.4, 0]} material={bodyMat} />

      {/* Лобовое стекло (почти вертикальное, как у G-Class) */}
      <mesh material={GLASS} position={[0.95, 1.72, 0]} rotation={[0, 0, -0.14]}>
        <boxGeometry args={[0.06, 0.52, 1.6]} />
      </mesh>

      {/* Стойки */}
      {[0.9, -0.35, -2.0].map((x) => (
        <RoundedBox key={x} args={[0.1, 0.5, 1.76]} radius={0.03} position={[x, 1.74, 0]} material={bodyMat} />
      ))}

      {/* Расширители арок */}
      {[wheelX, -wheelX].map((x) =>
        [wheelZ, -wheelZ].map((z) => (
          <RoundedBox
            key={`${x}${z}`}
            args={config.kit ? [1.08, 0.3, 0.26] : [0.95, 0.24, 0.16]}
            radius={0.05}
            position={[x, 0.98, z > 0 ? z + (config.kit ? 0.12 : 0.06) : z - (config.kit ? 0.12 : 0.06)]}
            material={config.kit ? accentMat : bodyMat}
          />
        ))
      )}

      {/* Решётка */}
      <RoundedBox args={[0.08, 0.4, 1.24]} radius={0.02} position={[2.28, 1.16, 0]} material={TRIM} />
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} material={config.kit ? CHROME : TRIM} position={[2.33, 1.16, -0.51 + i * 0.17]}>
          <boxGeometry args={[0.02, 0.34, 0.03]} />
        </mesh>
      ))}

      {/* Фары */}
      {[0.62, -0.62].map((z) => (
        <group key={z}>
          <mesh material={TRIM} position={[2.27, 1.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.06, 28]} />
          </mesh>
          <mesh material={headlightMat} position={[2.31, 1.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.03, 28]} />
          </mesh>
        </group>
      ))}
      {config.lights && [0.62, -0.62].map((z) => <HeadlightBeam key={z} z={z} />)}

      {/* Передний бампер */}
      <RoundedBox args={[0.4, 0.36, 1.78]} radius={0.06} position={[2.18, 0.6, 0]} material={config.kit ? accentMat : TRIM} />
      {config.kit && (
        <RoundedBox args={[0.3, 0.1, 1.62]} radius={0.03} position={[2.32, 0.38, 0]} material={CARBON} />
      )}

      {/* Кит: воздухозаборник капота, козырёк с LED, пороги, диффузор */}
      {config.kit && (
        <>
          <RoundedBox args={[0.55, 0.09, 0.5]} radius={0.03} position={[1.55, 1.47, 0]} material={CARBON} />
          <RoundedBox args={[0.16, 0.1, 1.7]} radius={0.03} position={[0.85, 2.12, 0]} material={CARBON} />
          {config.lights &&
            [-0.5, -0.17, 0.17, 0.5].map((z) => (
              <mesh key={z} material={headlightMat} position={[0.94, 2.12, z]}>
                <boxGeometry args={[0.02, 0.05, 0.16]} />
              </mesh>
            ))}
          {[0.94, -0.94].map((z) => (
            <RoundedBox key={z} args={[2.1, 0.14, 0.16]} radius={0.04} position={[0, 0.42, z]} material={CARBON} />
          ))}
          <RoundedBox args={[0.24, 0.18, 1.5]} radius={0.04} position={[-2.28, 0.44, 0]} material={CARBON} />
          {/* Четыре патрубка выхлопа */}
          {[0.62, 0.42, -0.42, -0.62].map((z) => (
            <mesh key={z} material={CHROME} position={[-2.3, 0.56, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 0.2, 20]} />
            </mesh>
          ))}
        </>
      )}
      {!config.kit &&
        [0.5, -0.5].map((z) => (
          <mesh key={z} material={TRIM} position={[-2.26, 0.5, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.16, 20]} />
          </mesh>
        ))}

      {/* Задний бампер и запаска на двери */}
      <RoundedBox args={[0.3, 0.36, 1.78]} radius={0.06} position={[-2.2, 0.6, 0]} material={config.kit ? accentMat : TRIM} />
      <group position={[-2.32, 1.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={TIRE}>
          <cylinderGeometry args={[0.38, 0.38, 0.24, 36]} />
        </mesh>
        <mesh material={accentMat} position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 36]} />
        </mesh>
      </group>

      {/* Задние фонари */}
      {[0.72, -0.72].map((z) => (
        <RoundedBox key={z} args={[0.06, 0.28, 0.14]} radius={0.02} position={[-2.26, 1.22, z]} material={RED_GLOW} />
      ))}

      {/* Зеркала */}
      {[0.95, -0.95].map((z) => (
        <group key={z} position={[0.8, 1.5, z]}>
          <mesh material={TRIM}>
            <boxGeometry args={[0.05, 0.05, 0.14]} />
          </mesh>
          <RoundedBox args={[0.1, 0.14, 0.2]} radius={0.03} position={[0, 0.02, z > 0 ? 0.14 : -0.14]} material={accentMat} />
        </group>
      ))}

      {/* Дверные ручки */}
      {[0.35, -0.85].map((x) =>
        [0.91, -0.91].map((z) => (
          <RoundedBox key={`${x}${z}`} args={[0.24, 0.05, 0.04]} radius={0.015} position={[x, 1.28, z]} material={CHROME} />
        ))
      )}

      {/* Колёса */}
      <Wheel position={[wheelX, wheelY, wheelZ]} design={config.rim} finishIdx={config.rimFinish} />
      <Wheel position={[wheelX, wheelY, -wheelZ]} design={config.rim} finishIdx={config.rimFinish} />
      <Wheel position={[-wheelX, wheelY, wheelZ]} design={config.rim} finishIdx={config.rimFinish} />
      <Wheel position={[-wheelX, wheelY, -wheelZ]} design={config.rim} finishIdx={config.rimFinish} />
    </group>
  );
}
