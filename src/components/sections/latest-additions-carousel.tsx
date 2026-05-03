import { memo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectsRail from "@/components/ProjectsRail";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects } from "@/hooks/useProjects";

export interface LatestAdditionsCarouselProps {
  onProjectClick?: (projectId: string) => void;
  limit?: number;
  className?: string;
  variant?: "light" | "dark";
  skipAurora?: boolean;
}

/**
 * LATEST ADDITIONS: one component for Home and /projects.
 * White clean variant: white bg, dark text, light arrows, clean cards.
 * Structure unchanged: 2 cards per viewport, scroll by page (2 cards).
 */
const LatestAdditionsCarousel = memo(
  ({
    onProjectClick,
    limit,
    className,
    variant = "dark",
    skipAurora = false,
  }: LatestAdditionsCarouselProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const { t } = useLanguage();
    const { projects: dbProjects, loading } = useProjects();

    const projectsToShow = limit ? dbProjects.slice(0, limit) : dbProjects;

    const isLight = variant === "light";

    // White clean variant: dark text, light arrows
    const titleColor = isLight ? "text-[#111]" : "text-white";
    const descColor = isLight ? "text-[rgba(17,17,17,0.55)]" : "text-white/50";
    const arrowBorder = isLight ? "border-black/12" : "border-white/20";
    const arrowBg = isLight ? "bg-white/90" : "bg-transparent";
    const arrowHover = isLight
      ? "hover:bg-white hover:border-black/20 hover:shadow-sm"
      : "hover:bg-white/10 hover:border-white/40";
    const arrowIcon = isLight ? "text-[rgba(0,0,0,0.75)]" : "text-white";
    const arrowFocus = isLight
      ? "focus-visible:ring-black/20"
      : "focus-visible:ring-white/20";
    const sectionBg = isLight ? "bg-white" : undefined;

    const handleScrollStateChange = useCallback((left: boolean, right: boolean) => {
      setCanScrollLeft(left);
      setCanScrollRight(right);
    }, []);

    const scroll = useCallback((direction: "left" | "right") => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const amount = container.clientWidth;
      if (amount <= 0) return;
      container.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }, []);

    const handleProjectClick = useCallback(
      (slug: string) => onProjectClick?.(slug),
      [onProjectClick]
    );

    const content = (
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-start justify-between mb-6 sm:mb-12">
          <div className="flex-1 pr-3 sm:pr-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                "font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest uppercase mb-2 sm:mb-4",
                titleColor
              )}
            >
              {t("latestCreations.latestAdditions")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={cn(
                "font-body text-[10px] sm:text-sm uppercase tracking-widest leading-relaxed",
                isLight ? "text-[rgba(17,17,17,0.75)]" : descColor
              )}
            >
              {t("latestCreations.description")}
            </motion.p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "w-9 h-9 sm:w-12 sm:h-12 rounded-none border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed",
                arrowBg,
                arrowFocus,
                arrowBorder,
                arrowHover
              )}
              aria-label="Previous project"
            >
              <ChevronLeft className={cn("w-4 h-4 sm:w-6 sm:h-6", arrowIcon)} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "w-9 h-9 sm:w-12 sm:h-12 rounded-none border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed",
                arrowBg,
                arrowFocus,
                arrowBorder,
                arrowHover
              )}
              aria-label="Next project"
            >
              <ChevronRight className={cn("w-4 h-4 sm:w-6 sm:h-6", arrowIcon)} />
            </button>
          </div>
        </div>

        <ProjectsRail
          scrollRef={scrollRef}
          onScrollStateChange={handleScrollStateChange}
          projects={projectsToShow}
          onProjectClick={handleProjectClick}
          variant={variant}
        />
      </div>
    );

    if (variant === "dark") {
      if (skipAurora) {
        return (
          <section className={cn("relative z-10 py-10 sm:py-16 md:py-20", className)}>
            {content}
          </section>
        );
      }
      return (
        <AuroraBackground
          className={cn("py-10 sm:py-16 md:py-20", className)}
          intensity="subtle"
          showRadialGradient
        >
          <section className="relative z-10">{content}</section>
        </AuroraBackground>
      );
    }

    // Light variant: white background, no Aurora
    return (
      <section className={cn("relative z-10 py-10 sm:py-16 md:py-20", sectionBg, className)}>
        {content}
      </section>
    );
  }
);

LatestAdditionsCarousel.displayName = "LatestAdditionsCarousel";

export default LatestAdditionsCarousel;
