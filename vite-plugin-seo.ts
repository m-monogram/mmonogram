import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";
import { allPages, type PageSeo } from "./src/lib/seo/catalog.ts";

/**
 * Раскладывает <head> по страницам и собирает карту сайта.
 *
 * Зачем. Сайт — одностраничное приложение: сервер на любой адрес отдаёт один
 * и тот же index.html, а заголовок и описание подставляет уже JavaScript.
 * Google скрипты выполняет и всё увидит, но сборщики превью в Telegram,
 * WhatsApp, Facebook, X и LinkedIn — нет. Для них каждая страница сайта
 * называлась «Atelier M Monogram» с одним и тем же описанием: ссылка на
 * конкретный проект в переписке выглядела как ссылка на главную.
 *
 * Что делает. После сборки кладёт рядом с dist/index.html по файлу на каждый
 * адрес — dist/projects/g3-iconic/index.html и так далее — с уже проставленным
 * title, description, canonical и Open Graph. Vercel сначала ищет файл на
 * диске и только потом применяет rewrite на index.html, поэтому такие файлы
 * отдаются как есть. Приложение поверх них стартует как обычно.
 *
 * Карта сайта пишется в public/sitemap.xml до копирования public в dist:
 * файл остаётся в репозитории, и любое расхождение видно в git diff.
 */

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SITE_NAME = "M Monogram";

/**
 * Точка вставки — сразу за <meta name="viewport">. Объявление кодировки и
 * viewport обязаны стоять в начале <head>: браузер разбирает первые байты
 * документа до того, как дойдёт до заголовка, и title с длинным тире,
 * прочитанный не в UTF-8, превращается в мусор.
 */
const ANCHOR = /<meta\s+name="viewport"[^>]*>/i;

function headFor(path: string, seo: PageSeo, siteUrl: string, ogImage: string): string {
  const url = `${siteUrl}${path === "/" ? "/" : path}`;
  const t = escapeAttr(seo.title);
  const d = escapeAttr(seo.description);

  /* Хлебные крошки: единственная разметка, которую есть смысл печатать в
     статический файл. Product и Article страницы отдают сами — их данные
     живут в базе и в сборке недоступны. */
  const SECTION_NAMES: Record<string, string> = {
    projects: "Projects",
    press: "Press",
    representatives: "Representatives",
  };
  /* Последняя крошка — название страницы без хвоста «| M Monogram»:
     в выдаче она показывается как есть, и «g3 iconic gold» там ни к чему. */
  const leaf = seo.title.split(/\s+[|—]\s+/)[0];
  const segments = path.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    "@type": "ListItem",
    position: index + 2,
    name: index === segments.length - 1 ? leaf : SECTION_NAMES[segment] ?? segment,
    item: `${siteUrl}/${segments.slice(0, index + 1).join("/")}`,
  }));

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        ...crumbs,
      ],
    },
  ];

  if (path === "/") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${siteUrl}/`,
    });
  }

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="keywords" content="${escapeAttr(seo.keywords.join(", "))}" />`,
    `<meta name="robots" content="${seo.noindex ? "noindex, follow" : "index, follow"}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
    `<meta property="og:image:alt" content="${t}" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join("\n    ");
}

/**
 * Вырезает из шаблона теги, которые страница переопределяет, чтобы в готовом
 * файле не осталось двух разных title или двух og:description.
 */
function stripDefaults(html: string): string {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="keywords"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:(title|description|url|site_name|image:alt)"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="twitter:(title|description)"[^>]*>/gi, "");
}

export default function seoPlugin(): Plugin {
  let outDir = "dist";
  let siteUrl = "https://mmonogram.com";
  let ogImage = "";

  return {
    name: "mmonogram-seo",
    apply: "build",

    configResolved(config) {
      outDir = config.build.outDir;
      const configured = (config.env.VITE_SITE_URL as string | undefined)?.trim();
      if (configured) siteUrl = configured.replace(/\/+$/, "");
      /* Картинка для соцсетей берётся из самого шаблона: держать её адрес
         в двух местах — верный способ развести их со временем. */
      const template = readFileSync("index.html", "utf8");
      ogImage = template.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] ?? "";
    },

    /* Карта сайта пишется до того, как Vite скопирует public в dist. */
    buildStart() {
      /* Без <lastmod>. Настоящей даты правки страницы у нас нет, а дата сборки
         означала бы «изменено сегодня» для всех страниц сразу: поисковик такой
         сигнал быстро перестаёт учитывать. Заодно карта перестаёт меняться на
         каждой сборке, и расхождение с репозиторием ловится проверкой в CI. */
      const urls = allPages()
        .map(({ path, seo }) => {
          const loc = `${siteUrl}${path === "/" ? "/" : path}`;
          return (
            `  <url><loc>${loc}</loc>` +
            `<changefreq>${seo.changefreq ?? "monthly"}</changefreq>` +
            `<priority>${(seo.priority ?? 0.5).toFixed(1)}</priority></url>`
          );
        })
        .join("\n");

      /* robots.txt пишется здесь же: раньше его собирал отдельный скрипт
         scripts/generate-sitemap.mjs, и адрес сайта задавался в двух местах
         разными способами. Теперь домен читается один раз из конфига Vite. */
      writeFileSync(
        "public/robots.txt",
        [
          "User-agent: *",
          "Allow: /",
          "",
          "# Админка сайта в индекс не идёт",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /api/",
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n")
      );

      writeFileSync(
        "public/sitemap.xml",
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<!-- Собирается автоматически из src/lib/seo/catalog.ts. Руками не править. -->\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      );
    },

    closeBundle() {
      const indexPath = join(outDir, "index.html");
      const template = stripDefaults(readFileSync(indexPath, "utf8"));
      const manifest: Array<{ path: string; file: string; title: string; description: string }> = [];

      for (const { path, seo } of allPages()) {
        const html = template.replace(
          ANCHOR,
          (match) => `${match}\n    ${headFor(path, seo, siteUrl, ogImage)}`
        );
        const file = path === "/" ? indexPath : join(outDir, path.slice(1), "index.html");
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
        manifest.push({ path, file, title: seo.title, description: seo.description });
      }

      writeFileSync(join(outDir, "seo-manifest.json"), JSON.stringify(manifest, null, 2));
      console.log(`[seo] пререндер: ${manifest.length} страниц, карта сайта обновлена`);
    },
  };
}
