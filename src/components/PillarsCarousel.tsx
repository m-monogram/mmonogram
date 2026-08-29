import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Picture from "@/components/Picture";

interface Pillar {
  title: string;
  description: string;
  image: string;
}

interface PillarsCarouselProps {
  items: Pillar[];
  className?: string;
}

export const PillarsCarousel = ({ items, className }: PillarsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback((api: any) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={cn("relative w-full max-w-7xl mx-auto", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {items.map((item, index) => (
            <div key={index} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4">
              <div className="relative group h-full">
                {/* Premium glass card with light effect */}
                <div className="aspect-[4/5] overflow-hidden relative bg-gradient-to-b from-white/5 to-transparent border border-white/20 hover:border-white/40 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                  <Picture
                    src={item.image}
                    alt={item.title}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Premium light overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] pointer-events-none" />
                </div>
                {/* Title and description below card */}
                <div className="mt-4 space-y-1">
                  <h3 className="font-display text-base sm:text-lg text-white uppercase tracking-widest">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
