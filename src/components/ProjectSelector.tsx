import { useState, useRef, useCallback, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects, DBProject } from "@/hooks/useProjects";
import { getListingProjects } from "@/data/projects";

interface ProjectSelectorProps {
  onSelect?: (project: DBProject) => void;
  selectedId?: string;
}

/**
 * Apple-style horizontal project carousel
 * Optimized for performance with CSS scroll-snap
 */
const ProjectSelector = memo(({ onSelect }: ProjectSelectorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { projects: allProjects } = useProjects();
  const projects = getListingProjects(allProjects);

  // Touch/swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('[data-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  // Handle scroll to update active index
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;
    const cards = container.querySelectorAll('[data-card]');

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = (card as HTMLElement).offsetLeft + (card as HTMLElement).offsetWidth / 2;
      const distance = Math.abs(scrollCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [activeIndex]);

  const goToPrev = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1);
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  }, [activeIndex, scrollToIndex]);

  const goToNext = useCallback(() => {
    const newIndex = Math.min(projects.length - 1, activeIndex + 1);
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  }, [activeIndex, scrollToIndex]);

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

    if (isLeftSwipe && activeIndex < projects.length - 1) {
      goToNext();
    } else if (isRightSwipe && activeIndex > 0) {
      goToPrev();
    }

    // Reset touch values
    touchStartX.current = 0;
    touchEndX.current = 0;
    isDragging.current = false;
  }, [activeIndex, goToNext, goToPrev]);

  return (
    <section className="relative w-full py-8 sm:py-12">
      {/* Navigation Arrows */}
      {activeIndex > 0 && (
        <button
          onClick={goToPrev}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-none bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {activeIndex < projects.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-none bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Cards Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-12 py-4 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {projects.map((project, index) => {
          const isActive = index === activeIndex;

          return (
            <motion.article
              key={project.id}
              data-card
              className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] max-w-[600px] snap-center cursor-pointer group"
              animate={{
                scale: isActive ? 1 : 0.95,
                opacity: isActive ? 1 : 0.6,
              }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelect?.(project)}
            >
              {/* Card - Clean image only */}
              <div className="relative overflow-hidden rounded-none sm:rounded-none bg-black border border-white/10 group-hover:border-white/20 transition-all">
                {/* Image - Square aspect for full vehicle visibility */}
                <div className="relative w-full aspect-square bg-gradient-to-b from-neutral-900 to-black overflow-hidden">
                  <img
                    src={project.cover_image}
                    alt={project.title}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding={index < 2 ? "sync" : "async"}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
                  {/* Hover overlay with title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h3 className="font-display text-lg sm:text-xl tracking-widest text-white">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4 sm:mt-6">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              scrollToIndex(index);
            }}
            className={`h-1.5 rounded-none transition-all duration-300 cursor-pointer ${index === activeIndex
                ? "bg-white w-6"
                : "bg-white/30 w-1.5 hover:bg-white/50"
              }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
});

ProjectSelector.displayName = "ProjectSelector";

export default ProjectSelector;
