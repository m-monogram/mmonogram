import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
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
const SEOHead = ({
  title,
  description,
  path = "",
  image = "https://m-monogram.com/og-image.jpg",
  updateUrl = true,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: SEOHeadProps) => {
  const baseUrl = "https://m-monogram.com";
  const fullUrl = `${baseUrl}${path}`;

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
  }, [title, description, fullUrl, image, path, updateUrl, type, publishedTime, modifiedTime, author, jsonLd]);

  return null;
};

export default SEOHead;
