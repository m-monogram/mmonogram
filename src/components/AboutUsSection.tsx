import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * About Us section - Premium compact design with visual interest
 */
const AboutUsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 sm:py-24 bg-premium-black overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Compact header with accent line */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >


          {/* Single line title - more impactful */}
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest text-white uppercase font-extralight mb-6 leading-tight">
            {t('about.titleShort')}
          </h2>

          {/* Minimal separator */}
          <div className="w-8 h-px bg-white/20 mx-auto mb-6" />

          {/* Short tagline instead of long description */}
          <p className="font-body text-sm sm:text-base text-white/50 tracking-wide max-w-xl mx-auto mb-10">
            {t('about.tagline')}
          </p>

          {/* Values as elegant pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[t('about.value1'), t('about.value2'), t('about.value3')].map((value, index) => (
              <motion.span
                key={value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="px-4 py-2 border border-white/10 bg-white/[0.02] backdrop-blur-sm text-white/60 font-body text-[10px] sm:text-xs tracking-widest uppercase hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
              >
                {value}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUsSection;
