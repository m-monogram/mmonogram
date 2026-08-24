import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MediaEdgeFade from "@/components/MediaEdgeFade";

interface NextSectionCTAProps {
  label: string;
  nextLabel: string;
  onClick: () => void;
  variant?: "light" | "dark";
}

/**
 * Contextual "Next" CTA component for end of sections
 * Creates coherent navigation flow between pages
 */
const NextSectionCTA = memo(({
  label,
  nextLabel,
  onClick,
  variant = "dark",
  backgroundImage,
}: NextSectionCTAProps & { backgroundImage?: string }) => {
  const isDark = variant === "dark";
  const { t } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden ${!backgroundImage ? (isDark ? "bg-premium-black" : "luxury-bg") : ""}`}
    >
      {backgroundImage && (
        <>
          <div className="absolute inset-0 z-0">
            <img
              src={backgroundImage}
              alt={nextLabel}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 z-0" />
          <MediaEdgeFade edges="both" />
        </>
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Label */}
        <p className="font-body text-xs tracking-widest text-white/60 uppercase mb-2">
          {label}
        </p>

        {/* Next Section Title */}
        <h3 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-widest text-white uppercase mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {nextLabel}
        </h3>

        {/* CTA Button */}
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 sm:px-10 sm:py-4 font-body text-sm sm:text-base uppercase tracking-widest hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border-none"
        >
          <span>{t("common.continue")}</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

      </div>
    </motion.section>
  );
});

NextSectionCTA.displayName = "NextSectionCTA";

export default NextSectionCTA;
