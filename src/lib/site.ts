/**
 * Канонический адрес сайта — одна точка правды на весь проект.
 *
 * До этого адрес был записан в трёх местах и в двух разных доменах: SEOHead
 * ставил canonical и og:url на https://m-monogram.com, а sitemap.xml, robots.txt
 * и JSON-LD в index.html — на https://mmonogram.lovable.app. Для поисковика это
 * значит, что каждая страница объявляет каноническим адрес на чужом домене:
 * такие страницы выпадают из индекса.
 *
 * Домен задаётся переменной VITE_SITE_URL при сборке. Значение по умолчанию
 * совпадает с тем, что уже стоит в robots.txt и sitemap.xml.
 */
const FALLBACK_SITE_URL = "https://mmonogram.lovable.app";

const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();

/** Без завершающего слэша — к нему всегда дописывается путь вида «/brand». */
export const SITE_URL = (configured || FALLBACK_SITE_URL).replace(/\/+$/, "");

/** Абсолютный адрес страницы для canonical, og:url и JSON-LD. */
export const absoluteUrl = (path = "") =>
  `${SITE_URL}${path.startsWith("/") || path === "" ? path : `/${path}`}`;

/** Картинка для соцсетей по умолчанию. */
export const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/rON2sifFdOPj6dNcaUedns1Qm4B3/social-images/social-1777869174064-621981160_17923957764218553_4082795296417953891_n.webp";
