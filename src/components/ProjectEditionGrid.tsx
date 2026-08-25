import { memo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DBProject } from "@/hooks/useProjects";

export interface ProjectEditionGridProps {
  projects: DBProject[];
  onProjectClick?: (projectId: string) => void;
  className?: string;
  columns?: 2 | 3;
  /** light = home Latest Additions; dark = project hub pages */
  variant?: "light" | "dark";
}

const EditionCard = memo(function EditionCard({
  project,
  index,
  onClick,
  variant,
}: {
  project: DBProject;
  index: number;
  onClick: () => void;
  variant: "light" | "dark";
}) {
  const [loaded, setLoaded] = useState(false);
  const isDark = variant === "dark";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={onClick}
      className={cn(
        "group w-full text-left cursor-pointer border-0 p-0",
        isDark ? "bg-transparent" : "bg-white text-center"
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
        <img
          src={project.cover_image}
          alt={project.title}
          loading={index === 0 ? "eager" : "lazy"}
          decoding={index === 0 ? "sync" : "async"}
          fetchPriority={index === 0 ? "high" : "auto"}
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
        {isDark && project.subtitle ? (
          <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
            {project.subtitle}
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
          onClick={() => onProjectClick?.(project.slug || project.id)}
        />
      ))}
    </div>
  );
});

export default ProjectEditionGrid;
