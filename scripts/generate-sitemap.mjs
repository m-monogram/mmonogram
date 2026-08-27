/**
 * Сборка public/sitemap.xml из реальных данных сайта.
 *
 * Раньше файл правился руками и разошёлся с проектом: в нём было 13 адресов
 * представительств, из которых существуют три (остальные отдавали страницу
 * «не найдено» с кодом 200 — для поисковика это мягкий 404), два проекта из
 * одиннадцати, и не было /configurator — главной страницы 3D-студии.
 *
 * Запускается автоматически перед сборкой (npm run build).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Домен берём оттуда же, откуда его берёт сборка. Голый Node не читает .env,
 * и без этого правка VITE_SITE_URL в .env меняла бы адреса в бандле, но не в
 * sitemap.xml — то самое расхождение доменов, из-за которого страницы
 * объявляли каноническим чужой адрес.
 */
function siteUrlFromEnvFile() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env"), "utf8");
    const match = raw.match(/^\s*VITE_SITE_URL\s*=\s*"?([^"\n\r]+)"?/m);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const SITE_URL = (process.env.VITE_SITE_URL || siteUrlFromEnvFile() || "https://mmonogram.com").replace(
  /\/+$/,
  "",
);

/** Достаёт значения строкового поля верхнего уровня из data-файла. */
function extractField(file, field) {
  const source = readFileSync(resolve(ROOT, file), "utf8");
  const values = [...source.matchAll(new RegExp(`^\\s{2,4}${field}:\\s*"([^"]+)"`, "gm"))].map((m) => m[1]);
  if (!values.length) {
    throw new Error(`generate-sitemap: не найдено ни одного «${field}» в ${file} — формат данных изменился`);
  }
  return [...new Set(values)];
}

const projectIds = extractField("src/data/projects.ts", "id");
const newsSlugs = extractField("src/data/news.ts", "slug");
const representativeIds = extractField("src/data/representatives.ts", "id");

/** Статические маршруты — держим в порядке важности, как в App.tsx. */
const STATIC = [
  ["/", "weekly", "1.0"],
  ["/brand", "monthly", "0.9"],
  ["/projects", "weekly", "0.9"],
  ["/configurator", "monthly", "0.9"],
  ["/commission", "monthly", "0.8"],
  ["/modifications", "monthly", "0.7"],
  ["/verify", "monthly", "0.7"],
  ["/contact", "monthly", "0.8"],
  ["/booking", "monthly", "0.7"],
  ["/press", "weekly", "0.7"],
  ["/privacy-policy", "yearly", "0.3"],
  ["/offer-agreement", "yearly", "0.3"],
];

const urls = [
  ...STATIC,
  ...projectIds.map((id) => [`/projects/${id}`, "monthly", "0.8"]),
  ...newsSlugs.map((slug) => [`/press/${slug}`, "monthly", "0.6"]),
  ...representativeIds.map((id) => [`/representatives/${id}`, "monthly", "0.5"]),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    ([path, changefreq, priority]) =>
      `  <url><loc>${SITE_URL}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml);

const robots = [
  "User-agent: *",
  "Allow: /",
  "",
  "# Админка сайта в индекс не идёт",
  "Disallow: /admin",
  "Disallow: /admin/",
  "Disallow: /api/",
  "",
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  "",
].join("\n");
writeFileSync(resolve(ROOT, "public/robots.txt"), robots);

console.log(
  `sitemap.xml: ${urls.length} адресов (${projectIds.length} проектов, ${newsSlugs.length} новостей, ${representativeIds.length} представительств) на ${SITE_URL}`,
);
