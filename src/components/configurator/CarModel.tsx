import { Component, Suspense, type ReactNode } from "react";
import GClassModel from "./GClassModel";
import GClassGLTF from "./GClassGLTF";
import { BuildConfig } from "./config";
import { CARS, DEFAULT_CAR } from "./models";

/**
 * Точка подключения машины в сцену.
 *
 * Оцифрованная сборка — единственное, что видит посетитель. Процедурная
 * заглушка осталась только на два случая: пока грузятся GLB (десятки
 * мегабайт, и пустая сцена всё это время выглядела бы поломкой) и если они
 * не загрузились вовсе.
 *
 * Раньше заглушка подменяла сборку ещё и в рабочих режимах — при взгляде из
 * салона и при открытых дверях. На экране это выглядело как поломка: вместо
 * фотореалистичного G63 появлялась грубая коробка, а оцифрованный салон
 * (custom-interior.glb, 2.6 МБ) не показывался никогда, хотя грузился всегда.
 * Открывание дверей у оцифрованного кузова невозможно — он идёт одним мешем,
 * — поэтому раздел «Openings» теперь просто не показывается для таких машин
 * (см. CarModel.supportsOpenings), а не подменяет всю машину.
 */

class ModelBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("3D-модели недоступны, показываю заглушку:", error.message);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function CarModel({ config, doorsOpen = false }: { config: BuildConfig; doorsOpen?: boolean }) {
  const car = CARS[config.model] ?? CARS[DEFAULT_CAR];
  const placeholder = <GClassModel config={config} doorsOpen={doorsOpen && !!car.supportsOpenings} />;

  return (
    <ModelBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <GClassGLTF config={config} />
      </Suspense>
    </ModelBoundary>
  );
}
