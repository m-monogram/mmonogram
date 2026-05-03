import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useNavigation } from "@/hooks/useNavigation";
import heroImage from "@/assets/hero-main.jpg";

interface HeroSectionProps {
  setCurrentView?: (view: string) => void;
}

const HeroSection = memo(({ setCurrentView }: HeroSectionProps) => {
  const { navigateToView } = useNavigation({ setCurrentView });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imagePosition, setImagePosition] = useState("center 20%");
  const { t } = useLanguage();

  // Адаптивная позиция изображения - оптимально для каждого устройства
  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth >= 1280) {
        // Большие экраны: ~23.5% неба, фокус на машине
        setImagePosition("center 66%");
      } else if (window.innerWidth >= 768) {
        // Десктоп: сбалансированный вид
        setImagePosition("center 70%");
      } else {
        // Мобильные: фокус на машине
        setImagePosition("center 75%");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <AuroraBackground className="h-[100dvh]" intensity="subtle" showRadialGradient={true} fillHeight>
      <section className="relative h-full flex flex-col justify-end overflow-hidden w-full z-10">
        {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-premium-black w-full">
          <img
            src={heroImage}
            alt={t("hero.alt")}
            onLoad={() => setImageLoaded(true)}
            loading="eager"
            decoding="sync"
            fetchpriority="high"
            className={`w-full h-full transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } object-cover scale-[1.25] origin-bottom sm:scale-100 sm:origin-center`}
            style={{ objectPosition: imagePosition }}
          />
          {/* Gradient overlay - адаптивный */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:from-black md:via-black/30" />
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
            {t("hero.bookProject")}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigateToView("projects")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-transparent border border-white/30 text-white font-body text-sm sm:text-base uppercase tracking-widest hover:border-white/60 hover:bg-white/5 transition-all duration-300 cursor-pointer touch-target"
          >
            {t("hero.discoverCollection")}
          </motion.button>
        </div>
      </section>
    </AuroraBackground>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
