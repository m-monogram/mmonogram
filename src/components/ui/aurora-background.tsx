"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  intensity?: "subtle" | "medium" | "strong";
  transparent?: boolean;
  /** When true, children wrapper fills the container (e.g. hero h-screen). Fixes hero collapse. */
  fillHeight?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  intensity = "subtle",
  transparent = false,
  fillHeight = false,
  ...props
}: AuroraBackgroundProps) => {
  const intensityClasses = {
    subtle: "opacity-20 blur-[12px]",
    medium: "opacity-30 blur-[10px]",
    strong: "opacity-40 blur-[8px]",
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center text-white overflow-hidden",
        transparent ? "bg-transparent" : "bg-black",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          zIndex: 0,
          "--aurora":
            "repeating-linear-gradient(100deg,rgba(255,255,255,0.1)_10%,rgba(200,200,255,0.08)_15%,rgba(180,200,255,0.06)_20%,rgba(220,220,255,0.05)_25%,rgba(160,180,255,0.08)_30%)",
          "--dark-gradient":
            transparent 
              ? "repeating-linear-gradient(100deg,transparent_0%,transparent_7%,transparent_10%,transparent_12%,transparent_16%)"
              : "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
          "--white-gradient":
            "repeating-linear-gradient(100deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.03)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.03)_16%)",
          "--black": "#000",
          "--white": "rgba(255,255,255,0.1)",
          "--transparent": "transparent",
        } as React.CSSProperties}
      >
        <div
          className={cn(
            `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] ${intensityClasses[intensity]} filter will-change-transform after:absolute after:inset-0 after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-soft-light after:content-[""]`,
            transparent 
              ? `[background-image:var(--white-gradient),var(--aurora)] after:[background-image:var(--white-gradient),var(--aurora)]`
              : `[background-image:var(--dark-gradient),var(--aurora)] after:[background-image:var(--dark-gradient),var(--aurora)]`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_15%,var(--transparent)_70%)]`,
          )}
        ></div>
      </div>
      <div
        style={{ position: "relative", zIndex: 1 }}
        className={fillHeight ? "h-full w-full flex-1 min-h-0 self-stretch" : "w-full"}
      >
        {children}
      </div>
    </div>
  );
};
