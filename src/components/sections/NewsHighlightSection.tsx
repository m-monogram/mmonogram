import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllNews } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";

const NewsHighlightSection = () => {
  const { t } = useLanguage();
  const items = getAllNews().slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section
      id="news-highlight"
      className="relative z-10 bg-premium-black py-16 sm:py-20 md:py-28"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="block font-display text-[11px] uppercase tracking-[0.3em] text-white/45 mb-3"
            >
              {t("homeNews.eyebrow")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]"
            >
              {t("homeNews.title")}
            </motion.h2>
          </div>

          <Link
            to="/news"
            className="group inline-flex items-center gap-3 self-start md:self-end px-6 py-3 border border-white/20 hover:border-white/60 bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <span className="font-display text-xs uppercase tracking-[0.25em] text-white">
              {t("homeNews.cta")}
            </span>
            <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {items.map((item, index) => (
            <NewsCard key={item.slug} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsHighlightSection;
