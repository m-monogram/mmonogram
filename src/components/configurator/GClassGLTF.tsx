import { Component, Suspense, useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BuildConfig, PAINTS, RIM_FINISHES } from "./config";
import { DRACO_PATH, MODEL_FILES, ROLE_DEBUG_COLORS, type FileRole, type PartRole } from "./models";
import { classifyCabin, classifyPart, computeFit, describeMaterial, isDebris, type Fit } from "./fitModel";

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
  onGround,
}: {
  url: string;
  fit?: Fit;
  kind: FileRole;
  materials: Materials;
  visible?: boolean;
  /** Нижняя точка файла после посадки — по ней выставляется уровень пола. */
  onGround?: (url: string, minY: number) => void;
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
      body: [], wheel: [], wheelAccent: [], tire: [], glass: [], taillight: [],
      light: [], chrome: [], carbon: [], cabinLeather: [], cabinAccent: [],
      cabinFloor: [], cabinRoof: [], trim: [],
    };

    const cabin = kind === "interior" ? new THREE.Box3().setFromObject(root) : null;
    const box = new THREE.Box3();
    root.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      box.setFromObject(mesh);
      if (isDebris(mesh, box)) {
        mesh.visible = false;
        return;
      }
      if (cabin) {
        const center = box.getCenter(new THREE.Vector3());
        byRole[classifyCabin(center, cabin)].push(mesh);
        return;
      }

      const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      byRole[classifyPart(describeMaterial(source), box, fit.carSize, mesh.name)].push(mesh);
    });

    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("parts")) {
      for (const [role, meshes] of Object.entries(byRole)) {
        if (meshes.length) {
          console.info(`[${url.split("/").pop()}] ${role}:`, meshes.map((m) => m.name).join(", "));
        }
      }
    }

    return { root, byRole, fit, minY: new THREE.Box3().setFromObject(root).min.y };
  }, [scene, shared, kind, url]);

  useLayoutEffect(() => {
    onGround?.(url, prepared.minY);
  }, [url, prepared, onGround]);

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

  const debugRoles = useMemo(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("parts"),
    [],
  );

  const materials = useMemo<Materials>(() => {
    if (debugRoles) {
      const debug = {} as Materials;
      for (const [role, color] of Object.entries(ROLE_DEBUG_COLORS)) {
        debug[role as PartRole] = new THREE.MeshBasicMaterial({ color });
      }
      return debug;
    }

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
      // Поле диска у G63 Iconic глянцево-чёрное, отделкой красятся спицы
      wheel: new THREE.MeshPhysicalMaterial({
        color: "#0a0a0b",
        metalness: 0.6,
        roughness: 0.14,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
      wheelAccent: new THREE.MeshStandardMaterial({
        color: finish.color,
        metalness: finish.metalness,
        roughness: finish.roughness,
      }),
      tire: new THREE.MeshStandardMaterial({ color: "#202427", metalness: 0, roughness: 0.92 }),
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
      // Выключенный карбон-пакет означает «в цвет кузова» — так и в панели
      carbon: config.carbon
        ? new THREE.MeshPhysicalMaterial({
            color: "#1a1b1f",
            metalness: 0.55,
            roughness: 0.4,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
          })
        : new THREE.MeshPhysicalMaterial({
            color: paint.color,
            metalness: paint.metalness,
            roughness: paint.roughness,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
          }),
      trim: new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.4, roughness: 0.6 }),
      /* Палитра салона снята с фотографий проекта (g3-iconic-gold-rearseats):
         чёрная кожа сидений #231e1d, коньячные панели #4e2a26…#613c36,
         тёмный потолок #0f0c0d. */
      cabinLeather: new THREE.MeshPhysicalMaterial({
        color: "#231e1d",
        metalness: 0.02,
        roughness: 0.5,
        clearcoat: 0.35,
        clearcoatRoughness: 0.5,
      }),
      cabinAccent: new THREE.MeshPhysicalMaterial({
        color: "#5a3630",
        metalness: 0.03,
        roughness: 0.45,
        clearcoat: 0.5,
        clearcoatRoughness: 0.4,
      }),
      cabinFloor: new THREE.MeshStandardMaterial({ color: "#100d0e", metalness: 0, roughness: 0.95 }),
      cabinRoof: new THREE.MeshStandardMaterial({ color: "#131011", metalness: 0, roughness: 0.94 }),
    };
  }, [debugRoles, config.paint, config.rimFinish, config.carbon, config.lights]);

  useLayoutEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  /*
   * Пол считается по всей видимой сборке, а не по одному кузову: покрышки
   * лежат в файле обвеса и уходят на 15 см ниже низа кузова. Трансформ,
   * посаженный только по кузову, утапливал их под пол — колёса выглядели
   * срезанными.
   */
  const [grounds, setGrounds] = useState<Record<string, number>>({});
  const reportGround = useCallback((url: string, minY: number) => {
    setGrounds((prev) => (prev[url] === minY ? prev : { ...prev, [url]: minY }));
  }, []);

  const groundOffset = useMemo(() => {
    const active = Object.entries(grounds).filter(([url]) => url !== MODEL_FILES.kit || config.kit);
    return active.length ? -Math.min(...active.map(([, y]) => y)) : 0;
  }, [grounds, config.kit]);

  // frameloop="demand": без явного запроса сдвиг пола не попал бы в кадр
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => invalidate(), [groundOffset, invalidate]);

  return (
    <group position-y={groundOffset}>
      <Parts url={MODEL_FILES.body} fit={fit} kind="exterior" materials={materials} onGround={reportGround} />

      <OptionalBoundary label="обвес и колёса">
        <Parts
          url={MODEL_FILES.kit}
          fit={fit}
          kind="exterior"
          materials={materials}
          visible={config.kit}
          onGround={reportGround}
        />
      </OptionalBoundary>

      <OptionalBoundary label="интерьер">
        <Parts url={MODEL_FILES.interior} fit={fit} kind="interior" materials={materials} />
      </OptionalBoundary>
    </group>
  );
}

useGLTF.preload(MODEL_FILES.body, DRACO_PATH);
useGLTF.preload(MODEL_FILES.kit, DRACO_PATH);
