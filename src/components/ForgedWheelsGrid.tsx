import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModificationImage } from "@/data/modifications";
interface ForgedWheelsGridProps {
  images: ModificationImage[];
  onImageClick?: (index: number) => void;
}

/**
 * Forged Wheels Grid - Mansory-style premium showroom design.
 * Desktop: 3 columns, Tablet: 2, Mobile: 1.
 * Light gray cards (#E5E5E5), dark section bg (#0E0E0E), badges, model names below.
 */
const ForgedWheelsGrid = memo(({
  images,
  onImageClick
}: ForgedWheelsGridProps) => {
  const [imagePosition, setImagePosition] = useState("center 10%");

  // Set image position based on screen size - wheels positioned lower
  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth >= 768) {
        // Desktop: center 24% - wheels positioned lower
        setImagePosition("center 24%");
      } else {
        // Mobile: center 19% - wheels positioned lower
        setImagePosition("center 19%");
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  // Extract short model codes from titles (e.g., "BMW Premium Forged Wheels" -> "FC.5")
  // For now, using first letters + index, but ideally should come from data
  const getModelCode = (title: string, index: number): string => {
    const codes = ["FC.5", "CS.11", "DX.5", "MB.7", "ST.9", "GL.3", "DC.8", "YS.2", "FS.6", "YS.4"];
    return codes[index] || `W${index + 1}`;
  };

  // Determine badge text (Fully Forged / Light Alloy)
  const getBadgeText = (title: string): string => {
    if (title.toLowerCase().includes("forged")) {
      return "Fully Forged";
    }
    return "Light Alloy";
  };
  return <section className="relative bg-premium-black py-12 sm:py-16 md:py-24 -mx-4 sm:-mx-8 md:-mx-16">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
      {/* Section Title */}
      <motion.h2 initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest text-white uppercase mb-8 sm:mb-12">
        FORGED WHEELS
      </motion.h2>

      {/* Grid: 2 col mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {images.map((image, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-50px"
        }} transition={{
          duration: 0.5,
          delay: index * 0.05
        }} className="group cursor-pointer" onClick={() => onImageClick?.(index)}>
          {/* Card - Premium design with enhanced styling */}
          <div className="relative bg-gradient-to-br from-[#E8E8E8] to-[#D8D8D8] rounded-none overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-[6px] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 group-hover:border-white/40">
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

            {/* Badge - top left with enhanced design */}
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
              <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1 bg-white/95 backdrop-blur-sm text-[#111] text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-widest rounded-none font-display shadow-sm group-hover:shadow-md transition-shadow duration-300">
                {getBadgeText(image.title)}
              </span>
            </div>

            {/* Image - 1:1, positioned higher to show full wheels */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
              <img src={image.src} alt={image.title} loading={index < 6 ? "eager" : "lazy"} decoding={index < 6 ? "sync" : "async"} fetchpriority={index < 3 ? "high" : "auto"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" style={{
                objectPosition: imagePosition
              }} />
            </div>
          </div>

          {/* Model Name - below card with enhanced typography */}
          <div className="mt-3 sm:mt-4">

          </div>
        </motion.div>)}
      </div>
    </div>
  </section>;
});
ForgedWheelsGrid.displayName = "ForgedWheelsGrid";
export default ForgedWheelsGrid;