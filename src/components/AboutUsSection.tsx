import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * About Us section — editorial minimalist composition
 * Refined typography, asymmetric accents, generous negative space
 */
const AboutUsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 sm:py-32 md:py-40 bg-premium-black overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Ambient radial glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full pointer-events-none opacity-[0.05]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow index mark */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center gap-3 mb-10"
          >
            <span className="h-px w-8 bg-foreground/30" />
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-foreground/40">
              01 — Atelier
            </span>
            <span className="h-px w-8 bg-foreground/30" />
          </motion.div>

          {/* Title */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground uppercase font-bold leading-[1.05] mb-8 max-w-3xl">
            {t("about.titleShort")}
          </h2>

          {/* Refined ornament divider */}
          <div className="flex items-center gap-4 mb-10">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-foreground/40" />
            <span className="w-1 h-1 rotate-45 bg-foreground/50" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-foreground/40" />
          </div>

          {/* Tagline */}
          <p className="font-body text-base sm:text-lg text-foreground/60 tracking-normal max-w-xl leading-relaxed font-semibold">
            {t("about.tagline")}
          </p>

          {/* Signature mark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 flex flex-col items-center gap-3"
          >
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-foreground/30 to-transparent" />
            <span className="font-display text-[10px] tracking-[0.5em] uppercase text-foreground/35">
              M · Monogram
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUsSection;
