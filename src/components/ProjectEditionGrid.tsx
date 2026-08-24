import { memo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DBProject } from "@/hooks/useProjects";

export interface ProjectEditionGridProps {
  projects: DBProject[];
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

const EditionCard = memo(function EditionCard({
  project,
  index,
  onClick,
}: {
  project: DBProject;
  index: number;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      onClick={onClick}
      className="group w-full text-center cursor-pointer bg-transparent border-0 p-0"
    >
      <div className="relative w-full overflow-hidden bg-neutral-200 aspect-[5/4]">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-neutral-100" />}
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
      </div>
      <p className="mt-4 sm:mt-5 font-display text-[11px] sm:text-sm md:text-base font-bold uppercase tracking-[0.14em] text-black">
        {project.title}
      </p>
    </motion.button>
  );
});

const ProjectEditionGrid = memo(function ProjectEditionGrid({
  projects,
  onProjectClick,
  className,
}: ProjectEditionGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10", className)}>
      {projects.map((project, index) => (
        <EditionCard
          key={project.slug || project.id}
          project={project}
          index={index}
          onClick={() => onProjectClick?.(project.slug || project.id)}
        />
      ))}
    </div>
  );
});

export default ProjectEditionGrid;
