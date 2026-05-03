"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { useProjects, DBProject } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface ProjectsCarouselProps {
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

/**
 * Premium 3D perspective carousel for projects
 * Luxury editorial layout with active slide dominance
 */
const ProjectsCarousel = memo(({ onProjectClick, className }: ProjectsCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { projects } = useProjects();

  // Detect mobile and reduced motion
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
    };

    checkMobile();
    checkReducedMotion();
    window.addEventListener("resize", checkMobile);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", checkReducedMotion);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", checkReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleProjectClick = useCallback(
    (projectId: string) => {
      onProjectClick?.(projectId);
    },
    [onProjectClick],
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
          dragFree: false,
          containScroll: "trimSnaps",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {projects.map((project, index) => {
            const isActive = current === index;
            return (
              <CarouselItem
                key={project.id}
                className="pl-2 md:pl-4 basis-full sm:basis-[85%] md:basis-[75%] lg:basis-[65%]"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    scale: isActive ? 1 : 0.92,
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative h-[60vh] sm:h-[70vh] md:h-[75vh] min-h-[500px] sm:min-h-[600px]"
                >
                  {!isMobile && !prefersReducedMotion ? (
                    <CardContainer containerClassName="w-full h-full" className="w-full h-full">
                      <CardBody className="w-full h-full cursor-pointer" onClick={() => handleProjectClick(project.slug)}>
                        <ProjectCardContent project={project} isActive={isActive} />
                      </CardBody>
                    </CardContainer>
                  ) : (
                    <div className="w-full h-full cursor-pointer" onClick={() => handleProjectClick(project.slug)}>
                      <ProjectCardContent project={project} isActive={isActive} />
                    </div>
                  )}
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation Arrows */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:bg-black/80 transition-all duration-300 cursor-pointer group"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:bg-black/80 transition-all duration-300 cursor-pointer group"
          aria-label="Next project"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-1.5 sm:h-2 rounded-none transition-all duration-300",
                current === index
                  ? "bg-white w-8 sm:w-12"
                  : "bg-white/30 hover:bg-white/50 w-1.5 sm:w-2"
              )}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
});

ProjectsCarousel.displayName = "ProjectsCarousel";

/**
 * Project card content with 3D layers
 */
const ProjectCardContent = memo(
  ({ project, isActive }: { project: DBProject; isActive: boolean }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
      <div className="relative w-full h-full overflow-hidden rounded-none border border-white/10 bg-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
          )}
          <img
            src={project.cover_image}
            alt={`${project.title} - ${project.subtitle}`}
            loading={isActive ? "eager" : "lazy"}
            decoding={isActive ? "sync" : "async"}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-700",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />

        {/* Content - Bottom aligned */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10 lg:p-12">
          {!isMobile ? (
            // Desktop: 3D layers
            <>
              <CardItem
                translateZ={50}
                className="mb-4"
              >
                <p className="font-body text-[10px] sm:text-xs tracking-widest text-white/50 uppercase">
                  {project.category} • {project.year}
                </p>
              </CardItem>

              <CardItem
                translateZ={80}
                className="mb-3"
              >
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest text-white uppercase leading-tight break-words">
                  {project.title}
                </h3>
              </CardItem>

              <CardItem
                translateZ={60}
                className="mb-6 sm:mb-8"
              >
                <p className="font-body text-sm sm:text-base md:text-lg text-white/70 max-w-2xl">
                  {project.subtitle}
                </p>
              </CardItem>

              <CardItem translateZ={100}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group/btn"
                >
                  <span className="font-body text-xs sm:text-sm uppercase tracking-widest text-white">
                    View Project
                  </span>
                  <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </CardItem>
            </>
          ) : (
            // Mobile: Static layout
            <>
              <p className="font-body text-[10px] tracking-widest text-white/50 uppercase mb-3">
                {project.category} • {project.year}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl tracking-widest text-white uppercase leading-tight break-words mb-3">
                {project.title}
              </h3>
              <p className="font-body text-sm text-white/70 mb-6">
                {project.subtitle}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group/btn"
              >
                <span className="font-body text-xs uppercase tracking-widest text-white">
                  View Project
                </span>
                <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-300" />
              </button>
            </>
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 border-2 border-white/30 pointer-events-none"
          />
        )}
      </div>
    );
  },
);

ProjectCardContent.displayName = "ProjectCardContent";

export default ProjectsCarousel;
