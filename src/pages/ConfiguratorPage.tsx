import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { BuildConfig, decodeConfig, encodeConfig } from "@/components/configurator/config";
import ConfigPanel from "@/components/configurator/ConfigPanel";
import type { CameraFocus } from "@/components/configurator/Scene";

// three.js подтягивается только на этой странице — остальной сайт не тяжелеет
const ConfiguratorScene = lazy(() => import("@/components/configurator/Scene"));

const ConfiguratorPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<BuildConfig>(() => decodeConfig(searchParams.get("c")));
  const [focus, setFocus] = useState<CameraFocus>("default");

  // Конфигурация живёт в URL — ссылкой можно делиться, как у Mansory
  const handleChange = useCallback(
    (next: BuildConfig) => {
      setConfig(next);
      setSearchParams({ c: encodeConfig(next) }, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-premium-black">
      <SEOHead
        title="3D Studio - M-Monogram | Build Your G-Class"
        description="Configure your bespoke M-Monogram G-Class in real-time 3D: body colors, forged wheels, carbon packages and the M-Monogram body kit."
        path="/configurator"
      />
      {/* Студийный фон светлый — шапке нужен тёмный вариант; ночью наоборот */}
      <Header variant={config.night ? "dark" : "light"} />

      {/* 3D-сцена */}
      <div id="configurator-canvas" className="absolute inset-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-foreground/40 animate-pulse">
                {t("hero.loading")}...
              </p>
            </div>
          }
        >
          <ConfiguratorScene config={config} focus={focus} />
        </Suspense>
      </div>

      {/* Заголовок */}
      <div
        className={`absolute left-4 sm:left-6 md:left-12 z-20 pointer-events-none ${config.night ? "text-white" : "text-black"}`}
        style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}
      >
        <h1 className={`font-display text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.18em] ${config.night ? "text-white" : "text-black"}`}>
          {t("config.title")}
        </h1>
        <p className={`mt-1 font-body text-[11px] sm:text-xs ${config.night ? "text-white/50" : "text-black/60"}`}>
          {t("config.subtitle")}
        </p>
      </div>

      {/* Подсказка и пометка о демо-модели */}
      <div
        className={`absolute left-4 sm:left-6 md:left-12 bottom-4 z-20 pointer-events-none hidden md:block ${
          config.night ? "text-white/40" : "text-black/40"
        }`}
      >
        <p className="font-body text-[11px]">{t("config.hint")}</p>
        <p className="font-body text-[10px] mt-1 opacity-70">{t("config.demoNote")}</p>
      </div>

      {/* Панель настроек: справа на десктопе, нижний лист на мобильном */}
      <aside className="absolute z-30 md:right-6 md:top-1/2 md:-translate-y-1/2 md:w-[300px] md:max-h-[86vh] inset-x-0 bottom-0 max-h-[52vh] md:inset-x-auto md:bottom-auto overflow-y-auto bg-[#101010]/90 backdrop-blur-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <ConfigPanel
          config={config}
          onChange={handleChange}
          onSectionChange={(s) => setFocus(s && s !== "overview" ? s : "default")}
        />
      </aside>
    </div>
  );
};

export default ConfiguratorPage;
