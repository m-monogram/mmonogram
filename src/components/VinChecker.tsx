import { Phone, Building2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const VinChecker = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24 bg-black overflow-hidden z-10">
      {/* Soft radial glow for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, hsla(0,0%,100%,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-foreground/30" />
            <ShieldCheck className="w-4 h-4 text-foreground/60" strokeWidth={1.25} />
            <div className="h-px w-10 bg-foreground/30" />
          </div>

          <span className="font-body text-[10px] sm:text-xs tracking-[0.4em] text-foreground/50 uppercase mb-4">
            Official Verification Service
          </span>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.18em] sm:tracking-[0.22em] uppercase text-foreground leading-tight">
            {t("verify.title")}
          </h1>

          <p className="mt-6 font-body text-sm sm:text-base text-foreground/55 max-w-md leading-relaxed">
            Verify your M-Monogram vehicle through our official channels.
          </p>
        </motion.div>

        {/* Contact lines - editorial style, no boxes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid sm:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10"
        >
          {/* Hotline */}
          <a
            href="tel:+971545077707"
            className="group relative bg-black hover:bg-foreground/[0.04] transition-colors duration-500 px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center text-center"
          >
            <Phone className="w-5 h-5 text-foreground/40 group-hover:text-foreground/80 transition-colors duration-500 mb-5" strokeWidth={1.25} />
            <span className="font-body text-[10px] sm:text-xs tracking-[0.35em] uppercase text-foreground/50 mb-3">
              {t("verify.hotline")}
            </span>
            <span className="font-display text-xl sm:text-2xl tracking-[0.15em] text-foreground">
              +971 54 507 7707
            </span>
            <span className="mt-4 h-px w-0 group-hover:w-12 bg-foreground/60 transition-all duration-500" />
          </a>

          {/* Office */}
          <a
            href="tel:+97142284177"
            className="group relative bg-black hover:bg-foreground/[0.04] transition-colors duration-500 px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center text-center"
          >
            <Building2 className="w-5 h-5 text-foreground/40 group-hover:text-foreground/80 transition-colors duration-500 mb-5" strokeWidth={1.25} />
            <span className="font-body text-[10px] sm:text-xs tracking-[0.35em] uppercase text-foreground/50 mb-3">
              {t("verify.office")}
            </span>
            <span className="font-display text-xl sm:text-2xl tracking-[0.15em] text-foreground">
              +971 4 228 4177
            </span>
            <span className="mt-4 h-px w-0 group-hover:w-12 bg-foreground/60 transition-all duration-500" />
          </a>
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 sm:mt-12 text-center font-body text-[10px] sm:text-xs tracking-[0.3em] uppercase text-foreground/35"
        >
          Mon — Sat · 09:00 — 19:00 (GST)
        </motion.p>
      </div>
    </section>
  );
};

export default VinChecker;
