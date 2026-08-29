import { memo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Picture from "@/components/Picture";
import { DBProject } from "@/hooks/useProjects";

export interface ProjectEditionGridProps {
  projects: DBProject[];
  onProjectClick?: (projectId: string) => void;
  className?: string;
  columns?: 2 | 3;
  /** light = home Latest Additions; dark = project hub pages */
  variant?: "light" | "dark";
  /**
   * Сетка стоит в первом экране, и первую карточку нужно грузить наперёд.
   * По умолчанию нет: на главной и на /brand эта сетка лежит на второй-третьей
   * прокрутке, и её снимок отбирал канал у первого экрана.
   */
  priority?: boolean;
}

const EditionCard = memo(function EditionCard({
  project,
  index,
  onClick,
  variant,
  priority,
}: {
  project: DBProject;
  index: number;
  onClick: () => void;
  variant: "light" | "dark";
  priority: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const isDark = variant === "dark";
  /* Тёмные карточки — комплектации внутри семейства, у них надстрочником идёт
     имя семейства. Светлые — сами семейства на главной, там имени семейства
     сверху взяться неоткуда, поэтому подписываем категорией. */
  const eyebrow = isDark ? project.subtitle : project.category;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full cursor-pointer border-0 p-0 bg-transparent",
        isDark ? "text-left" : "text-center"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isDark
            ? "aspect-[4/3] sm:aspect-[5/4] bg-neutral-900 border border-white/10 group-hover:border-white/30 transition-colors duration-500"
            : "aspect-[5/4] bg-neutral-200"
        )}
      >
        {!loaded && (
          <div
            className={cn(
              "absolute inset-0 animate-pulse",
              isDark ? "bg-neutral-900" : "bg-neutral-100"
            )}
          />
        )}
        <Picture
          src={project.cover_image}
          alt={project.title}
          priority={priority && index === 0}
          /* Карточек в ряду две (columns=2) или три; на телефоне — одна
             во всю ширину. */
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 540px"
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        {isDark && (
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80"
            aria-hidden
          />
        )}
      </div>
      <div className={cn(isDark ? "mt-5 sm:mt-6" : "mt-4 sm:mt-5")}>
        {eyebrow ? (
          <p
            className={cn(
              "font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-2",
              isDark ? "text-white/40" : "text-black/45"
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <p
          className={cn(
            "font-display font-bold uppercase tracking-[0.16em]",
            isDark
              ? "text-sm sm:text-base md:text-lg text-white"
              : "text-[11px] sm:text-sm md:text-base text-black"
          )}
        >
          {project.title}
        </p>
      </div>
    </motion.button>
  );
});

const ProjectEditionGrid = memo(function ProjectEditionGrid({
  projects,
  onProjectClick,
  className,
  columns = 3,
  variant = "light",
  priority = false,
}: ProjectEditionGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 sm:gap-8 lg:gap-12",
        columns === 2 ? "sm:grid-cols-2 max-w-[1100px] mx-auto" : "sm:grid-cols-3",
        className
      )}
    >
      {projects.map((project, index) => (
        <EditionCard
          key={project.slug || project.id}
          project={project}
          index={index}
          variant={variant}
          priority={priority}
          onClick={() => onProjectClick?.(project.slug || project.id)}
        />
      ))}
    </div>
  );
});

export default ProjectEditionGrid;
