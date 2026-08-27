import { Component, Suspense, type ReactNode } from "react";
import GClassModel from "./GClassModel";
import GClassGLTF from "./GClassGLTF";
import { BuildConfig } from "./config";
import { DEFAULT_CAR } from "./models";

/**
 * Точка подключения машины в сцену.
 *
 * Пока оцифрованные модели не выложены в public/models — или если они не
 * загрузились у посетителя — конфигуратор работает на процедурной заглушке.
 * Она же служит заполнителем на время загрузки: geometry весит десятки
 * мегабайт, и пустая сцена всё это время выглядела бы поломкой.
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
  const placeholder = <GClassModel config={config} doorsOpen={doorsOpen} />;
  const interactiveOpenings = doorsOpen || config.doors || config.hood || config.trunk;

  if (interactiveOpenings && config.model === DEFAULT_CAR) return placeholder;

  return (
    <ModelBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <GClassGLTF config={config} />
      </Suspense>
    </ModelBoundary>
  );
}
