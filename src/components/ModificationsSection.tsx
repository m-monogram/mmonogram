import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getLocalizedModificationCategories, ModificationCategory } from "@/data/modifications";
import ModificationDetail from "./ModificationDetail";
import NextSectionCTA from "./NextSectionCTA";
import { useLanguage } from "@/contexts/LanguageContext";
import { BlurText } from "@/components/ui/blur-text";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useNavigation } from "@/hooks/useNavigation";
interface ModificationsSectionProps {
  setCurrentView?: (view: string) => void;
}
const ModificationsSection = ({
  setCurrentView
}: ModificationsSectionProps) => {
  const navigate = useNavigate();
  const {
    navigateToView
  } = useNavigation({
    setCurrentView
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const {
    t
  } = useLanguage();

  // Get localized categories
  const modificationCategories = useMemo(() => getLocalizedModificationCategories(t), [t]);

  // Find selected category from localized list
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return modificationCategories.find(c => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, modificationCategories]);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);
  if (selectedCategory) {
    return <ModificationDetail category={selectedCategory} onClose={() => setSelectedCategoryId(null)} setCurrentView={setCurrentView} />;
  }
  return <AuroraBackground className="min-h-screen justify-start" intensity="subtle" showRadialGradient={true}>
    <div className="relative z-10 w-full">
      {/* Back Button */}
      <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{
        top: `calc(env(safe-area-inset-top, 0px) + 6rem)`
      }}>
        <motion.button type="button" onClick={() => navigateToView("home")} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50 backdrop-blur-md rounded-none">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </motion.button>
      </div>

      {/* Header */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-16 pt-36 sm:pt-40 pb-8 sm:pb-12">
        <div className="text-center max-w-2xl mx-auto">
          <BlurText text={t("modifications.title")} className="font-display text-2xl sm:text-3xl md:text-4xl tracking-widest text-foreground mb-3" delay={0.1} />
          <motion.p initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.5
          }} className="font-body text-subtitle text-muted-foreground">
            {t("modifications.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Categories Grid with Hover Effect */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-16 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {modificationCategories.map((category, index) => <motion.div key={category.id} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.08
          }} onClick={() => setSelectedCategoryId(category.id)} viewport={{
            once: true
          }} className="relative group cursor-pointer" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
            {/* Enhanced Hover Background */}
            <AnimatePresence>
              {hoveredIndex === index && <motion.span className="absolute inset-0 h-full w-full bg-neutral-200/10 dark:bg-slate-800/30 block rounded-none -m-2 p-2" layoutId="categoryHoverBackground" initial={{
                opacity: 0
              }} animate={{
                opacity: 1,
                transition: {
                  duration: 0.15
                }
              }} exit={{
                opacity: 0,
                transition: {
                  duration: 0.15,
                  delay: 0.2
                }
              }} />}
            </AnimatePresence>

            {/* Card */}
            <div className="relative z-10 overflow-hidden rounded-none border border-border/50 group-hover:border-foreground/30 bg-background transition-all duration-300 shadow-sm group-hover:shadow-lg">
              {/* Cover Image */}
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-black">
                <img src={category.coverImage} alt={category.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={category.id === "exterior" ? {
                  objectPosition: "center 5%"
                } : category.id === "interior" ? {
                  objectPosition: "center 25%"
                } : category.id === "wheels" ? {
                  objectPosition: "center center"
                } : category.id === "protection" ? {
                  objectPosition: "center 20%"
                } : undefined} loading={index < 2 ? "eager" : "lazy"} decoding={index < 2 ? "sync" : "async"} fetchpriority={index < 2 ? "high" : "auto"} sizes="(max-width: 640px) 100vw, 50vw" />
                {/* Lighter gradient for text visibility - only at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

                {/* Icon & Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    <div>
                      <h3 className="font-display text-xl sm:text-2xl tracking-widest text-white uppercase font-bold" style={{
                        textShadow: '0 2px 10px rgba(0,0,0,0.9)'
                      }}>
                        {category.title}
                      </h3>
                      <span className="font-body text-sm text-white/80" style={{
                        textShadow: '0 1px 5px rgba(0,0,0,0.9)'
                      }}>
                        {category.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}

                </div>
              </div>

            </div>
          </motion.div>)}
        </div>
      </section>

      {/* Next Section CTA: Contact */}
      <NextSectionCTA label={t("modifications.readyToStart")} nextLabel={t("modifications.contactUs")} onClick={() => {
        if (setCurrentView) {
          setCurrentView("contact");
        } else {
          navigate("/contact");
        }
      }} variant="light" />
    </div>
  </AuroraBackground>;
};
export default ModificationsSection;