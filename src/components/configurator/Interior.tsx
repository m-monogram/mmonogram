import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CABIN_BELT_Y, CABIN_FLOOR_Y, CABIN_LEN, CABIN_MID_X, CABIN_ROOF_Y, CABIN_SIDE_Z } from "./cabin";

/**
 * Салон: торпедо, руль, приборка, сиденья, центральный тоннель, потолок
 * со «звёздным небом» и обшивка дверей. Виден снаружи через полупрозрачные
 * стёкла и изнутри — в режиме «Интерьер», куда залетает камера.
 * Геометрия процедурная, как и вся демо-модель.
 */

const LEATHER = new THREE.MeshPhysicalMaterial({
  color: "#cec5b4",
  roughness: 0.62,
  metalness: 0.02,
  clearcoat: 0.25,
  clearcoatRoughness: 0.55,
});
const LEATHER_DARK = new THREE.MeshPhysicalMaterial({
  color: "#1a1a1c",
  roughness: 0.58,
  metalness: 0.03,
  clearcoat: 0.3,
  clearcoatRoughness: 0.5,
});
const ALCANTARA = new THREE.MeshStandardMaterial({ color: "#26262a", roughness: 0.95, metalness: 0 });
const TRIM_CARBON = new THREE.MeshPhysicalMaterial({
  color: "#191a1e",
  roughness: 0.35,
  metalness: 0.6,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
const CHROME = new THREE.MeshStandardMaterial({ color: "#cfd3d6", metalness: 1, roughness: 0.14 });
const SCREEN = new THREE.MeshStandardMaterial({
  color: "#04060a",
  emissive: "#12202e",
  emissiveIntensity: 0.45,
  roughness: 0.18,
});

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
      {/* подушка */}
      <RoundedBox args={[0.52, 0.12, 0.5]} radius={0.05} smoothness={3} position={[0, 0, 0]} material={LEATHER} />
      {/* спинка */}
      <RoundedBox
        args={[0.16, 0.62, 0.5]}
        radius={0.06}
        smoothness={3}
        position={[-0.24, 0.34, 0]}
        rotation={[0, 0, 0.11]}
        material={LEATHER}
      />
      {/* боковая поддержка спинки */}
      {[0.21, -0.21].map((z) => (
        <RoundedBox
          key={z}
          args={[0.1, 0.56, 0.09]}
          radius={0.04}
          smoothness={3}
          position={[-0.19, 0.33, z]}
          rotation={[0, 0, 0.11]}
          material={LEATHER}
        />
      ))}
      {/* подголовник */}
      <RoundedBox args={[0.12, 0.19, 0.26]} radius={0.05} smoothness={3} position={[-0.28, 0.76, 0]} material={LEATHER} />
      {/* валики подушки */}
      {[0.2, -0.2].map((z) => (
        <RoundedBox key={z} args={[0.48, 0.09, 0.09]} radius={0.04} smoothness={3} position={[0.01, 0.04, z]} material={LEATHER} />
      ))}
    </group>
  );
}

