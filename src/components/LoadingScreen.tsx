import { useEffect, memo } from "react";
import { motion } from "framer-motion";
import logoMmonogram from "@/assets/logo-mmonogram.png";

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Fast loading screen - 600ms
 */
const LoadingScreen = memo(({ onComplete }: LoadingScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-premium-black flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <motion.img
          src={logoMmonogram}
          alt="M-Monogram"
          loading="eager"
          decoding="sync"
          fetchpriority="high"
          className="w-48 sm:w-56 md:w-64 max-w-[60vw]"
        />
        
        {/* Progress bar */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 sm:w-40">
          <div className="h-px bg-white/20 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-white/60"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

LoadingScreen.displayName = "LoadingScreen";

export default LoadingScreen;
