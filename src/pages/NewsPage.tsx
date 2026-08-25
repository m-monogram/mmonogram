import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NewsCard from "@/components/news/NewsCard";
import MediaEdgeFade from "@/components/MediaEdgeFade";
import { getAllNews, NewsCategory } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-main-new.webp";

type Filter = "all" | NewsCategory;

const NewsPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo(() => getAllNews(), []);
  const filtered = useMemo(
    () => (filter === "all" ? all : all.filter((n) => n.category === filter)),
    [all, filter]
  );

  // Featured = first item when no filter applied or first match
  const [featured, ...rest] = filtered;

  const filters: { id: Filter; labelKey: string }[] = [
    { id: "all", labelKey: "news.filterAll" },
    { id: "news", labelKey: "news.category.news" },
    { id: "event", labelKey: "news.category.event" },
    { id: "press", labelKey: "news.category.press" },
  ];

  const dateLocale = language === "ru" ? "ru-RU" : language === "ar" ? "ar-AE" : "en-GB";
  const featuredDate = featured
    ? new Date(featured.publishedAt).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // SEO: ItemList structured data for all visible news
  const baseUrl = "https://m-monogram.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filtered.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/press/${n.slug}`,
      name: n.title[language],
    })),
  };

  return (
    <div className="min-h-screen bg-premium-black">
      <SEOHead
        title="Press — M-Monogram"
        description="Latest press features, events and stories from the M-Monogram atelier — bespoke G-Class transformations, private reveals and editorial coverage."
        path="/press"
        jsonLd={jsonLd}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[420px] sm:h-[65vh] w-full overflow-hidden">
        <img
          src={heroBg}
          alt=""
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
        <MediaEdgeFade edges="bottom" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
          <motion.button
            type="button"
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white transition-colors self-start"
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

      {/* Filters + Editorial layout */}
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

          {filtered.length === 0 ? (
            <p className="font-body text-white/50 text-center py-20">
              {t("news.empty")}
            </p>
          ) : (
            <>
              {/* Featured editorial card */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-12 sm:mb-16"
                >
                  <Link
                    to={`/press/${featured.slug}`}
                    className="group grid grid-cols-1 lg:grid-cols-12 gap-0 bg-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_60px_rgba(255,255,255,0.08)]"
                  >
                    <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:min-h-[480px] overflow-hidden">
                      <img
                        src={featured.cover}
                        alt={featured.title[language]}
                        fetchpriority="high"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform [transition-duration:900ms] group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
                      <div className="absolute top-5 left-5 px-3 py-1 bg-white text-black font-display text-[10px] uppercase tracking-[0.25em]">
                        {t("news.featured") || "Featured"}
                      </div>
                    </div>
                    <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center gap-5">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-[10px] uppercase tracking-[0.25em] text-white/55">
                          {t(`news.category.${featured.category}`)}
                        </span>
                        <span className="w-6 h-px bg-white/30" />
                        <span className="font-display text-[10px] uppercase tracking-[0.25em] text-white/55">
                          {featuredDate}
                        </span>
                      </div>
                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.05] tracking-tight">
                        {featured.title[language]}
                      </h2>
                      <p className="font-body text-base text-white/70 leading-relaxed line-clamp-4">
                        {featured.excerpt[language]}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                        <span className="font-display text-[11px] uppercase tracking-[0.25em]">
                          {t("news.readFullStory") || t("news.readMore")}
                        </span>
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Rest grid */}
              {rest.length > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <p className="font-display text-[11px] uppercase tracking-[0.35em] text-white/45">
                      {t("news.moreStories") || "More stories"}
                    </p>
                    <span className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {rest.map((item, index) => (
                      <NewsCard key={item.slug} item={item} index={index} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;
