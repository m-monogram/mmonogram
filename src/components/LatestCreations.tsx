import { useState, useCallback, useEffect, memo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import { getListingProjects } from "@/data/projects";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuroraBackground } from "@/components/ui/aurora-background";

interface LatestCreationsProps {
  onProjectClick?: (projectId: string) => void;
}

/**
 * Latest creations carousel - optimized for performance
 */
const LatestCreations = memo(({ onProjectClick }: LatestCreationsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();
  const { projects: dbProjects } = useProjects();

  const carouselProjects = getListingProjects(dbProjects).map((p) => ({
    id: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    image: p.cover_image,
    category: p.category,
  }));

  // Touch/swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const paginate = useCallback((direction: number) => {
    setCurrentIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = carouselProjects.length - 1;
      if (next >= carouselProjects.length) next = 0;
      return next;
    });
  }, [carouselProjects.length]);

  // Auto-advance every 5s
  useEffect(() => {
    const interval = setInterval(() => paginate(1), 5000);
    return () => clearInterval(interval);
  }, [paginate]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    isDragging.current = true;
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      paginate(1);
    } else if (isRightSwipe) {
      paginate(-1);
    }

    // Reset touch values
    touchStartX.current = 0;
    touchEndX.current = 0;
    isDragging.current = false;
  }, [paginate]);

  const currentProject = carouselProjects[currentIndex];

  return (
    <AuroraBackground className="py-12 sm:py-16 md:py-20" intensity="subtle" showRadialGradient={true}>
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-body text-white/40 text-xs tracking-widest uppercase mb-2">[ OUR PROJECTS ]</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-widest text-white uppercase font-bold">
                LATEST CREATIONS
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => paginate(-1)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-transparent border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-transparent border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProject.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer group"
              onClick={() => onProjectClick?.(currentProject.id)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image Container - 4:5 ratio for full visibility */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-premium-black border border-white/10">
                <img
                  src={currentProject.image}
                  alt={currentProject.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                />
                {/* Clean hover overlay - no text inside */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Project info - below card */}
              <div className="mt-4 sm:mt-5">
                <p className="font-body text-white/50 text-xs tracking-widest uppercase mb-1">
                  {currentProject.category}
                </p>
                <h3 className="font-display text-white text-xl sm:text-2xl tracking-widest uppercase font-bold">
                  {currentProject.title}
                </h3>
                <p className="font-body text-white/70 text-sm sm:text-base mt-1">
                  {currentProject.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {carouselProjects.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-none transition-all duration-300 cursor-pointer ${index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/25 w-1.5 hover:bg-white/40"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </AuroraBackground>
  );
});

LatestCreations.displayName = "LatestCreations";

export default LatestCreations;
