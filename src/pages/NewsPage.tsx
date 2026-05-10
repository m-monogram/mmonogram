import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NewsCard from "@/components/news/NewsCard";
import { getAllNews, NewsCategory } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-main-new.webp";

type Filter = "all" | NewsCategory;

const NewsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo(() => getAllNews(), []);
  const filtered = useMemo(
    () => (filter === "all" ? all : all.filter((n) => n.category === filter)),
    [all, filter]
  );

  const filters: { id: Filter; labelKey: string }[] = [
    { id: "all", labelKey: "news.filterAll" },
    { id: "news", labelKey: "news.category.news" },
    { id: "event", labelKey: "news.category.event" },
    { id: "press", labelKey: "news.category.press" },
  ];

  return (
    <div className="min-h-screen bg-premium-black">
      <SEOHead
        title="News & Events — M-Monogram"
        description="Latest news, events and press from the M-Monogram atelier."
        path="/news"
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[420px] sm:h-[65vh] w-full overflow-hidden">
        <img
          src={heroBg}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-premium-black" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
          <motion.button
            type="button"
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-[11px] uppercase tracking-[0.25em]">
              {t("news.backToHome")}
            </span>
          </motion.button>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="block font-display text-[11px] uppercase tracking-[0.35em] text-white/55 mb-4"
          >
            {t("news.eyebrow")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[88px] text-white tracking-tight leading-[1.02]"
          >
            {t("news.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-4 sm:mt-6 max-w-2xl font-body text-sm sm:text-base text-white/65 leading-relaxed"
          >
            {t("news.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 border transition-all duration-300 font-display text-[11px] uppercase tracking-[0.25em] ${
                    active
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/65 border-white/15 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {t(f.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="font-body text-white/50 text-center py-20">
              {t("news.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {filtered.map((item, index) => (
                <NewsCard key={item.slug} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;
