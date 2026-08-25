import { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { BuildConfig, PAINTS, RIM_FINISHES } from "./config";
import { DRACO_PATH, MODEL_FILES, TARGET_LENGTH, WHEEL_RULES, type PartRole } from "./models";

/**
 * Оцифрованная сборка G63 вместо процедурной заглушки.
 *
 * Модели приходят из заводского CAD без разметки: один серый материал на всё,
 * имена мешей нечитаемые, единицы измерения и ориентация осей неизвестны.
 * Поэтому компонент сам приводит сборку к сцене — разворачивает по осям,
 * нормирует масштаб по длине кузова — и раздаёт материалы, определяя роль
 * каждой части по её месту в габаритах.
 */

interface Fit {
  quaternion: THREE.Quaternion;
  scale: number;
  position: THREE.Vector3;
}

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

/**
 * Считает разворот и масштаб сборки: высота машины — самый короткий габарит,
 * длина идёт вдоль X, колёса стоят на нулевой отметке.
 */
function computeFit(object: THREE.Object3D): Fit {
  const raw = new THREE.Box3().setFromObject(object);
  const size = raw.getSize(new THREE.Vector3());

  const quaternion = new THREE.Quaternion();
  const axes = [size.x, size.y, size.z];
  const shortest = axes.indexOf(Math.min(...axes));
  // FBX из CAD чаще всего Z-up: короткая ось приезжает третьей
  if (shortest === 2) quaternion.setFromAxisAngle(X, -Math.PI / 2);
  else if (shortest === 0) quaternion.setFromAxisAngle(Z, Math.PI / 2);

  const rotate = () => raw.clone().applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(quaternion));

  let box = rotate();
  let fitted = box.getSize(new THREE.Vector3());

  // Машина должна смотреть вдоль X — как процедурная заглушка, которую заменяем
  if (fitted.z > fitted.x) {
    quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(Y, Math.PI / 2));
    box = rotate();
    fitted = box.getSize(new THREE.Vector3());
  }

  const scale = fitted.x > 0 ? TARGET_LENGTH / fitted.x : 1;
  const center = box.getCenter(new THREE.Vector3());

  return {
    quaternion,
    scale,
    position: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
  };
}

function applyFit(object: THREE.Object3D, fit: Fit) {
  object.quaternion.copy(fit.quaternion);
  object.scale.setScalar(fit.scale);
  object.position.copy(fit.position);
  object.updateMatrixWorld(true);
}

/**
 * Определяет роль меша по его габаритному ящику в мировых координатах —
 * то есть уже после разворота и нормировки, где X это длина, Y высота
 * от земли, Z ширина.
 */
function classify(mesh: THREE.Mesh, carSize: THREE.Vector3): PartRole {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const material = mesh.material as THREE.Material | THREE.Material[];
  const first = Array.isArray(material) ? material[0] : material;
  if (first && "opacity" in first && first.transparent && first.opacity < 0.9) return "glass";

  const rel = Math.max(size.x, size.y, size.z) / carSize.x;
  if (rel < WHEEL_RULES.minSizeRatio) return "trim";

  const lowEnough = center.y / carSize.y < WHEEL_RULES.maxCenterY;
  const offAxis = Math.abs(center.z) / (carSize.z / 2) > WHEEL_RULES.minCenterOffsetZ;
  const round = size.y > 0 && Math.abs(size.x - size.y) / Math.max(size.x, size.y) < WHEEL_RULES.maxAspectSkew;
  const narrow = size.z / Math.max(size.x, size.y) < WHEEL_RULES.maxWidthRatio;

  if (lowEnough && offAxis && round && narrow) return "wheel";
  return "body";
}

interface Prepared {
  root: THREE.Group;
  kitGroup: THREE.Group;
  byRole: Record<PartRole, THREE.Mesh[]>;
}

/** Клонирует сцены, ставит их в общий масштаб и раскладывает меши по ролям. */
function prepare(bodyScene: THREE.Object3D, kitScene: THREE.Object3D): Prepared {
  const root = new THREE.Group();
  const bodyGroup = bodyScene.clone(true) as THREE.Group;
  const kitGroup = kitScene.clone(true) as THREE.Group;

  const fit = computeFit(bodyGroup);
  applyFit(bodyGroup, fit);
  applyFit(kitGroup, fit);

  root.add(bodyGroup, kitGroup);
  root.updateMatrixWorld(true);

  const carSize = new THREE.Box3().setFromObject(bodyGroup).getSize(new THREE.Vector3());
  const byRole: Record<PartRole, THREE.Mesh[]> = { body: [], wheel: [], tire: [], glass: [], trim: [] };

  root.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    byRole[classify(mesh, carSize)].push(mesh);
  });

  return { root, kitGroup, byRole };
}

export default function GClassGLTF({ config }: { config: BuildConfig }) {
  const body = useGLTF(MODEL_FILES.body, DRACO_PATH);
  const kit = useGLTF(MODEL_FILES.kit, DRACO_PATH);

  const prepared = useMemo(() => prepare(body.scene, kit.scene), [body.scene, kit.scene]);

  const materials = useMemo(() => {
    const paint = PAINTS[config.paint];
    const finish = RIM_FINISHES[config.rimFinish];
    return {
      body: new THREE.MeshPhysicalMaterial({
        color: paint.color,
        metalness: paint.metalness,
        roughness: paint.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
      wheel: new THREE.MeshStandardMaterial({
        color: finish.color,
        metalness: finish.metalness,
        roughness: finish.roughness,
      }),
      tire: new THREE.MeshStandardMaterial({ color: "#0e0e0e", metalness: 0, roughness: 0.95 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#10151a",
        metalness: 0.25,
        roughness: 0.05,
        transmission: 0.6,
        transparent: true,
        opacity: 0.55,
      }),
      trim: config.carbon
        ? new THREE.MeshPhysicalMaterial({ color: "#1a1b1f", metalness: 0.55, roughness: 0.4, clearcoat: 1 })
        : new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.4, roughness: 0.6 }),
    } satisfies Record<PartRole, THREE.Material>;
  }, [config.paint, config.rimFinish, config.carbon]);

  useLayoutEffect(() => {
    for (const [role, meshes] of Object.entries(prepared.byRole)) {
      for (const mesh of meshes) mesh.material = materials[role as PartRole];
    }
    return () => Object.values(materials).forEach((m) => m.dispose());
  }, [prepared, materials]);

  useLayoutEffect(() => {
    prepared.kitGroup.visible = config.kit;
  }, [prepared, config.kit]);

  return <primitive object={prepared.root} />;
}

useGLTF.preload(MODEL_FILES.body, DRACO_PATH);
useGLTF.preload(MODEL_FILES.kit, DRACO_PATH);
