import { memo, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectsRail from "@/components/ProjectsRail";
import ProjectEditionGrid from "@/components/ProjectEditionGrid";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects } from "@/hooks/useProjects";
import { getGWagenEditionsFrom, getListingProjects } from "@/data/projects";

export interface LatestAdditionsCarouselProps {
  onProjectClick?: (projectId: string) => void;
  limit?: number;
  className?: string;
  variant?: "light" | "dark";
  skipAurora?: boolean;
  layout?: "rail" | "editions";
}

/**
 * LATEST ADDITIONS: G-Wagen editions grid (home) or listing rail (brand/projects).
 */
const LatestAdditionsCarousel = memo(
  ({
    onProjectClick,
    limit,
    className,
    variant = "dark",
    skipAurora = false,
    layout = "rail",
  }: LatestAdditionsCarouselProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const { t } = useLanguage();
    const { projects: dbProjects } = useProjects();

    const listingProjects = useMemo(() => {
      const list = getListingProjects(dbProjects);
      return limit ? list.slice(0, limit) : list;
    }, [dbProjects, limit]);

    const editionProjects = useMemo(
      () => getGWagenEditionsFrom(dbProjects),
      [dbProjects]
    );

    const isEditions = layout === "editions";
    const isLight = variant === "light" || isEditions;

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
        <div
          className={cn(
            "mb-8 sm:mb-12 md:mb-16",
            isEditions ? "text-center" : "flex items-start justify-between"
          )}
        >
          <div className={cn(!isEditions && "flex-1 pr-3 sm:pr-8")}>
            <motion.h2
              initial={{ opacity: 0, y: isEditions ? 12 : 0, x: isEditions ? 0 : -20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                "font-display tracking-widest uppercase",
                isEditions
                  ? "text-lg sm:text-2xl md:text-3xl text-black"
                  : "text-xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-4",
                !isEditions && titleColor
              )}
            >
              {t("latestCreations.latestAdditions")}
            </motion.h2>
            {!isEditions && (
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
            )}
          </div>
          {!isEditions && (
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
          )}
        </div>

        {isEditions ? (
          <ProjectEditionGrid
            projects={editionProjects}
            onProjectClick={handleProjectClick}
          />
        ) : (
          <ProjectsRail
            scrollRef={scrollRef}
            onScrollStateChange={handleScrollStateChange}
            projects={listingProjects}
            onProjectClick={handleProjectClick}
            variant={variant}
          />
        )}
      </div>
    );

    if (isEditions || isLight) {
      return (
        <section className={cn("relative z-10 py-16 sm:py-20 md:py-24", sectionBg, className)}>
          {content}
        </section>
      );
    }

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
);

LatestAdditionsCarousel.displayName = "LatestAdditionsCarousel";

export default LatestAdditionsCarousel;
