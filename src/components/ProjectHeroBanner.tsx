import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DBProject } from "@/hooks/useProjects";
import MediaEdgeFade from "@/components/MediaEdgeFade";

interface ProjectHeroBannerProps {
  project: DBProject;
  index: number;
  onViewProject: (projectId: string) => void;
  priority?: boolean;
  isFullscreen?: boolean;
}

/**
 * Full-width cinematic project banner
 * Supports fullscreen snap-scroll mode with video backgrounds
 */
const ProjectHeroBanner = memo(({
  project,
  index,
  onViewProject,
  priority = false,
  isFullscreen = false,
}: ProjectHeroBannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.article
      className={`relative w-full ${isFullscreen ? "h-[90vh] snap-start" : "h-[70vh] sm:h-[80vh] min-h-[500px] max-h-[900px]"}`}
    >
      {/* Banner container */}
      <div
        className="relative w-full h-full overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.08)]"
        onClick={() => onViewProject(project.id)}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-black">
          {/* Placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
          )}

          {/* Main image */}
          <motion.img
            src={project.cover_image}
            alt={`${project.title} - ${project.subtitle}`}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchpriority={priority ? "high" : "auto"}
            onLoad={handleLoad}
            initial={false}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className={`w-full h-full object-contain object-center transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"
              }`}
          />
        </div>

        {/* Premium gradient overlays - luxury aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
        <MediaEdgeFade edges="bottom" />
        {/* Subtle vignette for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />

        {/* Content - Bottom left, minimal */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-16 pb-8 sm:pb-12 md:pb-16">
            {/* Project number */}
            <motion.p
              className="font-body text-[11px] tracking-widest text-white/40 uppercase mb-3"
            >
              {String(index + 1).padStart(2, "0")}
            </motion.p>

            {/* Title */}
            <motion.h2
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-widest text-white uppercase leading-none mb-2"
            >
              {project.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="font-body text-base sm:text-lg md:text-xl text-white/60 mb-8"
            >
              {project.subtitle}
            </motion.p>

            {/* CTA - Premium styling */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onViewProject(project.id);
              }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group/btn rounded-none"
            >
              <span className="font-body text-xs sm:text-sm uppercase tracking-widest text-white">
                View Project
              </span>
              <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </div>
        </div>

        {/* Scroll hint for fullscreen mode */}
        {isFullscreen && index < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-white/0 via-white/30 to-white/0"
            />
          </motion.div>
        )}
      </div>
    </motion.article>
  );
});

ProjectHeroBanner.displayName = "ProjectHeroBanner";

export default ProjectHeroBanner;
