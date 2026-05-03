import { memo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { DBProject } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface ProjectModalProps {
  project: DBProject | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProjects: () => void;
  onCommission: () => void;
}

/**
 * Premium modal overlay for project details
 * Features: smooth animations, ESC-to-close, scroll lock, image gallery
 */
const ProjectModal = memo(({
  project,
  isOpen,
  onClose,
  onViewProjects,
  onCommission,
}: ProjectModalProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset gallery when project changes
  useEffect(() => {
    if (project) {
      setActiveImageIndex(0);
    }
  }, [project]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      // Arrow key navigation for gallery
      if (isOpen && project) {
        if (e.key === "ArrowLeft") {
          setActiveImageIndex((prev) =>
            prev === 0 ? project.images.length - 1 : prev - 1
          );
        }
        if (e.key === "ArrowRight") {
          setActiveImageIndex((prev) =>
            prev === project.images.length - 1 ? 0 : prev + 1
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, project]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handlePrevImage = useCallback(() => {
    if (!project) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? project.images.length - 1 : prev - 1
    );
  }, [project]);

  const handleNextImage = useCallback(() => {
    if (!project) return;
    setActiveImageIndex((prev) =>
      prev === project.images.length - 1 ? 0 : prev + 1
    );
  }, [project]);

  // Get display images (3-6 images)
  const displayImages = project?.images.slice(0, 6) || [];

  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={onClose}
        >
          {/* Dark overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-premium-black/90 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 border border-white/10 shadow-2xl shadow-black/50"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-premium-black/50 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Image Gallery */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-premium-black">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={displayImages[activeImageIndex]?.src}
                  alt={displayImages[activeImageIndex]?.title || project.title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Gallery Navigation */}
              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-premium-black/50 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-premium-black/50 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-premium-black/60 border border-white/10">
                    <span className="font-body text-xs tracking-widest text-white/60">
                      {String(activeImageIndex + 1).padStart(2, "0")} / {String(displayImages.length).padStart(2, "0")}
                    </span>
                  </div>
                </>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 overflow-hidden border transition-all duration-300",
                        activeImageIndex === idx
                          ? "border-white/50 opacity-100"
                          : "border-white/10 opacity-50 hover:opacity-80"
                      )}
                    >
                      <img
                        src={img.src}
                        alt={img.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8 md:p-10">
              {/* Header */}
              <div className="mb-6">
                <span className="font-body text-xs tracking-widest text-muted-foreground uppercase mb-2 block">
                  {project.category} · {project.year}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-widest text-foreground uppercase mb-2">
                  {project.title}
                </h2>
                <p className="font-body text-lg sm:text-xl text-muted-foreground">
                  {project.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {project.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  type="button"
                  onClick={onViewProjects}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-3 font-body text-sm uppercase tracking-widest border border-foreground hover:bg-foreground/90 transition-all duration-300"
                >
                  <span>View Projects</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={onCommission}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center justify-center gap-3 bg-transparent text-foreground px-6 py-3 font-body text-sm uppercase tracking-widest border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all duration-300"
                >
                  <span>Commission</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ProjectModal.displayName = "ProjectModal";

export default ProjectModal;
