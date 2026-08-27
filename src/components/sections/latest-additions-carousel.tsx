import { memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ProjectEditionGrid from "@/components/ProjectEditionGrid";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects } from "@/hooks/useProjects";
import { getLatestAdditionHubs } from "@/data/projects";

export interface LatestAdditionsCarouselProps {
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

/**
 * LATEST ADDITIONS: two hubs — G-Wagen and The Fusion.
 * Opening a hub shows that model's colour/edition cards.
 */
const LatestAdditionsCarousel = memo(
  ({ onProjectClick, className }: LatestAdditionsCarouselProps) => {
    const { t } = useLanguage();
    const { projects: dbProjects } = useProjects();

    const hubs = useMemo(() => getLatestAdditionHubs(dbProjects), [dbProjects]);

    const handleProjectClick = useCallback(
      (slug: string) => onProjectClick?.(slug),
      [onProjectClick]
    );

    return (
      <section className={cn("relative z-10 section-flow-light", className)}>
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pt-16 pb-16 sm:pt-20 sm:pb-20 md:pt-24 md:pb-24 lg:pt-28 lg:pb-28">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display font-bold uppercase tracking-[0.18em] text-lg sm:text-2xl md:text-3xl text-black text-center mb-8 sm:mb-10"
          >
            {t("latestCreations.latestAdditions")}
          </motion.h2>

          <ProjectEditionGrid
            columns={2}
            projects={hubs}
            onProjectClick={handleProjectClick}
          />
        </div>
      </section>
    );
  }
);

LatestAdditionsCarousel.displayName = "LatestAdditionsCarousel";

export default LatestAdditionsCarousel;
