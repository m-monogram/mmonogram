import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface MissionStatementProps {
  onNavigateToProjects?: () => void;
  onNavigateToBrand?: () => void;
}

/**
 * Mission Statement block: "OUR MISSION GOES BEYOND TUNING"
 * Fullscreen/70-80vh, dark background, centered text, two CTAs.
 * Positioned after Hero, before projects - brand ideology moment.
 */
const MissionStatement = memo(({
  onNavigateToProjects,
  onNavigateToBrand
}: MissionStatementProps) => {
  const navigate = useNavigate();
  const handleAllModels = () => {
    if (onNavigateToProjects) {
      onNavigateToProjects();
    } else {
      navigate("/projects");
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  };
  const handleAboutUs = () => {
    if (onNavigateToBrand) {
      onNavigateToBrand();
    } else {
      navigate("/brand");
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  };
  return <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center bg-premium-black overflow-hidden">
      
      {/* Top gradient fade for seamless transition from Hero */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none" />
      
      {/* Subtle pattern/background - optional decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
        backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `,
        backgroundSize: "40px 40px"
      }} aria-hidden />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true,
        margin: "-100px"
      }} transition={{
        duration: 0.8
      }}>
          {/* Main Statement */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-widest text-white/90 uppercase mb-4 sm:mb-6 md:mb-8 leading-tight">
            WHERE AUTOMOBILES BECOME ART
          </h2>

          {/* Subtitle */}
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="font-body text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto px-4 break-words" style={{
          wordBreak: 'normal',
          overflowWrap: 'break-word'
        }}>
          Bespoke luxury car customization and prototype development in the UAE.
        </motion.p>



        </motion.div>
      </div>
    </section>;
});
MissionStatement.displayName = "MissionStatement";
export default MissionStatement;