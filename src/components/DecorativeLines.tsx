import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface DecorativeLinesProps {
  variant?: "curved" | "diagonal" | "mansory";
  position?: "left" | "right" | "center";
}

const DecorativeLines = ({ 
  variant = "mansory",
  position = "center"
}: DecorativeLinesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mansory-style elegant flowing light streaks - like the reference image
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Wide soft glow gradient */}
          <linearGradient id="streakWide" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="20%" stopColor="white" stopOpacity="0.02" />
            <stop offset="40%" stopColor="white" stopOpacity="0.06" />
            <stop offset="60%" stopColor="white" stopOpacity="0.08" />
            <stop offset="80%" stopColor="white" stopOpacity="0.04" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Main visible streaks */}
          <linearGradient id="streakMain" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="15%" stopColor="white" stopOpacity="0.05" />
            <stop offset="35%" stopColor="white" stopOpacity="0.2" />
            <stop offset="50%" stopColor="white" stopOpacity="0.35" />
            <stop offset="65%" stopColor="white" stopOpacity="0.2" />
            <stop offset="85%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Bright core line */}
          <linearGradient id="streakCore" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="25%" stopColor="white" stopOpacity="0.3" />
            <stop offset="50%" stopColor="white" stopOpacity="0.7" />
            <stop offset="75%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Soft blur filter */}
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Medium blur */}
          <filter id="mediumBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core glow */}
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Wide ambient glow - background layer */}
        <motion.path
          d="M -300 1400 Q 500 700 1100 300 Q 1500 50 2200 -200"
          fill="none"
          stroke="url(#streakWide)"
          strokeWidth="300"
          strokeLinecap="round"
          filter="url(#softBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 0.6 } : {}}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Primary flowing streaks - visible light bands */}
        <motion.path
          d="M -200 1300 Q 450 650 1000 300 Q 1400 50 2100 -150"
          fill="none"
          stroke="url(#streakMain)"
          strokeWidth="80"
          strokeLinecap="round"
          filter="url(#mediumBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
        
        <motion.path
          d="M -100 1350 Q 550 700 1100 350 Q 1500 100 2150 -100"
          fill="none"
          stroke="url(#streakMain)"
          strokeWidth="50"
          strokeLinecap="round"
          filter="url(#mediumBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.path
          d="M 0 1400 Q 600 750 1150 400 Q 1550 150 2200 -50"
          fill="none"
          stroke="url(#streakMain)"
          strokeWidth="35"
          strokeLinecap="round"
          filter="url(#mediumBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Sharp bright core lines - the white highlights */}
        <motion.path
          d="M -150 1320 Q 500 680 1050 330 Q 1450 80 2120 -120"
          fill="none"
          stroke="url(#streakCore)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#coreGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.path
          d="M -50 1370 Q 580 720 1120 370 Q 1520 120 2170 -80"
          fill="none"
          stroke="url(#streakCore)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#coreGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.path
          d="M 50 1420 Q 650 770 1180 420 Q 1580 170 2220 -30"
          fill="none"
          stroke="url(#streakCore)"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#coreGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Thin accent lines */}
        <motion.path
          d="M -250 1280 Q 400 630 950 280 Q 1350 30 2050 -170"
          fill="none"
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.path
          d="M 150 1470 Q 720 820 1250 470 Q 1650 220 2280 20"
          fill="none"
          stroke="white"
          strokeOpacity="0.08"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2.2, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
};

export default DecorativeLines;