import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BuildConfig,
  decodeConfig,
  encodeConfig,
  type CameraFocus,
} from "@/components/configurator/config";
import ConfigPanel from "@/components/configurator/ConfigPanel";
import SceneErrorBoundary from "@/components/configurator/SceneErrorBoundary";

// three.js подтягивается только на этой странице — остальной сайт не тяжелеет
const ConfiguratorScene = lazy(() => import("@/components/configurator/Scene"));

const ConfiguratorPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = useState<BuildConfig>(() => decodeConfig(searchParams.get("c")));
  const [focus, setFocus] = useState<CameraFocus>("default");
  // Меню скрыто по умолчанию — машина видна целиком, открывается стрелкой
  const [menuOpen, setMenuOpen] = useState(false);

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

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setFocus("default");
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-premium-black">
      <SEOHead
        title="3D Studio - M-Monogram | Build Your G-Class"
        description="Configure your bespoke M-Monogram G-Class in real-time 3D: body colors, forged wheels, carbon packages and the M-Monogram body kit."
        path="/configurator"
      />
      <Header variant={config.night ? "dark" : "light"} />

      <div id="configurator-canvas" className="absolute inset-0">
        <SceneErrorBoundary>
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
        </SceneErrorBoundary>
      </div>

      <div
        className={`absolute left-4 sm:left-6 md:left-12 z-20 pointer-events-none ${config.night ? "text-white" : "text-black"}`}
        style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}
      >
        <h1
          className={`font-display text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.18em] ${
            config.night ? "text-white" : "text-black"
          }`}
        >
          {t("config.title")}
        </h1>
        <p className={`mt-1 font-body text-[11px] sm:text-xs ${config.night ? "text-white/50" : "text-black/60"}`}>
          {t("config.subtitle")}
        </p>
      </div>

      <div
        className={`absolute left-4 sm:left-6 md:left-12 bottom-4 z-20 pointer-events-none hidden md:block ${
          config.night ? "text-white/40" : "text-black/40"
        }`}
      >
        <p className="font-body text-[11px]">{t("config.hint")}</p>
        <p className="font-body text-[10px] mt-1 opacity-70">{t("config.demoNote")}</p>
      </div>

      {/* Стрелка открытия — справа, как в референсе Mansory */}
      <AnimatePresence>
        {!menuOpen && (
          <motion.div
            key="open-toggle"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
            className="absolute z-40 right-3 sm:right-5 top-[max(6.75rem,18%)] flex flex-col items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("config.openMenu")}
              className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-md shadow-lg transition-transform hover:scale-[1.04] active:scale-[0.98] cursor-pointer ${
                config.night
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-[#ececec] text-black hover:bg-white border border-black/10"
              }`}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.25} />
            </button>
            <span
              className={`pointer-events-none hidden sm:block max-w-[7.5rem] text-center font-body text-[9px] uppercase tracking-[0.14em] leading-tight px-2 py-1.5 rounded-sm ${
                config.night ? "bg-black/70 text-white/85" : "bg-[#1a1a1a]/85 text-white/90"
              }`}
            >
              {t("config.openMenu")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Выезжающая панель конфигурации */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Лёгкий затемняющий слой только на мобиле */}
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label={t("config.closeMenu")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="absolute inset-0 z-30 bg-black/35 md:bg-transparent md:pointer-events-none cursor-pointer md:cursor-default"
            />

            <motion.aside
              initial={{ x: "110%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "110%", opacity: 0.6 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute z-40 flex flex-col gap-2.5
                right-3 sm:right-5
                top-[max(5.5rem,env(safe-area-inset-top)+4.5rem)]
                bottom-[max(1rem,env(safe-area-inset-bottom))]
                w-[min(292px,calc(100vw-1.5rem))]
                md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:max-h-[min(78vh,640px)]"
            >
              {/* Кнопка свернуть — на самом aside, иначе её обрезает прокрутка панели */}
              <button
                type="button"
                onClick={closeMenu}
                aria-label={t("config.closeMenu")}
                className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-50 hidden md:flex h-9 w-9 items-center justify-center rounded-md bg-white text-black shadow-lg hover:bg-white/90 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
              </button>

              <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain rounded-xl border border-white/10 bg-[rgba(15,15,16,0.94)] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                <ConfigPanel
                  config={config}
                  onChange={handleChange}
                  onSectionChange={(s) => setFocus(s && s !== "overview" ? s : "default")}
                />
              </div>

              {/* Отдельная кнопка закрытия под меню — как в референсе */}
              <button
                type="button"
                onClick={closeMenu}
                aria-label={t("config.closeMenu")}
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#2a2a2a]/95 border border-white/10 text-white hover:bg-[#353535] transition-colors cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfiguratorPage;
