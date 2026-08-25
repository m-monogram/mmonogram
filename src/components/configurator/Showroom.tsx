import { useMemo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Два окружения для конфигуратора:
 *  - Studio: круговая бесшовная циклорама (infinity cove) — работает с любого угла орбиты;
 *  - Showroom: тёмный гараж с потолочными LED-панелями, панельными стенами
 *    и полированным полом с отражениями.
 * Геометрия строится процедурно, текстуры — на canvas, поэтому внешних файлов нет.
 */

const COVE_RADIUS = 10;
const COVE_FILLET = 5.5;
const ROOM_HALF_W = 15;
const ROOM_HALF_D = 13;
const ROOM_H = 7;

/* Вертикальная растяжка для циклорамы: светлее у пола, мягко темнеет кверху */
function useCoveTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 512, 0, 0);
    g.addColorStop(0, "#dcdfe2");
    g.addColorStop(0.3, "#d2d6d9");
    g.addColorStop(0.6, "#c3c8cc");
    g.addColorStop(0.82, "#b2b7bc");
    g.addColorStop(1, "#a3a8ad");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/* Стены гаража: тёмные панели с вертикальными швами и лёгким градиентом */
function useWallTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 512, 0, 0);
    g.addColorStop(0, "#131619");
    g.addColorStop(0.5, "#0d0f11");
    g.addColorStop(1, "#08090b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    // вертикальные швы между панелями
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 3;
    for (let x = 64; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    // тонкий блик слева от каждого шва — панели читаются объёмно
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1.5;
    for (let x = 66; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

/* Циклорама: профиль вращается вокруг оси Y, шва не видно ни с одного ракурса.
   Скругление выходит из пола касательно (горизонтально) и приходит в стену
   вертикально — иначе на горизонте видна линия стыка. */
function useCoveGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2);
      pts.push(new THREE.Vector2(COVE_RADIUS + COVE_FILLET * Math.sin(a), COVE_FILLET * (1 - Math.cos(a))));
    }
    pts.push(new THREE.Vector2(COVE_RADIUS + COVE_FILLET, 18));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
}

function StudioCove() {
  const coveTex = useCoveTexture();
  const geom = useCoveGeometry();
  return (
    <mesh geometry={geom} position={[0, 0, 0]}>
      <meshStandardMaterial map={coveTex} side={THREE.BackSide} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function GarageRoom() {
  const wallTex = useWallTexture();
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8, metalness: 0.1, side: THREE.BackSide }),
    [wallTex]
  );
  const ceilingMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#060708", roughness: 0.9, metalness: 0, side: THREE.BackSide }),
    []
  );
  const stripMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#e6efff", emissiveIntensity: 1.9 }),
    []
  );

  // Повторение текстуры по длине стен
  const sideTex = useMemo(() => {
    const t = wallTex.clone();
    t.needsUpdate = true;
    t.repeat.set(4, 1.2);
    return t;
  }, [wallTex]);

  return (
    <group>
      {/* Коробка помещения: стены и потолок одной геометрией, видны изнутри */}
      <mesh position={[0, ROOM_H / 2, 0]} material={wallMat}>
        <boxGeometry args={[ROOM_HALF_W * 2, ROOM_H, ROOM_HALF_D * 2]} />
      </mesh>
      <mesh position={[0, ROOM_H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMat}>
        <planeGeometry args={[ROOM_HALF_W * 2, ROOM_HALF_D * 2]} />
      </mesh>
      <mesh position={[0, 1, -ROOM_HALF_D + 0.05]}>
        <planeGeometry args={[ROOM_HALF_W * 2, 2.0]} />
        <meshStandardMaterial map={sideTex} roughness={0.75} metalness={0.12} />
      </mesh>

      {/* Потолочные LED-панели — источник фирменных продольных бликов на кузове */}
      {[-5.4, 0, 5.4].map((z) => (
        <mesh key={z} position={[0, ROOM_H - 0.12, z]} rotation={[Math.PI / 2, 0, 0]} material={stripMat}>
          <planeGeometry args={[19, 0.8]} />
        </mesh>
      ))}

      {/* Тёплая подсветка по низу стен — гараж не проваливается в чёрное */}
      {[-ROOM_HALF_D + 0.12, ROOM_HALF_D - 0.12].map((z) => (
        <mesh key={z} position={[0, 0.09, z]}>
          <planeGeometry args={[ROOM_HALF_W * 2, 0.07]} />
          <meshStandardMaterial color="#20262c" emissive="#55636f" emissiveIntensity={0.55} side={THREE.DoubleSide} />
        </mesh>
      ))}

    </group>
  );
}

/* Пол студии: мягкий радиальный градиент в цвет циклорамы, без видимого стыка.
   Зеркальный пол здесь давал кромку отражений на горизонте, поэтому он только в гараже. */
function useStudioFloorTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
    g.addColorStop(0, "#b7bbbf");
    g.addColorStop(0.5, "#c9cdd0");
    g.addColorStop(1, "#d7dadd");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function StudioFloor() {
  const tex = useStudioFloorTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[COVE_RADIUS + 0.12, 96]} />
      <meshStandardMaterial map={tex} roughness={0.62} metalness={0.2} />
    </mesh>
  );
}

function GarageFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_HALF_W * 2 - 0.1, ROOM_HALF_D * 2 - 0.1]} />
      <MeshReflectorMaterial
        resolution={512}
        mixBlur={1}
        mixStrength={13}
        blur={[420, 120]}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.35}
        mirror={0}
        color="#07080a"
        metalness={0.72}
        roughness={0.6}
      />
    </mesh>
  );
}

export default function Showroom({ night }: { night: boolean }) {
  return (
    <group>
      {night ? (
        <>
          <GarageRoom />
          <GarageFloor />
        </>
      ) : (
        <>
          <StudioCove />
          <StudioFloor />
        </>
      )}
    </group>
  );
}
