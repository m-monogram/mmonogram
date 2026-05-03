import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { DBProject } from "@/hooks/useProjects";

interface ProjectCardProps {
  project: DBProject;
  index: number;
  onClick: () => void;
}

/**
 * Project card with full vehicle visibility
 * Simplified for performance - removed 3D effects
 */
const ProjectCard = memo(({ project, index, onClick }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative w-full group cursor-pointer"
      onClick={onClick}
    >
      {/* Card container */}
      <div className="relative overflow-hidden border border-border/20 group-hover:border-border/40 transition-all duration-300">
        {/* Image container - 16:9 aspect for full vehicle */}
        <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
          <img
            src={project.cover_image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          />
          {/* Clean hover overlay - no text inside */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Hover Arrow */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-foreground flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Info - Below card */}
      <div className="mt-4 sm:mt-5">
        <p className="font-display text-[10px] sm:text-xs tracking-widest text-muted-foreground uppercase mb-2">
          {project.category}
        </p>
        <h3 className="font-display text-base sm:text-lg tracking-widest text-foreground mb-1 line-clamp-1">
          {project.title}
        </h3>
        <p className="font-body text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {project.subtitle}
        </p>
      </div>
    </motion.div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
