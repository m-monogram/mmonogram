import { useEffect } from "react";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";
import { seoForPath } from "@/lib/seo/catalog";

interface SEOHeadProps {
  /** Запасной заголовок: у адресов из справочника берётся тот, что там. */
  title: string;
  /** Запасное описание: у адресов из справочника берётся то, что там. */
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  updateUrl?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Dynamic SEO meta tags component
 * Updates document title and meta tags for each page
 */
/**
 * Мета-теги страницы.
 *
 * Заголовок, описание и ключи берутся из src/lib/seo/catalog.ts — из того же
 * справочника, по которому плагин сборки печатает статический <head> в
 * dist/<путь>/index.html. Иначе получилось бы два разных описания одной
 * страницы: одно у сборщиков превью, другое у Google после выполнения JS.
 * Пропсы остаются запасным вариантом для страниц, которых в справочнике нет:
 * проектов, заведённых через админку, и подобных.
 */
const SEOHead = ({
  title: fallbackTitle,
  description: fallbackDescription,
  path = "",
  keywords: fallbackKeywords,
  image = DEFAULT_OG_IMAGE,
  updateUrl = true,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: SEOHeadProps) => {
  const fullUrl = `${SITE_URL}${path}`;
  const catalogued = seoForPath(path);
  const title = catalogued?.title ?? fallbackTitle;
  const description = catalogued?.description ?? fallbackDescription;
  const keywords = catalogued?.keywords ?? fallbackKeywords;
  const keywordsLine = keywords?.join(", ");

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update URL without page reload (only if updateUrl is true)
    if (updateUrl && path && window.location.pathname !== path) {
      window.history.replaceState({}, title, path);
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    /* Ключевые слова Google не учитывает, но их читают Яндекс и часть
       агрегаторов, а нам этот тег заодно показывает в исходнике страницы,
       что она заведена в справочнике. */
    if (keywordsLine) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement("meta");
        kw.setAttribute("name", "keywords");
        document.head.appendChild(kw);
      }
      kw.setAttribute("content", keywordsLine);
    }

    updateOGTag("og:site_name", "M Monogram");
    updateOGTag("og:image:alt", title);
    updateOGTag("og:title", title);
    updateOGTag("og:description", description);
    updateOGTag("og:url", fullUrl);
    updateOGTag("og:image", image);
    updateOGTag("og:type", type);
    if (type === "article") {
      if (publishedTime) updateOGTag("article:published_time", publishedTime);
      if (modifiedTime) updateOGTag("article:modified_time", modifiedTime);
      if (author) updateOGTag("article:author", author);
    }

    // Update Twitter tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    updateTwitterTag("twitter:title", title);
    updateTwitterTag("twitter:description", description);
    updateTwitterTag("twitter:image", image);
    updateTwitterTag("twitter:card", "summary_large_image");

    // JSON-LD structured data
    const ldId = "seo-jsonld";
    const existing = document.getElementById(ldId);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = ldId;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.getElementById(ldId);
      if (ld) ld.remove();
    };
  }, [title, description, keywordsLine, fullUrl, image, path, updateUrl, type, publishedTime, modifiedTime, author, jsonLd]);

  return null;
};

export default SEOHead;
