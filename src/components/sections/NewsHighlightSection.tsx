import { motion } from "framer-motion";
import { ArrowRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsHighlightSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="news-highlight"
      className="relative z-10 bg-premium-black py-20 sm:py-28 md:py-32"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
        <motion.span
          className="inline-block font-display text-[11px] uppercase tracking-[0.35em] text-white/45 mb-5"
        >
          {t("homeNews.eyebrow")}
        </motion.span>

        <motion.h2
          className="font-display text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.05]"
        >
          {t("homeNews.title")}
        </motion.h2>

        <motion.p
          className="mt-5 sm:mt-6 max-w-xl mx-auto font-body text-sm sm:text-base text-white/60 leading-relaxed"
        >
          {t("news.subtitle")}
        </motion.p>

        <motion.div
          className="mt-10 sm:mt-12"
        >
          <Link
            to="/press"
            className="group inline-flex items-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-display text-xs sm:text-sm uppercase tracking-[0.3em]">
              {t("homeNews.cta")}
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsHighlightSection;
