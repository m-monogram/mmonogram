import { cn } from "@/lib/utils";

interface MediaEdgeFadeProps {
  edges?: "bottom" | "top" | "both";
  className?: string;
}

/** Soft black overflow so a photo/video never meets the next section as a hard grey line. */
const MediaEdgeFade = ({ edges = "bottom", className }: MediaEdgeFadeProps) => {
  const showTop = edges === "top" || edges === "both";
  const showBottom = edges === "bottom" || edges === "both";

  return (
    <>
      {showTop && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-[5] h-12 sm:h-14",
            className
          )}
          style={{
            background:
              "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.28) 42%, transparent 100%)",
          }}
        />
      )}
      {showBottom && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 sm:h-16",
            className
          )}
          style={{
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,0.3) 32%, transparent 100%)",
          }}
        />
      )}
    </>
  );
};

export const mediaFadeMask = {
  WebkitMaskImage:
    "linear-gradient(to bottom, #000 0%, #000 88%, rgba(0,0,0,0.55) 96%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, #000 0%, #000 88%, rgba(0,0,0,0.55) 96%, transparent 100%)",
} as const;

export default MediaEdgeFade;
