import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Pause, Play } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { ModificationImage } from "@/data/modifications";
interface WheelsCarouselProps {
  images: ModificationImage[];
}
const AUTOPLAY_INTERVAL = 4000;
const WheelsCarousel = ({
  images
}: WheelsCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Setup embla events
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  // Autoplay logic
  useEffect(() => {
    const startAutoplay = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (isPlaying && !isHovered && emblaApi) {
        autoplayRef.current = setInterval(() => {
          emblaApi.scrollNext();
        }, AUTOPLAY_INTERVAL);
      }
    };
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPlaying, isHovered, emblaApi]);
  const toggleAutoplay = () => setIsPlaying(!isPlaying);
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };
  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };
  return <>
      <div className="relative bg-neutral-950/50" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* Main Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((image, index) => <div key={index} className="flex-[0_0_80%] md:flex-[0_0_60%] lg:flex-[0_0_50%] min-w-0 pl-4 first:pl-0">
                <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: selectedIndex === index ? 1 : 0.4,
              scale: selectedIndex === index ? 1.05 : 0.9
            }} transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }} onClick={() => openLightbox(index)} className={`
                    relative aspect-square overflow-hidden cursor-pointer
                    border transition-all duration-500
                    ${selectedIndex === index ? "border-foreground/60 shadow-[0_0_50px_rgba(255,255,255,0.2)] ring-2 ring-white/20" : "border-border/20 hover:border-foreground/40"}
                  `}>
                  <img src={image.src} alt={image.title} loading="lazy" decoding="async" sizes="(max-width: 768px) 80vw, 50vw" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  
                  {/* Gradient overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                    transition-opacity duration-500
                    ${selectedIndex === index ? "opacity-100" : "opacity-0"}
                  `} />
                  
                  {/* Title overlay */}
                  <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: selectedIndex === index ? 1 : 0,
                y: selectedIndex === index ? 0 : 20
              }} transition={{
                duration: 0.4,
                delay: 0.1
              }} className="absolute bottom-0 left-0 right-0 p-6">
                    
                    
                  </motion.div>
                </motion.div>
              </div>)}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={scrollPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10
            w-12 h-12 md:w-14 md:h-14 flex items-center justify-center
            border border-foreground/30 bg-background/80 backdrop-blur-sm
            text-foreground hover:bg-foreground hover:text-background
            transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button onClick={scrollNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10
            w-12 h-12 md:w-14 md:h-14 flex items-center justify-center
            border border-foreground/30 bg-background/80 backdrop-blur-sm
            text-foreground hover:bg-foreground hover:text-background
            transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Play/Pause Button */}
        <button onClick={toggleAutoplay} className="absolute top-4 right-4 z-10
            w-10 h-10 flex items-center justify-center
            border border-foreground/30 bg-background/80 backdrop-blur-sm
            text-foreground hover:bg-foreground hover:text-background
            transition-all duration-300">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Progress bar for autoplay */}
        {isPlaying && !isHovered && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground/10">
            <motion.div key={selectedIndex} className="h-full bg-foreground/50" initial={{
          width: "0%"
        }} animate={{
          width: "100%"
        }} transition={{
          duration: AUTOPLAY_INTERVAL / 1000,
          ease: "linear"
        }} />
          </div>}

        {/* Thumbnails Preview */}
        <div className="mt-8 px-4">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => <button key={index} onClick={() => scrollTo(index)} className={`
                  flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden
                  border-2 transition-all duration-300
                  ${index === selectedIndex ? "border-foreground shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-110" : "border-border/30 hover:border-foreground/50 opacity-60 hover:opacity-100"}
                `}>
                <img src={image.src} alt={image.title} loading="lazy" decoding="async" sizes="80px" className="w-full h-full object-cover" />
              </button>)}
          </div>
        </div>

        {/* Current / Total */}
        <div className="text-center mt-4">
          <span className="font-body text-sm text-muted-foreground">
            <span className="text-foreground">{String(selectedIndex + 1).padStart(2, '0')}</span>
            {" / "}
            {String(images.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-premium-black/95 z-50 flex items-center justify-center" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground 
                transition-all duration-300 z-10 border border-transparent hover:border-foreground/30 p-2">
              <X className="w-8 h-8" />
            </button>

            <button onClick={e => {
          e.stopPropagation();
          prevLightbox();
        }} className="absolute left-4 sm:left-8 text-muted-foreground hover:text-foreground 
                transition-all duration-300 border border-transparent hover:border-foreground/30 p-2">
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.div key={lightboxIndex} initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="max-w-4xl max-h-[80vh] mx-4" onClick={e => e.stopPropagation()}>
              <img src={images[lightboxIndex].src} alt={images[lightboxIndex].title} decoding="async" className="w-full h-full object-contain" />
              <div className="text-center mt-4">
                <h3 className="font-display text-lg text-foreground">
                  {images[lightboxIndex].title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {images[lightboxIndex].description}
                </p>
              </div>
            </motion.div>

            <button onClick={e => {
          e.stopPropagation();
          nextLightbox();
        }} className="absolute right-4 sm:right-8 text-muted-foreground hover:text-foreground 
                transition-all duration-300 border border-transparent hover:border-foreground/30 p-2">
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Lightbox Thumbnails */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {images.map((image, index) => <button key={index} onClick={e => {
            e.stopPropagation();
            setLightboxIndex(index);
          }} className={`
                    flex-shrink-0 w-12 h-12 overflow-hidden transition-all duration-300
                    ${index === lightboxIndex ? "border-2 border-foreground scale-110" : "border border-foreground/30 opacity-50 hover:opacity-100"}
                  `}>
                  <img src={image.src} alt={image.title} className="w-full h-full object-cover" />
                </button>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </>;
};
export default WheelsCarousel;
