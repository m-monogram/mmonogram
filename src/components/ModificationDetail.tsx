import { motion, AnimatePresence } from"framer-motion";
import { ArrowLeft, Clock, Shield, Check, X, ChevronLeft, ChevronRight } from"lucide-react";
import { ModificationCategory } from"@/data/modifications";
import { useState, useEffect } from"react";
import ForgedWheelsGrid from"./ForgedWheelsGrid";
import { BlurText } from"@/components/ui/blur-text";
import { useNavigation } from"@/hooks/useNavigation";
import { CardContainer, CardBody, CardItem } from"@/components/ui/3d-card";
import { useLanguage } from"@/contexts/LanguageContext";
interface ModificationDetailProps {
  category: ModificationCategory;
  onClose: () => void;
  setCurrentView: (view: string) => void;
}
const ModificationDetail = ({
  category,
  onClose,
  setCurrentView
}: ModificationDetailProps) => {
  const {
    navigateToView
  } = useNavigation({
    setCurrentView
  });
  const {
    t
  } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior:"instant"
    });
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key ==="Escape") {
        setSelectedImageIndex(null);
      } else if (e.key ==="ArrowLeft") {
        setSelectedImageIndex(prev => prev !== null ? (prev - 1 + category.images.length) % category.images.length : null);
      } else if (e.key ==="ArrowRight") {
        setSelectedImageIndex(prev => prev !== null ? (prev + 1) % category.images.length : null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, category.images.length]);

  // Lock scroll when lightbox is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow ="hidden";
    } else {
      document.body.style.overflow ="";
    }
    return () => {
      document.body.style.overflow ="";
    };
  }, [selectedImageIndex]);
  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  const nextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % category.images.length);
    }
  };
  const prevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + category.images.length) % category.images.length);
    }
  };
  // Get optimized object-position per category
  const getImagePosition = () => {
    switch (category.id) {
      case"exterior":
        return"center center";
      case"interior":
        return"center 60%";
      case"wheels":
        return"center 40%";
      case"protection":
        return"center 45%";
      default:
        return"center center";
    }
  };
  return <div className="min-h-screen relative z-10">
      {/* Hero Section - Full Width Premium Design */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.6
    }} className="relative w-full h-[70vh] sm:h-[75vh] md:h-[80vh] overflow-hidden">
        {/* Full-width background image */}
        <div className="absolute inset-0">
          <img src={category.coverImage} alt={category.title} loading="eager" decoding="async" fetchpriority="high" sizes="100vw" className="w-full h-full object-cover" style={{
          objectPosition: getImagePosition()
        }} />
        </div>
        
        {/* Clean gradient overlay - bottom only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Back Button - Inside hero, positioned below header */}
        <div className="absolute top-24 sm:top-28 left-4 sm:left-6 md:left-12 z-20">
          <motion.button type="button" onClick={onClose} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target px-3 py-2 sm:px-4 sm:py-2.5 bg-premium-black/40 backdrop-blur-md border border-white/20 hover:border-white/40 hover:bg-premium-black/60">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.back")}</span>
          </motion.button>
        </div>
        
        {/* Title Overlay - Clean bottom-aligned */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end gap-4 sm:gap-6">
              
              <div>
                <span className="font-body text-xs sm:text-sm uppercase tracking-widest text-white/70 block mb-1 sm:mb-2">
                  {category.subtitle}
                </span>
                <BlurText text={category.title} className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-widest text-white uppercase" delay={0.3} staggerDelay={0.06} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-8 md:px-16 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Stats Row */}
          

          {/* Description - Enhanced for Exterior */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className={`mb-16 ${category.id ==="exterior" ?"sm:mb-20 md:mb-24" :""}`}>
            <div className={`flex items-center gap-4 mb-6 ${category.id ==="exterior" ?"sm:mb-8" :""}`}>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
              <h2 className={`font-display ${category.id ==="exterior" ?"text-2xl sm:text-3xl md:text-4xl" :"text-xl"} tracking-widest text-foreground uppercase whitespace-nowrap`}>
                {t("modifications.overview")}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-foreground/20 to-transparent" />
            </div>
            <p className={`font-body ${category.id ==="exterior" ?"text-lg sm:text-xl md:text-2xl" :"text-base"} text-muted-foreground leading-relaxed ${category.id ==="exterior" ?"max-w-4xl" :"max-w-3xl"}`}>
              {category.description}
            </p>
          </motion.div>

          {/* Content Blocks - Clean Sequential Layout */}
          {category.contentBlocks && category.contentBlocks.length > 0 && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.35
        }} className="mb-20 space-y-6">
              {category.contentBlocks.map((block, index) => {
            if (block.type ==="highlight") {
              return <motion.div key={index} initial={{
                opacity: 0,
                y: 15
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.06
              }} className="py-6 border-b border-foreground/20">
                      <h3 className="font-display text-lg md:text-xl tracking-widest text-foreground">
                        {block.content}
                      </h3>
                    </motion.div>;
            }
            if (block.type ==="quote") {
              return <motion.div key={index} initial={{
                opacity: 0,
                y: 15
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.06
              }} className="py-8 pl-6 border-l-2 border-foreground/40 my-4">
                      <p className="font-body text-base md:text-lg text-foreground/80  leading-relaxed">
                        {block.content}
                      </p>
                    </motion.div>;
            }
            if (block.type ==="text") {
              return <motion.p key={index} initial={{
                opacity: 0,
                y: 15
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.06
              }} className="font-body text-base text-muted-foreground leading-relaxed max-w-3xl">
                      {block.content}
                    </motion.p>;
            }
            return null;
          })}
            </motion.div>}

          {/* Gallery - Special designs for wheels and exterior, standard grid for others */}
          {category.id ==="wheels" ? <ForgedWheelsGrid images={category.images} onImageClick={openLightbox} /> : category.id ==="exterior" ? <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="mb-16 -mx-4 sm:-mx-8 md:-mx-16">
              {/* Section Title */}
              <div className="px-4 sm:px-8 md:px-16 mb-8 sm:mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-widest text-foreground uppercase whitespace-nowrap">
                    {t("modifications.gallery")}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-foreground/20 to-transparent" />
                </div>
              </div>

              {/* Premium Gallery Grid - 2x2 edge-to-edge layout */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 px-4 sm:px-8 md:px-16">
                {category.images.map((image, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true,
              margin:"-50px"
            }} transition={{
              duration: 0.5,
              delay: index * 0.08
            }} onClick={() => openLightbox(index)} className="group relative overflow-hidden cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-premium-black">
                      <img src={image.src} alt={image.title} loading={index < 4 ?"eager" :"lazy"} decoding={index < 4 ?"sync" :"async"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  </motion.div>)}
              </div>
            </motion.div> : <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="mb-16">
              <h2 className="font-display text-xl tracking-widest text-foreground mb-6">{t("modifications.gallery")}</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {category.images.map((image, index) => <div key={index} onClick={() => openLightbox(index)} className="group relative aspect-square overflow-hidden bg-premium-black cursor-pointer border border-border/20 hover:border-border/40 transition-all duration-300">
                    <img src={image.src} alt={image.title} loading={index < 4 ?"eager" :"lazy"} decoding={index < 4 ?"sync" :"async"} fetchPriority={index < 2 ?"high" :"auto"} sizes="(max-width: 768px) 50vw, 50vw" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>)}
              </div>
            </motion.div>}

          {/* Services */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.5
        }} className="mb-16">
            
            
          </motion.div>



          {/* CTA */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.7
        }} className="text-center py-12 border-t border-border/30">
            <h2 className="font-display text-2xl tracking-widest text-foreground mb-6">
              {t("modifications.startProject")}
            </h2>
            <motion.button onClick={() => navigateToView("contact")} whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className="font-body text-sm sm:text-base uppercase tracking-widest px-8 py-3.5 sm:px-10 sm:py-4 bg-white text-black border border-white hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer shadow-lg">
              {t("hero.bookProject")}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Lightbox with 3D Effect */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 text-white/60 hover:text-white transition-colors p-2"
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 sm:left-8 z-10 text-white/50 hover:text-white transition-colors p-2"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 sm:right-8 z-10 text-white/50 hover:text-white transition-colors p-2"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div onClick={(e) => e.stopPropagation()} className="w-[90vw] max-w-4xl">
              <CardContainer containerClassName="w-full">
                <CardBody className="w-full">
                  <CardItem translateZ={50} className="w-full">
                    <motion.img
                      key={selectedImageIndex}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      src={category.images[selectedImageIndex].src}
                      alt={category.images[selectedImageIndex].title}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-sm"
                      draggable={false}
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 font-mono text-sm tracking-widest">
              {selectedImageIndex + 1} / {category.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>;
};
export default ModificationDetail;