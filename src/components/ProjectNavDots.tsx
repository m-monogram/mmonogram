import { memo } from "react";
import { motion } from "framer-motion";

interface ProjectNavDotsProps {
  totalProjects: number;
  activeIndex: number;
  onNavigate: (index: number) => void;
}

/**
 * Fixed side navigation dots for snap-scroll project sections
 * Apple-style minimal vertical dots
 */
const ProjectNavDots = memo(({ totalProjects, activeIndex, onNavigate }: ProjectNavDotsProps) => {
  // +1 for intro section
  const totalSections = totalProjects + 1;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
    >
      {Array.from({ length: totalSections }).map((_, index) => (
        <button
          key={index}
          onClick={() => onNavigate(index)}
          className="group relative p-1"
          aria-label={index === 0 ? "Go to intro" : `Go to project ${index}`}
        >
          {/* Dot */}
          <motion.div
            animate={{
              scale: activeIndex === index ? 1 : 0.6,
              opacity: activeIndex === index ? 1 : 0.4,
            }}
            transition={{ duration: 0.3 }}
            className={`w-2 h-2 rounded-none transition-colors duration-300 ${
              activeIndex === index 
                ? "bg-white" 
                : "bg-white/50 group-hover:bg-white/70"
            }`}
          />
          
          {/* Active indicator line */}
          {activeIndex === index && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-4 h-px bg-white/60"
            />
          )}
        </button>
      ))}
    </motion.div>
  );
});

ProjectNavDots.displayName = "ProjectNavDots";

export default ProjectNavDots;
