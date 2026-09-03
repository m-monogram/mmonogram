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
            "pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 sm:h-32 md:h-40",
            className
          )}
          style={{
            background:
              "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.2) 76%, transparent 100%)",
          }}
        />
      )}
      {showBottom && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 sm:h-40 md:h-48",
            className
          )}
          style={{
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,0.92) 24%, rgba(0,0,0,0.6) 52%, rgba(0,0,0,0.22) 78%, transparent 100%)",
          }}
        />
      )}
    </>
  );
};

export const mediaFadeMask = {
  WebkitMaskImage:
    "linear-gradient(to bottom, #000 0%, #000 68%, rgba(0,0,0,0.75) 84%, rgba(0,0,0,0.3) 94%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, #000 0%, #000 68%, rgba(0,0,0,0.75) 84%, rgba(0,0,0,0.3) 94%, transparent 100%)",
} as const;


export default MediaEdgeFade;