export default function Interior() {
  /* «Звёздное небо» в потолке — точки распределены детерминированно */
  const stars = useMemo(() => {
    const pts: [number, number, number][] = [];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < 90; i++) {
      pts.push([-1.95 + rnd() * 2.6, CABIN_ROOF_Y - 0.008, -0.7 + rnd() * 1.4]);
    }
    return pts;
  }, []);

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
      <RoundedBox args={[0.44, 0.3, 1.62]} radius={0.05} smoothness={3} position={[0.62, 1.26, 0]} material={LEATHER_DARK} />
      <RoundedBox args={[0.5, 0.06, 1.62]} radius={0.02} position={[0.6, 1.42, 0]} material={TRIM_CARBON} />
      {/* Декоративная вставка по торпедо */}
      <RoundedBox args={[0.05, 0.09, 1.5]} radius={0.02} position={[0.42, 1.24, 0]} material={TRIM_CARBON} />

      {/* Два экрана: приборка и мультимедиа. Разворот на -90° по Y обязателен —
          у planeGeometry нормаль вдоль +Z, и без него экраны смотрят вбок,
          а из салона видны тонкой синей полоской. */}
      <mesh position={[0.385, 1.32, 0.4]} rotation={[0, -Math.PI / 2 - 0.1, 0]} material={SCREEN}>
        <planeGeometry args={[0.34, 0.16]} />
      </mesh>
      <mesh position={[0.385, 1.32, -0.02]} rotation={[0, -Math.PI / 2 + 0.06, 0]} material={SCREEN}>
        <planeGeometry args={[0.3, 0.16]} />
      </mesh>

      {/* Руль справа от центра (правый руль, как в ОАЭ — слева) */}
      <group position={[0.3, 1.18, 0.38]} rotation={[0, 0, -0.42]}>
        <mesh material={LEATHER_DARK} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.17, 0.026, 14, 40]} />
        </mesh>
        <mesh material={TRIM_CARBON}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
        </mesh>
        {[0.5, Math.PI - 0.5, -Math.PI / 2].map((a, i) => (
          <mesh key={i} material={TRIM_CARBON} position={[0, Math.sin(a) * 0.09, Math.cos(a) * 0.09]} rotation={[a, 0, 0]}>
            <boxGeometry args={[0.03, 0.16, 0.035]} />
          </mesh>
        ))}
      </group>
      {/* Рулевая колонка */}
      <mesh position={[0.46, 1.16, 0.38]} rotation={[0, 0, Math.PI / 2 - 0.42]} material={LEATHER_DARK}>
        <cylinderGeometry args={[0.045, 0.05, 0.22, 16]} />
      </mesh>

      {/* Центральный тоннель с селектором */}
      <RoundedBox args={[1.15, 0.24, 0.36]} radius={0.05} smoothness={3} position={[-0.15, 1.03, 0.06]} material={LEATHER_DARK} />
      <RoundedBox args={[0.9, 0.03, 0.28]} radius={0.015} position={[-0.18, 1.16, 0.06]} material={TRIM_CARBON} />
      <mesh position={[0.12, 1.21, 0.06]} material={CHROME}>
        <cylinderGeometry args={[0.032, 0.04, 0.1, 16]} />
      </mesh>

      {/* Передние кресла — масштаб подобран так, чтобы подголовник не пробивал потолок */}
      <Seat position={[-0.02, 0.98, 0.42]} scale={0.93} />
      <Seat position={[-0.02, 0.98, -0.42]} scale={0.93} />

      {/* Задний диван */}
      <group>
        <RoundedBox args={[0.6, 0.13, 1.34]} radius={0.05} smoothness={3} position={[-1.28, 1.0, 0]} material={LEATHER} />
        <RoundedBox args={[0.18, 0.66, 1.34]} radius={0.06} smoothness={3} position={[-1.56, 1.36, 0]} rotation={[0, 0, 0.09]} material={LEATHER} />
        {[0.42, -0.42].map((z) => (
          <RoundedBox key={z} args={[0.13, 0.16, 0.26]} radius={0.05} smoothness={3} position={[-1.6, 1.72, z]} material={LEATHER} />
        ))}
        {/* центральный подлокотник */}
        <RoundedBox args={[0.5, 0.1, 0.28]} radius={0.04} position={[-1.3, 1.12, 0]} material={LEATHER} />
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
      {stars.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.008, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#dce8ff" emissiveIntensity={1.6} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Свет кабины: крыша непрозрачная, поэтому салону нужны свои источники */}
      {/* Крыша непрозрачная, поэтому салон освещается сам. Источники размазаны
          вдоль потолка и с мягким decay: одна яркая точка выжигала ближнее
          кресло, оставляя остальную кабину чёрной. */}
      {[0.45, -0.1, -0.65, -1.2, -1.75].map((x) => (
        <pointLight key={x} position={[x, 1.74, 0]} intensity={0.26} distance={3.2} decay={1.3} color="#ffeedd" />
      ))}
      <pointLight position={[0.5, 1.34, 0.1]} intensity={0.18} distance={1.8} decay={1.3} color="#bcd4f0" />
    </group>
  );
}
