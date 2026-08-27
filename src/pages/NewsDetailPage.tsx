import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Share2, Link as LinkIcon, Check, Clock, ChevronRight } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NewsContentRenderer from "@/components/news/NewsContentRenderer";
import NewsCard from "@/components/news/NewsCard";
import { getNewsBySlug, getRelatedNews } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";
import { SITE_URL } from "@/lib/site";

const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });

  const item = useMemo(() => (slug ? getNewsBySlug(slug) : undefined), [slug]);
  const related = useMemo(() => (slug ? getRelatedNews(slug, 2) : []), [slug]);

  // Compute approximate reading time from paragraph blocks (200 wpm)
  const readingMinutes = useMemo(() => {
    if (!item) return 0;
    const words = item.content
      .filter((b) => b.type === "paragraph" || b.type === "heading" || b.type === "quote")
      .map((b: any) => (b.text?.[language] || b.text?.en || "") as string)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [item, language]);

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
            to="/press"
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

  // SEO: Article + BreadcrumbList structured data
  const articleUrl = `${SITE_URL}/press/${item.slug}`;
  const coverAbs = item.cover.startsWith("http") ? item.cover : `${SITE_URL}${item.cover}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": item.category === "event" ? "NewsArticle" : "Article",
      headline: title,
      description: excerpt,
      image: [coverAbs],
      datePublished: item.publishedAt,
      dateModified: item.publishedAt,
      author: {
        "@type": "Organization",
        name: item.author || "M-Monogram Atelier",
      },
      publisher: {
        "@type": "Organization",
        name: "M-Monogram",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og-image.jpg`,
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
      inLanguage: language,
      articleSection: categoryLabel,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: t("news.title"), item: `${SITE_URL}/press` },
        { "@type": "ListItem", position: 3, name: title, item: articleUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-premium-black">
      <SEOHead
        title={`${title} — M-Monogram`}
        description={excerpt}
        path={`/press/${item.slug}`}
        image={coverAbs}
        type="article"
        publishedTime={item.publishedAt}
        modifiedTime={item.publishedAt}
        author={item.author}
        jsonLd={jsonLd}
      />
      <Header />

      {/* Reading progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-white origin-left z-[60]"
      />

      {/* Hero — editorial cinematic */}
      <article>
        <header>
          <section className="relative w-full overflow-hidden bg-black">
            <img
              src={item.cover}
              alt={title}
              fetchpriority="high"
              decoding="async"
              className="block w-full h-auto"
            />
            {/* Soft top for header + bottom fade into title block (as before MediaEdgeFade) */}
            <div className="absolute inset-x-0 top-0 h-24 sm:h-28 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-premium-black via-premium-black/65 to-transparent pointer-events-none" />
          </section>

          {/* Editorial title block — sits BELOW the image, no overlap */}
          <div className="relative z-10 -mt-16 sm:-mt-20 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto pb-2">
            <motion.nav
              aria-label="Breadcrumb"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.25em] text-white/55"
            >
              <Link to="/" className="hover:text-white transition-colors">
                {t("news.backToHome")}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/press" className="hover:text-white transition-colors">
                {t("news.title")}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/75 truncate max-w-[40vw]">{categoryLabel}</span>
            </motion.nav>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
              <span className="px-2.5 py-1 bg-white text-black font-display text-[10px] uppercase tracking-[0.25em]">
                {categoryLabel}
              </span>
              <span className="font-display text-[11px] uppercase tracking-[0.25em] text-white/70">
                {formattedDate}
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="inline-flex items-center gap-1.5 font-display text-[11px] uppercase tracking-[0.25em] text-white/70">
                <Clock className="w-3 h-3" />
                {readingMinutes} {t("news.minRead")}
              </span>
              {item.author && (
                <>
                  <span className="w-px h-3 bg-white/20" />
                  <span className="font-display text-[11px] uppercase tracking-[0.25em] text-white/70">
                    {item.author}
                  </span>
                </>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-white tracking-tight leading-[1.06] max-w-4xl break-words"
              style={{ fontSize: "clamp(1.75rem, 4.4vw, 3.75rem)", hyphens: "auto" }}
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-4 sm:mt-5 max-w-2xl font-body text-sm sm:text-base text-white/65 leading-relaxed"
            >
              {excerpt}
            </motion.p>
          </div>
        </header>


        {/* Body */}
        <section className="relative z-10 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-8">
            {/* Event meta */}
            {(formattedEventDate || item.location) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14 p-6 bg-slate-900/30 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
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

            <NewsContentRenderer blocks={item.content} />

            {/* Share row */}
            <div className="mt-20 pt-8 border-t border-white/10 flex flex-wrap items-center gap-3">
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
        </section>
      </article>

      {/* Gallery removed — all images already inline in article */}

      {/* Related */}
      {related.length > 0 && (
        <section className="relative z-10 pb-28 pt-4 border-t border-white/10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pt-16">
            <p className="font-display text-[11px] uppercase tracking-[0.35em] text-white/45 mb-3">
              {t("news.relatedEyebrow") || "Continue reading"}
            </p>
            <h3 className="font-display text-2xl sm:text-4xl text-white mb-10 tracking-tight">
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
