import { Component, Suspense, useLayoutEffect, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { BuildConfig, PAINTS, RIM_FINISHES } from "./config";
import { DRACO_PATH, MODEL_FILES, type FileRole, type PartRole } from "./models";
import { classifyPart, computeFit, describeMaterial, type Fit } from "./fitModel";

/**
 * Оцифрованная сборка G63 вместо процедурной заглушки.
 *
 * Модели приходят из заводского CAD без разметки: один серый материал на всё,
 * имена мешей нечитаемые, единицы измерения и ориентация осей неизвестны.
 * Поэтому компонент сам приводит сборку к сцене — разворачивает по осям и
 * нормирует масштаб по длине кузова — и раздаёт материалы, определяя роль
 * каждой части по её месту в габаритах.
 *
 * Кузов обязателен: по нему считается общий трансформ, к которому
 * притягиваются остальные файлы. Обвес, интерьер и руль необязательны —
 * каждый грузится под своей границей ошибок, чтобы отсутствие интерьера не
 * уносило с собой уже загруженный кузов.
 */

type Materials = Record<PartRole, THREE.Material>;

/** Один загруженный файл: клон сцены, общий трансформ, материалы по ролям. */
function Parts({
  url,
  fit: shared,
  kind,
  materials,
  visible = true,
  onFit,
}: {
  url: string;
  fit?: Fit;
  kind: FileRole;
  materials: Materials;
  visible?: boolean;
  onFit?: (fit: Fit) => void;
}) {
  const { scene } = useGLTF(url, DRACO_PATH);

  const prepared = useMemo(() => {
    const root = scene.clone(true);
    const fit = shared ?? computeFit(root);

    root.quaternion.copy(fit.quaternion);
    root.scale.setScalar(fit.scale);
    root.position.copy(fit.position);
    root.updateMatrixWorld(true);

    const byRole: Record<PartRole, THREE.Mesh[]> = {
      body: [], wheel: [], tire: [], glass: [], taillight: [],
      light: [], chrome: [], carbon: [], interior: [], trim: [],
    };

    const box = new THREE.Box3();
    root.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (kind === "interior") {
        // Салон не разбираем: красить его кузовной краской нельзя,
        // а переключаемых частей внутри нет.
        byRole.interior.push(mesh);
        return;
      }

      const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const centerY = box.setFromObject(mesh).getCenter(new THREE.Vector3()).y;
      byRole[classifyPart(describeMaterial(source), centerY, fit.carSize.y, mesh.name)].push(mesh);
    });

    return { root, byRole, fit };
  }, [scene, shared, kind]);

  useLayoutEffect(() => {
    onFit?.(prepared.fit);
  }, [prepared, onFit]);

  useLayoutEffect(() => {
    for (const [role, meshes] of Object.entries(prepared.byRole)) {
      for (const mesh of meshes) mesh.material = materials[role as PartRole];
    }
  }, [prepared, materials]);

  return <primitive object={prepared.root} visible={visible} />;
}

/** Файл, отсутствие которого не должно ломать остальную сборку. */
class OptionalBoundary extends Component<{ children: ReactNode; label: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn(`Модель «${this.props.label}» не загрузилась:`, error.message);
  }

  render() {
    return this.state.failed ? null : <Suspense fallback={null}>{this.props.children}</Suspense>;
  }
}

export default function GClassGLTF({ config }: { config: BuildConfig }) {
  const body = useGLTF(MODEL_FILES.body, DRACO_PATH);
  const fit = useMemo(() => computeFit(body.scene.clone(true)), [body.scene]);

  const materials = useMemo<Materials>(() => {
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
        transmission: 0.75,
        thickness: 0.05,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
      taillight: new THREE.MeshStandardMaterial({
        color: "#2a0707",
        emissive: "#a11212",
        emissiveIntensity: config.lights ? 1.4 : 0.2,
      }),
      light: new THREE.MeshStandardMaterial({
        color: "#f2f4f6",
        emissive: "#dfe8ff",
        emissiveIntensity: config.lights ? 1.6 : 0.05,
      }),
      chrome: new THREE.MeshStandardMaterial({ color: "#cfd3d6", metalness: 1, roughness: 0.08 }),
      carbon: new THREE.MeshPhysicalMaterial({
        color: "#1a1b1f",
        metalness: 0.55,
        roughness: 0.4,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
      trim: new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.4, roughness: 0.6 }),
      interior: config.carbon
        ? new THREE.MeshPhysicalMaterial({ color: "#1a1b1f", metalness: 0.5, roughness: 0.42, clearcoat: 0.8 })
        : new THREE.MeshStandardMaterial({ color: "#26221f", metalness: 0.15, roughness: 0.72 }),
    };
  }, [config.paint, config.rimFinish, config.carbon, config.lights]);

  useLayoutEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  return (
    <group>
      <Parts url={MODEL_FILES.body} fit={fit} kind="exterior" materials={materials} />

      <OptionalBoundary label="обвес и колёса">
        <Parts url={MODEL_FILES.kit} fit={fit} kind="exterior" materials={materials} visible={config.kit} />
      </OptionalBoundary>

      <OptionalBoundary label="интерьер">
        <Parts url={MODEL_FILES.interior} fit={fit} kind="interior" materials={materials} />
      </OptionalBoundary>

      <OptionalBoundary label="руль">
        <Parts url={MODEL_FILES.wheel} fit={fit} kind="interior" materials={materials} />
      </OptionalBoundary>
    </group>
  );
}

useGLTF.preload(MODEL_FILES.body, DRACO_PATH);
useGLTF.preload(MODEL_FILES.kit, DRACO_PATH);
