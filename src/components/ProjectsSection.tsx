import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import LatestAdditionsCarousel from "@/components/sections/latest-additions-carousel";
import { useNavigation } from "@/hooks/useNavigation";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { BlurText } from "@/components/ui/blur-text";

interface ProjectsSectionProps {
  setCurrentView?: (view: string) => void;
  onProjectClick?: (projectId: string) => void;
}

/**
 * Premium fullscreen Projects page with hero section, enhanced typography, and CTA.
 * Uses same LatestAdditionsCarousel as Home (2 large cards per viewport, no partial 3rd).
 */
const ProjectsSection = memo(({ setCurrentView, onProjectClick }: ProjectsSectionProps) => {
  const { navigateToView } = useNavigation({ setCurrentView });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleCommissionClick = () => {
    navigateToView("contact");
  };

  return (
    <AuroraBackground className="min-h-screen" intensity="subtle" showRadialGradient={true} transparent={true}>
      <div className="relative z-10 w-full min-h-screen pb-12 sm:pb-16">
        {/* Back Button - positioned below logo */}
        <div className="absolute left-4 sm:left-6 md:left-12 z-20" style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}>
          <motion.button
            type="button"
            onClick={() => navigateToView("home")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50 backdrop-blur-md rounded-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>
        </div>

        {/* Hero Section - Enhanced - starts from top with light gradient overlay */}
        <section className="relative pb-6 sm:pb-8 px-4 sm:px-6 md:px-8" style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 5.5rem)` }}>
          {/* Light gradient overlay - photo visible, text readable */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `
                linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.55) 100%)
              `
            }}
            aria-hidden
          />

          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-[1]" aria-hidden>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
                `,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Decorative accent line - enhanced */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-5 sm:mb-6"
            />

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <BlurText
                text="OUR PROJECTS"
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-widest text-white uppercase mb-4 sm:mb-5"
                delay={0.5}
                staggerDelay={0.1}
              />
            </motion.div>

            {/* Subtitle / Description - enhanced */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="font-body text-base sm:text-lg md:text-xl text-white/75 leading-relaxed max-w-3xl mx-auto tracking-wide mb-4"
            >
              A curated collection of bespoke automotive transformations
            </motion.p>

            {/* Stats / Badge - enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center mt-6"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-none">
                <Sparkles className="w-5 h-5 text-white/70" />
                <span className="font-body text-sm sm:text-base text-white/70 uppercase tracking-widest">
                  Premium Craftsmanship
                </span>
              </div>
            </motion.div>

            {/* Decorative accent line - enhanced */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mt-6 sm:mt-8"
            />
          </div>
        </section>

        {/* Projects Carousel */}
        <LatestAdditionsCarousel
          onProjectClick={onProjectClick}
        />

        {/* CTA Section - Enhanced */}
        <motion.section
          className="relative pt-14 sm:pt-16 md:pt-20 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6 md:px-8"
        >
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" aria-hidden />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Decorative line - enhanced */}
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-10 sm:mb-12" />

            {/* CTA Title - enhanced */}
            <motion.h3
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-widest text-white uppercase mb-6 sm:mb-8"
            >
              Commission Your Project
            </motion.h3>

            {/* CTA Description - enhanced */}
            <motion.p
              className="font-body text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-10 sm:mb-12"
            >
              Transform your vehicle into a bespoke masterpiece. Let's discuss your vision.
            </motion.p>

            {/* CTA Button - enhanced */}
            <motion.button
              type="button"
              onClick={handleCommissionClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 bg-white text-black px-10 py-4 sm:px-12 sm:py-5 font-body text-sm sm:text-base md:text-lg uppercase tracking-widest hover:bg-white/95 transition-all duration-300 cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Decorative line - enhanced */}
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-10 sm:mt-12" />
          </div>
        </motion.section>
      </div>
    </AuroraBackground>
  );
});

ProjectsSection.displayName = "ProjectsSection";

export default ProjectsSection;
