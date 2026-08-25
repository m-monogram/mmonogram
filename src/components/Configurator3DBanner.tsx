import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import bannerBg from "@/assets/g63-wheel.webp";

/** Wireframe 3D studio mark — cube + orbit + axle (tuning constructor) */
const ConfiguratorMark = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    {/* Outer orbit */}
    <ellipse
      cx="32"
      cy="32"
      rx="28"
      ry="12"
      stroke="currentColor"
      strokeWidth="1.2"
      opacity="0.35"
      transform="rotate(-18 32 32)"
    />
    <ellipse
      cx="32"
      cy="32"
      rx="12"
      ry="28"
      stroke="currentColor"
      strokeWidth="1.2"
      opacity="0.25"
      transform="rotate(-18 32 32)"
    />

    {/* Isometric cube */}
    <path
      d="M32 12 L48 21 V39 L32 48 L16 39 V21 Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M32 12 V30 L48 21" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
    <path d="M32 30 L16 21" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
    <path d="M32 30 V48" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />

    {/* Inner axle / wheel hub hint */}
    <circle cx="32" cy="30" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="32" cy="30" r="1.6" fill="currentColor" />
    <path
      d="M32 25.5 V22.8 M32 37.2 V34.5 M27.5 30 H24.8 M39.2 30 H36.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);

/* Переход в 3D-конфигуратор внизу главной страницы */
const Configurator3DBanner = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black">
      {/* Фон: колесо крупным планом + затемнение */}
      <div className="absolute inset-0">
        <img
          src={bannerBg}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-[center_40%] opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-20 sm:py-28">
        <ScrollReveal>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8"
          >
            {/* 3D constructor mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -6 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 self-start"
            >
              <div className="flex h-16 w-16 sm:h-[4.75rem] sm:w-[4.75rem] items-center justify-center border border-white/25 bg-black/40">
                <ConfiguratorMark className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
            </motion.div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.35em] text-white/55 mb-5">
                {t("config.eyebrow")}
              </span>
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-white uppercase tracking-[0.08em] leading-[1.05]">
                {t("config.title")}
              </h2>
              <p className="mt-4 sm:mt-5 font-body text-sm sm:text-base text-white/60 leading-relaxed max-w-md">
                {t("nav.configuratorDesc")}
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate("/configurator");
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-body text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-all cursor-pointer rounded-none"
              >
                {t("config.launch")}
                <ConfiguratorMark className="h-4 w-4 opacity-80" />
              </motion.button>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Configurator3DBanner;
