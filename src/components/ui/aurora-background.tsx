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
      {/* Aurora streaks removed for cleaner pure-black aesthetic */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className={fillHeight ? "h-full w-full flex-1 min-h-0 self-stretch" : "w-full"}
      >
        {children}
      </div>
    </div>
  );
};
