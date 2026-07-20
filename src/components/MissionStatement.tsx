import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MissionStatementProps {
  onNavigateToProjects?: () => void;
  onNavigateToBrand?: () => void;
}

const PILLARS = [
  { n: "01", label: "Bespoke Design" },
  { n: "02", label: "Master Craft" },
  { n: "03", label: "One of One" },
];

const MissionStatement = memo(({
  onNavigateToProjects,
  onNavigateToBrand,
}: MissionStatementProps) => {
  const navigate = useNavigate();

  const handleAllModels = () => {
    if (onNavigateToProjects) return onNavigateToProjects();
    navigate("/projects");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const handleAboutUs = () => {
    if (onNavigateToBrand) return onNavigateToBrand();
    navigate("/brand");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <section className="relative flex items-center justify-center bg-premium-black overflow-hidden py-20 sm:py-24 md:py-32">
      {/* Top gradient fade for seamless transition from Hero */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none" />

      {/* Radial ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full pointer-events-none opacity-[0.06]"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 60%)" }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
            <span className="h-px w-8 sm:w-12 bg-white/25" />
            <span className="font-body text-[10px] sm:text-[11px] tracking-[0.45em] uppercase text-white/45">
              M · Monogram — UAE
            </span>
            <span className="h-px w-8 sm:w-12 bg-white/25" />
          </div>

          {/* Main Statement */}
          <h2 className="font-display text-[2.25rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-white/95 uppercase font-extralight mb-6 sm:mb-8">
            Where Automobiles
            <br />
            <span className="italic font-light text-white/70">become</span> Art
          </h2>

          {/* Ornament divider */}
          <div className="flex items-center justify-center gap-3 mb-7 sm:mb-9">
            <span className="h-px w-14 sm:w-20 bg-gradient-to-r from-transparent to-white/40" />
            <span className="w-1.5 h-1.5 rotate-45 bg-white/60" />
            <span className="h-px w-14 sm:w-20 bg-gradient-to-l from-transparent to-white/40" />
          </div>

          {/* Subtitle */}
          <p className="font-body text-sm sm:text-base md:text-lg text-white/60 leading-relaxed max-w-xl mx-auto font-light">
            Bespoke luxury car customization and prototype development, crafted in the United Arab Emirates.
          </p>

          {/* Pillars trio */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.1 }}
                className="relative flex flex-col items-center gap-2 py-4 sm:py-5 border-t border-white/10"
              >
                <span className="font-display text-[10px] sm:text-xs tracking-[0.35em] text-white/35">
                  {p.n}
                </span>
                <span className="font-display text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase text-white/85">
                  {p.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <button
              onClick={handleAllModels}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-body text-xs sm:text-sm uppercase tracking-[0.25em] hover:bg-white/90 transition-all duration-300"
            >
              View Collection
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={handleAboutUs}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/25 text-white/90 font-body text-xs sm:text-sm uppercase tracking-[0.25em] hover:border-white/60 hover:bg-white/5 transition-all duration-300"
            >
              About the Atelier
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

MissionStatement.displayName = "MissionStatement";
export default MissionStatement;
