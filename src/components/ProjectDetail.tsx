import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Check, Pause, Play } from "lucide-react";
import { DBProject } from "@/hooks/useProjects";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

interface ProjectDetailProps {
  project: DBProject;
  onClose: () => void;
}

const ProjectDetail = ({ project, onClose }: ProjectDetailProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => {
    setSelectedImage(null);
    setIsAutoPlaying(true);
  };

  const nextImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % project.images.length);
    }
  }, [selectedImage, project.images.length]);

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + project.images.length) % project.images.length);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (selectedImage === null || !isAutoPlaying) return;

    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedImage, isAutoPlaying, nextImage]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        setSelectedImage((prev) =>
          prev !== null ? (prev - 1 + project.images.length) % project.images.length : null
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) =>
          prev !== null ? (prev + 1) % project.images.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, project.images.length]);

  // Lock scroll when lightbox is open
  useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Back Button - positioned below logo */}
      <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-foreground/20 hover:border-foreground/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-background/50 backdrop-blur-md rounded-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Назад к проектам</span>
          <span className="sm:hidden">Назад</span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-8 sm:pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl uppercase tracking-luxury mb-2">
              {project.title}
            </h2>
            <p className="font-body text-accent-blue text-lg sm:text-xl">
              {project.subtitle}
            </p>
          </div>

          {/* Project Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8">
            <div className="text-center">
              <p className="font-display text-xl sm:text-2xl text-accent-blue">{project.year}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Год</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl sm:text-2xl text-accent-blue">{project.duration}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Срок</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl sm:text-2xl text-accent-blue">{project.package}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Пакет</p>
            </div>
          </div>

          {/* Description */}
          <p className="font-body text-muted-foreground text-center max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
            {project.description}
          </p>
        </motion.div>

        {/* Modifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <h3 className="font-display text-xl sm:text-2xl uppercase tracking-luxury text-center mb-6 sm:mb-8">
            Что было сделано
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {project.modifications.map((mod, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-3 sm:p-4 bg-card border border-border"
              >
                <div className="w-5 h-5 rounded-none bg-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent-blue" />
                </div>
                <span className="font-body text-sm sm:text-base text-foreground">
                  {mod}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Photo Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-display text-xl sm:text-2xl uppercase tracking-luxury text-center mb-6 sm:mb-8">
            Фотогалерея
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {project.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                onClick={() => openLightbox(index)}
                className="relative aspect-square cursor-pointer overflow-hidden group"
              >
                <img
                  src={image.src}
                  alt={image.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <p className="font-body text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wide text-xs sm:text-sm">
                    {image.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox with 3D Effect - 1:1 format */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-all duration-300 z-10 border border-white/20 hover:border-white/40 p-2 rounded-none bg-black/50 hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Auto-play Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoPlaying(!isAutoPlaying);
              }}
              className="absolute top-6 right-20 text-white/70 hover:text-white transition-all duration-300 z-10 border border-white/20 hover:border-white/40 p-2 rounded-none bg-black/50 hover:bg-black/70"
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Navigation - Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 sm:left-8 text-white/70 hover:text-white transition-all duration-300 border border-white/20 hover:border-white/40 p-2 rounded-none bg-black/50 hover:bg-black/70 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* 3D Card Container - 1:1 format */}
            <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center max-w-[90vw] max-h-[80vh]">
              <CardContainer
                containerClassName="!py-0"
                className="!p-0"
              >
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardBody className="!h-auto !w-auto bg-transparent border-0 rounded-none overflow-hidden shadow-2xl">
                    <CardItem translateZ="80" className="!w-auto !h-auto">
                      <img
                        src={project.images[selectedImage].src}
                        alt={project.images[selectedImage].title}
                        className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain block"
                      />
                    </CardItem>
                  </CardBody>
                </motion.div>
              </CardContainer>
            </div>

            {/* Navigation - Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 sm:right-8 text-white/70 hover:text-white transition-all duration-300 border border-white/20 hover:border-white/40 p-2 rounded-none bg-black/50 hover:bg-black/70 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image Info */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
              <h3 className="font-display text-lg sm:text-xl text-white mb-1">
                {project.images[selectedImage].title}
              </h3>
              <p className="font-body text-sm text-white/70">
                {selectedImage + 1} / {project.images.length}
              </p>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {project.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`h-2 transition-all duration-300 rounded-none ${index === selectedImage
                      ? "bg-white w-8"
                      : "bg-white/30 hover:bg-white/50 w-2"
                    }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectDetail;
