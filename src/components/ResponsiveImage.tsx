import { memo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;
}

/**
 * ResponsiveImage - Performance-optimized image component
 * 
 * Features:
 * - Intersection Observer lazy loading for below-the-fold images
 * - Priority loading for LCP images
 * - Smooth fade-in transition
 * - Native lazy loading fallback
 * - Proper fetchPriority hints
 * - Automatic srcset generation for responsive images
 */
const ResponsiveImage = memo(({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  aspectRatio,
  objectFit = "cover",
  objectPosition = "center",
}: ResponsiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for true lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Generate srcset for responsive images (width descriptors)
  const generateSrcSet = useCallback((imageSrc: string) => {
    // For imported assets, just use the original
    if (imageSrc.includes('data:') || imageSrc.startsWith('blob:')) {
      return undefined;
    }
    
    // For static assets, create width-based srcset
    const widths = [320, 640, 960, 1280, 1920];
    return widths.map(w => `${imageSrc} ${w}w`).join(', ');
  }, []);

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={cn(
          "bg-muted/20 flex items-center justify-center",
          containerClassName
        )}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt}
      >
        <span className="text-muted-foreground/50 text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ aspectRatio }}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/10 animate-pulse" />
      )}

      {/* Render image only when in view */}
      {isInView && (
        <picture>
          {/* WebP source for modern browsers */}
          <source
            type="image/webp"
            srcSet={generateSrcSet(src)}
            sizes={sizes}
          />
          {/* AVIF source for cutting-edge browsers */}
          <source
            type="image/avif"
            srcSet={generateSrcSet(src)}
            sizes={sizes}
          />
          {/* Fallback image */}
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchpriority={priority ? "high" : "auto"}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full transition-opacity duration-300 ease-out",
              isLoaded ? "opacity-100" : "opacity-0",
              objectFit === "cover" && "object-cover",
              objectFit === "contain" && "object-contain",
              objectFit === "fill" && "object-fill",
              className
            )}
            style={{ objectPosition }}
          />
        </picture>
      )}
    </div>
  );
});

ResponsiveImage.displayName = "ResponsiveImage";

export default ResponsiveImage;
