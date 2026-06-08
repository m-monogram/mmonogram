"use client";

import { memo, useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DBProject } from "@/hooks/useProjects";

export interface ProjectsRailProps {
  onProjectClick?: (projectId: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScrollStateChange?: (canScrollLeft: boolean, canScrollRight: boolean) => void;
  projects?: DBProject[];
  variant?: "light" | "dark";
}

/**
 * Slide = one card. Mobile: 1 card (100%), Desktop: 2 cards (calc).
 * White clean variant: white bg, border, shadow, no text overlay.
 */
const SlideCard = memo(
  ({
    project,
    onClick,
    index,
    variant = "dark",
  }: {
    project: DBProject;
    onClick: () => void;
    index: number;
    variant?: "light" | "dark";
  }) => {
    const [loaded, setLoaded] = useState(false);
    const isLight = variant === "light";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={cn(
          "relative cursor-pointer group shrink-0 snap-center",
          "w-full min-w-full sm:flex-[0_0_calc((100%_-_24px)/2)] sm:min-w-0 lg:flex-[0_0_calc((100%_-_32px)/2)]"
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden transition-all duration-500",
            "aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]",
            "sm:h-auto lg:h-auto",
            isLight
              ? "bg-white border border-black/8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
              : "bg-gradient-to-b from-[#0d0d0f] to-[#050506] border border-white/10 group-hover:border-white/25"
          )}
        >
          <div className="absolute inset-0">
            {!loaded && (
              <div
                className={cn(
                  "absolute inset-0 animate-pulse",
                  isLight ? "bg-neutral-100" : "bg-neutral-900"
                )}
              />
            )}
            <img
              src={project.cover_image}
              alt={`${project.title} — ${project.subtitle}`}
              loading={index < 2 ? "eager" : "lazy"}
              decoding={index < 2 ? "sync" : "async"}
              fetchpriority={index < 2 ? "high" : "auto"}
              onLoad={() => setLoaded(true)}
              className={cn(
                "absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105",
                "object-cover",
                loaded ? "opacity-100" : "opacity-0"
              )}
              style={{ objectPosition: "center 55%" }}
            />
          </div>

          {/* Premium gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-500 pointer-events-none",
              isLight
                ? "bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                : "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80"
            )}
          />

          {/* Project info overlay - shows on hover */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 sm:p-6 transition-all duration-500",
            "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          )}>
            <p className="font-body text-[10px] sm:text-xs tracking-widest text-white/50 uppercase mb-1">
              {project.subtitle}
            </p>
            <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-white uppercase tracking-widest">
              {project.title}
            </h3>
          </div>

          {/* Inner glow effect */}
          <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] pointer-events-none" />
        </div>
      </motion.div>
    );
  }
);

SlideCard.displayName = "SlideCard";

/**
 * Viewport: overflow-hidden w-full. Track: flex w-full gap-4 sm:gap-6 lg:gap-8.
 * Mobile: 1 card (100%), Desktop: 2 cards. Scroll by page (clientWidth) = 2 cards. Keys = project.id.
 */
const ProjectsRail = memo(
  ({
    onProjectClick,
    scrollRef: externalScrollRef,
    onScrollStateChange,
    projects: providedProjects,
    variant = "dark",
  }: ProjectsRailProps) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const scrollRef = externalScrollRef || internalRef;
    const projectsToShow = providedProjects ?? [];

    const rafRef = useRef<number | null>(null);
    const check = useCallback(() => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const left = scrollLeft > 0;
        const right = scrollLeft < scrollWidth - clientWidth - 4;
        onScrollStateChange?.(left, right);
      });
    }, [scrollRef, onScrollStateChange]);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      // Defer initial check past the current frame to avoid forced reflow
      // during mount + image load layout churn.
      const initialId = requestAnimationFrame(check);
      el.addEventListener("scroll", check, { passive: true });
      // Skip ResizeObserver's first synchronous callback (fires on observe());
      // the deferred initial check above already covers it.
      let roPrimed = false;
      const ro = new ResizeObserver(() => {
        if (!roPrimed) {
          roPrimed = true;
          return;
        }
        check();
      });
      ro.observe(el);
      window.addEventListener("resize", check, { passive: true });
      return () => {
        cancelAnimationFrame(initialId);
        el.removeEventListener("scroll", check);
        ro.disconnect();
        window.removeEventListener("resize", check);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }, [scrollRef, check]);

      useEffect(() => {
        const id = requestAnimationFrame(check);
        return () => cancelAnimationFrame(id);
      }, [check, projectsToShow.length]);

    const handleClick = useCallback(
      (slug: string) => onProjectClick?.(slug),
      [onProjectClick]
    );

    return (
      <div className="overflow-hidden w-full">
        <div
          ref={scrollRef}
          className={cn(
            "flex w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-4 sm:pb-6",
            "gap-0 sm:gap-6 lg:gap-8"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {projectsToShow.map((project, index) => (
            <SlideCard
              key={project.id}
              project={project}
              onClick={() => handleClick(project.slug)}
              index={index}
              variant={variant}
            />
          ))}
        </div>
      </div>
    );
  }
);

ProjectsRail.displayName = "ProjectsRail";

export default ProjectsRail;
