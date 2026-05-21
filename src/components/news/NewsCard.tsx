import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsItem } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsCardProps {
  item: NewsItem;
  index?: number;
  variant?: "default" | "compact";
}

const NewsCard = ({ item, index = 0, variant = "default" }: NewsCardProps) => {
  const { t, language } = useLanguage();

  const dateLocale = language === "ru" ? "ru-RU" : language === "ar" ? "ar-AE" : "en-GB";
  const formattedDate = new Date(item.publishedAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const title = item.title[language];
  const excerpt = item.excerpt[language];
  const categoryLabel = t(`news.category.${item.category}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        to={`/press/${item.slug}`}
        className="block h-full bg-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 overflow-hidden relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]"
      >
        {/* Cover */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={item.cover}
            alt={title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {/* Category chip */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/20">
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-white/90">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-3">
          <span className="font-display text-[10px] uppercase tracking-[0.25em] text-white/45">
            {formattedDate}
          </span>
          <h3 className="font-display text-lg sm:text-xl md:text-2xl text-white leading-tight tracking-tight line-clamp-2 group-hover:text-white transition-colors">
            {title}
          </h3>
          {variant === "default" && (
            <p className="font-body text-sm text-white/60 leading-relaxed line-clamp-3">
              {excerpt}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
            <span className="font-display text-[11px] uppercase tracking-[0.25em]">
              {t("news.readMore")}
            </span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsCard;
