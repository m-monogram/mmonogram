import { useEffect, memo } from "react";
import { motion } from "framer-motion";
import logoMmonogram from "@/assets/logo-mmonogram.webp";

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Premium branded loading screen — large pulsing M-Monogram logo.
 */
const LoadingScreen = memo(({ onComplete }: LoadingScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 700);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-premium-black flex flex-col items-center justify-center"
    >
      <img
        src={logoMmonogram}
        alt="M-Monogram"
        width={900}
        height={212}
        loading="eager"
        decoding="sync"
        fetchpriority="high"
        className="w-64 sm:w-80 md:w-96 lg:w-[28rem] max-w-[78vw] h-auto object-contain opacity-95 animate-logo-pulse will-change-[opacity,transform]"
      />
      {/* Девиз под монограммой. Разрядка крупная, кегль мелкий — подпись
          должна читаться как гравировка под клеймом, а не как второй
          заголовок рядом с логотипом. */}
      <p className="mt-6 font-display text-[9px] uppercase tracking-[0.42em] text-white/35 sm:mt-7 sm:text-[10px]">
        Beyond the Ordinary
      </p>
    </motion.div>
  );
});

LoadingScreen.displayName = "LoadingScreen";

export default LoadingScreen;
