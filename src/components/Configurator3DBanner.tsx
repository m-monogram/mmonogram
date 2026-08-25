import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import bannerBg from "@/assets/g63-wheel.webp";

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
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.35em] text-white/50 mb-5">
              <Boxes className="w-3.5 h-3.5" />
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
              className="mt-8 px-8 py-4 bg-white text-black font-body text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-all cursor-pointer rounded-none"
            >
              {t("config.launch")}
            </motion.button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Configurator3DBanner;
