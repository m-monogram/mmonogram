import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Share2, Link as LinkIcon, Check } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NewsContentRenderer from "@/components/news/NewsContentRenderer";
import NewsCard from "@/components/news/NewsCard";
import { getNewsBySlug, getRelatedNews } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const item = useMemo(() => (slug ? getNewsBySlug(slug) : undefined), [slug]);
  const related = useMemo(() => (slug ? getRelatedNews(slug, 2) : []), [slug]);

  if (!item) {
    return (
      <div className="min-h-screen bg-premium-black flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl text-white mb-4">
            {t("news.notFoundTitle")}
          </h1>
          <p className="font-body text-white/60 mb-8 max-w-md">
            {t("news.notFoundDescription")}
          </p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white hover:text-black transition-all font-display text-xs uppercase tracking-[0.25em] text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("news.backToNews")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const dateLocale = language === "ru" ? "ru-RU" : language === "ar" ? "ar-AE" : "en-GB";
  const formattedDate = new Date(item.publishedAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedEventDate = item.eventDate
    ? new Date(item.eventDate).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const title = item.title[language];
  const excerpt = item.excerpt[language];
  const categoryLabel = t(`news.category.${item.category}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url: window.location.href });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-premium-black">
      <SEOHead title={`${title} — M-Monogram`} description={excerpt} path={`/news/${item.slug}`} />
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
        <img
          src={item.cover}
          alt={title}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-premium-black" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">
          <motion.button
            type="button"
            onClick={() => navigate("/news")}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-[11px] uppercase tracking-[0.25em]">
              {t("news.backToNews")}
            </span>
          </motion.button>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/25 font-display text-[10px] uppercase tracking-[0.25em] text-white">
              {categoryLabel}
            </span>
            <span className="font-display text-[11px] uppercase tracking-[0.25em] text-white/55">
              {formattedDate}
            </span>
            {item.author && (
              <span className="font-display text-[11px] uppercase tracking-[0.25em] text-white/55">
                · {item.author}
              </span>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05] max-w-4xl"
          >
            {title}
          </motion.h1>
        </div>
      </section>

      {/* Body */}
      <article className="relative z-10 py-16 sm:py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          {/* Event meta */}
          {(formattedEventDate || item.location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 p-6 bg-slate-900/30 backdrop-blur-xl border border-white/10">
              {formattedEventDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-white/60 mt-1 shrink-0" />
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1">
                      {t("news.eventDate")}
                    </p>
                    <p className="font-body text-sm text-white">{formattedEventDate}</p>
                  </div>
                </div>
              )}
              {item.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-1 shrink-0" />
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1">
                      {t("news.eventLocation")}
                    </p>
                    <p className="font-body text-sm text-white">{item.location}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Excerpt as lead */}
          <p className="font-body text-lg sm:text-xl text-white/80 leading-relaxed mb-10 sm:mb-12 border-l-2 border-white/30 pl-6">
            {excerpt}
          </p>

          <NewsContentRenderer blocks={item.content} />

          {/* Share row */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center gap-3">
            <span className="font-display text-[11px] uppercase tracking-[0.25em] text-white/45 mr-2">
              {t("news.share")}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/15 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all text-white/80"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-display text-[11px] uppercase tracking-[0.25em]">
                {t("news.shareCta")}
              </span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/15 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all text-white/80"
            >
              {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              <span className="font-display text-[11px] uppercase tracking-[0.25em]">
                {copied ? t("news.copied") : t("news.copyLink")}
              </span>
            </button>
          </div>
        </div>
      </article>

      {/* Gallery */}
      {item.gallery && item.gallery.length > 0 && (
        <section className="relative z-10 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <h3 className="font-display text-2xl sm:text-3xl text-white mb-8 tracking-tight">
              {t("news.galleryTitle")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {item.gallery.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden border border-white/10 group"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="relative z-10 pb-24 pt-4">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
            <h3 className="font-display text-2xl sm:text-3xl text-white mb-8 tracking-tight">
              {t("news.relatedTitle")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {related.map((r, i) => (
                <NewsCard key={r.slug} item={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
