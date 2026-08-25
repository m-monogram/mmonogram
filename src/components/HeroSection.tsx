import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useNavigation } from "@/hooks/useNavigation";
import { useContent } from "@/hooks/useContent";
import heroImage from "@/assets/hero-main-new.webp";
import heroImageMobile from "@/assets/hero-main-mobile.webp";
import MediaEdgeFade, { mediaFadeMask } from "@/components/MediaEdgeFade";

interface HeroSectionProps {
  setCurrentView?: (view: string) => void;
}

const HeroSection = memo(({ setCurrentView }: HeroSectionProps) => {
  const { navigateToView } = useNavigation({ setCurrentView });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imagePosition, setImagePosition] = useState("center 20%");
  const { t } = useLanguage();
  const { content: heroCms, isVisible: heroVisible } = useContent("hero");

  // Адаптивная позиция изображения - оптимально для каждого устройства
  // Use matchMedia + rAF to avoid forced reflows from synchronous innerWidth reads
  useEffect(() => {
    const desktopMql = window.matchMedia("(min-width: 1280px)");
    const tabletMql = window.matchMedia("(min-width: 768px)");
    let rafId = 0;

    const updatePosition = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (desktopMql.matches) {
          setImagePosition("center 66%");
        } else if (tabletMql.matches) {
          setImagePosition("center 70%");
        } else {
          setImagePosition("center 75%");
        }
      });
    };

    updatePosition();
    desktopMql.addEventListener("change", updatePosition);
    tabletMql.addEventListener("change", updatePosition);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      desktopMql.removeEventListener("change", updatePosition);
      tabletMql.removeEventListener("change", updatePosition);
    };
  }, []);

  if (!heroVisible) return null;

  return (
    <AuroraBackground className="h-[100dvh]" intensity="subtle" showRadialGradient={true} fillHeight>
      <section className="relative h-full flex flex-col justify-end overflow-hidden w-full z-10">
        {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-premium-black w-full">
          <picture>
            <source media="(max-width: 767px)" srcSet={heroImageMobile} />
            <img
              src={heroImage}
              alt="M-Monogram G-Class at private jet terminal"
              onLoad={() => setImageLoaded(true)}
              fetchpriority="high"
              decoding="async"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ objectPosition: imagePosition, ...mediaFadeMask }}
            />
          </picture>

          {/* Gradient overlay - адаптивный */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:from-black/25" />
          <MediaEdgeFade edges="bottom" />
        </div>

        {/* Buttons - подняты выше на мобильных для видимости без скролла */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-[max(env(safe-area-inset-bottom),1.5rem)] sm:pb-6 md:pb-6 lg:pb-8 w-full">
          <motion.button
            type="button"
            onClick={() => navigateToView("contact")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-white text-black font-body text-sm sm:text-base uppercase tracking-widest hover:bg-white/90 transition-all duration-300 cursor-pointer touch-target shadow-lg hover:shadow-xl"
          >
            {String(heroCms?.buttonBookProject || t("hero.bookProject"))}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigateToView("projects")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-transparent border border-white/30 text-white font-body text-sm sm:text-base uppercase tracking-widest hover:border-white/60 hover:bg-white/5 transition-all duration-300 cursor-pointer touch-target"
          >
            {String(heroCms?.buttonDiscover || t("hero.discoverCollection"))}
          </motion.button>
        </div>
      </section>
    </AuroraBackground>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
