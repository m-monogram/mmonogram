/**
 * Project Template v1 — unified premium cinematic layout for all project pages.
 * No square crops, no card-like layouts. Hero, statement, editorial gallery, details, nav.
 */

import { useEffect, memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
export interface ProjectTemplateSpec {
  label: string;
  value: string;
}
export interface ProjectTemplateGalleryImage {
  src: string;
  alt?: string;
  group?: string;
}
export interface ProjectTemplateNavItem {
  slug: string;
  title: string;
}
export interface ProjectTemplateProps {
  title: string;
  subtitle: string;
  heroImage: string;
  statement: string;
  galleryImages: ProjectTemplateGalleryImage[];
  specs: ProjectTemplateSpec[];
  prev?: ProjectTemplateNavItem;
  next?: ProjectTemplateNavItem;
  onBack: () => void;
  onOrderClick?: () => void;
  videoUrl?: string;
  modifications?: string[];
}

/**
 * Enhanced premium gallery: 1 column mobile, 2 columns desktop.
 * Full image display with object-contain, enhanced hover effects, better spacing.
 */
function ProjectGallery({
  images
}: {
  images: ProjectTemplateGalleryImage[];
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const close = useCallback(() => setSelectedIdx(null), []);
  const goPrev = useCallback(() => setSelectedIdx(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length]);
  const goNext = useCallback(() => setSelectedIdx(i => i !== null ? (i + 1) % images.length : null), [images.length]);

  useEffect(() => {
    if (selectedIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [selectedIdx, close, goPrev, goNext]);

  return (
    <>
      <section className="relative bg-black px-4 sm:px-6 md:px-8 lg:px-12 pb-16 md:pb-24">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="relative overflow-hidden group cursor-pointer"
                onClick={() => setSelectedIdx(i)}
              >
                <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-black rounded-none border border-white/10 md:group-hover:border-white/30 transition-all duration-500 shadow-lg md:group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                  <img
                    src={img.src}
                    alt={img.alt ?? ""}
                    loading={i < 4 ? "eager" : "lazy"}
                    decoding={i < 4 ? "sync" : "async"}
                    className="w-full h-full object-cover object-center transition-transform duration-700 md:group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Lightbox Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={close}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-6 right-6 z-10 text-white/60 hover:text-white transition-colors p-2"
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 sm:left-8 z-10 text-white/50 hover:text-white transition-colors p-2"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 sm:right-8 z-10 text-white/50 hover:text-white transition-colors p-2"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* 3D Card */}
            <div onClick={(e) => e.stopPropagation()} className="w-[90vw] max-w-4xl">
              <CardContainer containerClassName="w-full">
                <CardBody className="w-full">
                  <CardItem translateZ={50} className="w-full">
                    <motion.img
                      key={selectedIdx}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      src={images[selectedIdx].src}
                      alt={images[selectedIdx].alt ?? ""}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-sm"
                      draggable={false}
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-foreground/40 text-sm tracking-widest font-body">
              {selectedIdx + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
const ProjectTemplate = memo(function ProjectTemplate({
  title,
  subtitle,
  heroImage,
  statement,
  galleryImages,
  specs,
  prev,
  next,
  onBack,
  onOrderClick,
  videoUrl,
  modifications
}: ProjectTemplateProps) {
  const navigate = useNavigate();
  const [imagePosition, setImagePosition] = useState("center center");
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

    // Set image position based on screen size - car positioned higher
    const updatePosition = () => {
      if (window.innerWidth >= 1024) {
        setImagePosition("center 45%");
      } else if (window.innerWidth >= 768) {
        setImagePosition("center 40%");
      } else {
        setImagePosition("center 38%");
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [title]);
  return <div className="min-h-screen relative z-10 bg-black">
      {/* ——— A) HERO ——— Premium cinematic hero with car positioned higher ——— */}
      <header className="relative min-h-[60vh] md:min-h-[90vh] w-full flex flex-col justify-end overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black">
          <img src={heroImage} alt={title} loading="eager" decoding="sync" fetchPriority="high" className="w-full h-full object-contain md:object-cover" style={{
          objectPosition: imagePosition
        }} />
        </div>
        {/* Premium gradient overlay - protects text, adjusted for higher car position */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: `
              linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.85) 100%)
            `
      }} />
        {/* Subtle spotlight effect */}
        <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-none blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-none blur-3xl" />
        </div>

        {/* Back Button - positioned below logo */}
        <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{
        top: `calc(env(safe-area-inset-top, 0px) + 6rem)`
      }}>
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50 backdrop-blur-md rounded-none" aria-label="Back to projects">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        {/* Text in safe zone - bottom third with proper spacing */}
        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-16 pb-12 sm:pb-16 md:pb-20">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.15
        }} className="max-w-4xl">
            
            
          </motion.div>
        </div>
      </header>

      {/* ——— B) STATEMENT ——— Enhanced with decorative elements ——— */}
      <section className="relative bg-black py-20 sm:py-24 md:py-32">
        {/* Decorative line above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center relative">
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-80px"
        }} transition={{
          duration: 0.7
        }} className="font-body text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/85 leading-relaxed tracking-wide">
            {statement}
          </motion.p>
        </div>
        
        {/* Decorative line below */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* ——— C) GALLERY ——— 1 column mobile, 2 columns desktop, aspect ratios ——— */}
      <ProjectGallery images={galleryImages} />

      {/* ——— Video (optional) ——— */}
      {videoUrl && <section className="relative bg-black py-12 sm:py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-60px"
        }} transition={{
          duration: 0.5
        }} className="aspect-video overflow-hidden rounded-none bg-black">
              {videoUrl.startsWith("http") ?
          // YouTube video
          <iframe src={`https://www.youtube.com/embed/${videoUrl.split("v=")[1]?.split("&")[0]}`} title={`${title} — Video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" className="w-full h-full" /> :
          // Local video file
          <video src={videoUrl} controls className="w-full h-full object-contain" preload="metadata">
                  Your browser does not support the video tag.
                </video>}
            </motion.div>
          </div>
        </section>}


      {modifications && modifications.length > 0}

      {/* CTA */}
      {onOrderClick && <section className="relative bg-black py-16 sm:py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <motion.div initial={{
          opacity: 0,
          y: 16
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-60px"
        }} transition={{
          duration: 0.5
        }}>
              <button type="button" onClick={onOrderClick} className="font-body text-sm uppercase tracking-widest text-white/80 hover:text-white border-b border-white/30 hover:border-white/60 transition-colors cursor-pointer touch-target pb-1">
                Order this project
              </button>
              <p className="font-body text-white/40 text-xs sm:text-sm mt-4 tracking-wide">
                Get a personalized quote for your vehicle
              </p>
            </motion.div>
          </div>
        </section>}

      {/* ——— E) NAV ——— bottom text-only Prev/Next; subtle divider ——— */}
      <nav className="relative bg-black border-t border-white/10 py-10 sm:py-12" aria-label="Project navigation">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {prev ? <button type="button" onClick={() => navigate(`/projects/${prev.slug}`)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer">
              <ChevronLeft className="w-4 h-4" aria-hidden />
              <span>Previous</span>
            </button> : <span aria-hidden />}
          <span className="text-foreground/30 text-xs tracking-widest font-body uppercase text-center max-w-[50%] truncate">
            {title} — {subtitle}
          </span>
          {next ? <button type="button" onClick={() => navigate(`/projects/${next.slug}`)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button> : <span aria-hidden />}
        </div>
      </nav>
    </div>;
});
export default ProjectTemplate;