#!/usr/bin/env node
/**
 * Проверка SEO по собранному сайту.
 *
 * Проверяет не намерение, а результат: читает готовые файлы из dist/ — те
 * самые, что уедут на боевой домен, — и разбирает их <head>. Если правило
 * нарушено, скрипт выходит с ненулевым кодом, и сборка в CI падает.
 *
 * Запуск: npm run build && npm run seo:check
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const OFF = "\x1b[0m";

/* Пороги. Google обрезает заголовок примерно на 60 знаках, описание — около
   160. Слишком короткое описание поисковик заменяет своим куском текста со
   страницы, и контроль над сниппетом теряется. */
const TITLE_MIN = 30;
const TITLE_MAX = 62;
const DESC_MIN = 70;
const DESC_MAX = 160;

const errors = [];
const warnings = [];
const fail = (page, message) => errors.push(`${page}: ${message}`);
const warn = (page, message) => warnings.push(`${page}: ${message}`);

if (!existsSync(join(DIST, "seo-manifest.json"))) {
  console.error(`${RED}dist/seo-manifest.json не найден. Сначала npm run build.${OFF}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(DIST, "seo-manifest.json"), "utf8"));

const pick = (html, re) => html.match(re)?.[1]?.trim() ?? null;
const tag = (html, name) =>
  pick(html, new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, "i"));
const og = (html, prop) =>
  pick(html, new RegExp(`<meta\\s+property="og:${prop}"\\s+content="([^"]*)"`, "i"));

/* Декодируем то, что плагин экранировал, иначе &amp; считается за пять знаков. */
const decode = (s) =>
  s === null
    ? null
    : s
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<")
        .replace(/&amp;/g, "&");

const seenTitles = new Map();
const seenDescriptions = new Map();

for (const entry of manifest) {
  const { path, file } = entry;

  if (!existsSync(file)) {
    fail(path, `файл ${file} не собран`);
    continue;
  }

  const html = readFileSync(file, "utf8");
  const title = decode(pick(html, /<title>([\s\S]*?)<\/title>/i));
  const description = decode(tag(html, "description"));
  const canonical = pick(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const robots = tag(html, "robots");
  const keywords = decode(tag(html, "keywords"));

  /* Кодировка обязана стоять раньше заголовка. */
  const charsetAt = html.search(/<meta\s+charset=/i);
  const titleAt = html.search(/<title>/i);
  if (charsetAt === -1) fail(path, "нет <meta charset>");
  else if (titleAt !== -1 && charsetAt > titleAt) fail(path, "<meta charset> стоит после <title>");
  else if (charsetAt > 1024) fail(path, "<meta charset> за пределами первого килобайта");

  /* Заголовок. */
  if (!title) fail(path, "нет <title>");
  else {
    if (title.length < TITLE_MIN) fail(path, `title ${title.length} знаков, минимум ${TITLE_MIN}`);
    if (title.length > TITLE_MAX) fail(path, `title ${title.length} знаков, максимум ${TITLE_MAX}`);
    const twin = seenTitles.get(title);
    if (twin) fail(path, `title дословно повторяет ${twin}`);
    else seenTitles.set(title, path);
  }

  /* Описание. */
  if (!description) fail(path, "нет meta description");
  else {
    if (description.length < DESC_MIN)
      fail(path, `description ${description.length} знаков, минимум ${DESC_MIN}`);
    if (description.length > DESC_MAX)
      fail(path, `description ${description.length} знаков, максимум ${DESC_MAX}`);
    const twin = seenDescriptions.get(description);
    if (twin) fail(path, `description дословно повторяет ${twin}`);
    else seenDescriptions.set(description, path);
  }

  /* Канонический адрес. */
  const expected = path === "/" ? "/" : path;
  if (!canonical) fail(path, "нет canonical");
  else if (!canonical.endsWith(expected)) fail(path, `canonical ведёт на ${canonical}`);
  else if (!canonical.startsWith("https://")) fail(path, "canonical не по https");

  /* Дублей быть не должно: если в шаблоне остались свои теги — значит, чистка
     сломалась и поисковик увидит два разных заголовка. */
  const count = (re) => (html.match(re) ?? []).length;
  if (count(/<title>/gi) > 1) fail(path, "два <title>");
  if (count(/<meta\s+name="description"/gi) > 1) fail(path, "два meta description");
  if (count(/<link\s+rel="canonical"/gi) > 1) fail(path, "два canonical");
  if (count(/<meta\s+property="og:title"/gi) > 1) fail(path, "два og:title");

  /* Соцсети. */
  for (const prop of ["title", "description", "url", "image", "site_name"]) {
    if (!og(html, prop)) fail(path, `нет og:${prop}`);
  }
  const ogImage = og(html, "image");
  if (ogImage && !/^https:\/\//.test(ogImage)) fail(path, "og:image не абсолютный https-адрес");
  if (decode(og(html, "title")) !== title) fail(path, "og:title расходится с <title>");
  if (decode(og(html, "description")) !== description)
    fail(path, "og:description расходится с description");

  if (!robots) fail(path, "нет meta robots");

  /* Ключевые слова: сам тег Google давно не учитывает, но пустой список
     означает, что страницу забыли завести в справочнике. */
  if (!keywords) warn(path, "пустые keywords");

  /* Разметка. */
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (ld.length === 0) warn(path, "нет разметки JSON-LD");
  for (const [, body] of ld) {
    try {
      JSON.parse(body);
    } catch {
      fail(path, "JSON-LD не разбирается");
    }
  }
}

/* ---- Карта сайта против пререндера ---- */
const sitemapPath = join(DIST, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  errors.push("sitemap.xml: не собран");
} else {
  const xml = readFileSync(sitemapPath, "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, "")
  );
  const prerendered = new Set(manifest.map((m) => m.path));
  for (const loc of locs) {
    const p = loc === "" ? "/" : loc;
    if (!prerendered.has(p)) errors.push(`sitemap.xml: ${p} есть в карте, но не собран`);
  }
  for (const p of prerendered) {
    if (!locs.includes(p === "/" ? "/" : p)) errors.push(`sitemap.xml: ${p} собран, но не в карте`);
  }
}

/* ---- Расхождение справочника с данными сайта ---- */
const ids = (file, re) => {
  if (!existsSync(file)) return [];
  return [...readFileSync(file, "utf8").matchAll(re)].map((m) => m[1]);
};

const checkDrift = (label, found, prefix) => {
  const prerendered = new Set(
    manifest
      .map((m) => m.path)
      .filter((p) => p.startsWith(prefix))
      .map((p) => p.slice(prefix.length))
  );
  for (const id of found) {
    if (!prerendered.has(id))
      errors.push(`${label}: «${id}» есть в данных, но нет в src/lib/seo/catalog.ts`);
  }
  for (const id of prerendered) {
    if (!found.includes(id))
      warnings.push(`${label}: «${id}» есть в каталоге SEO, но нет в данных сайта`);
  }
};

checkDrift("projects", ids("src/data/projects.ts", /^\s{4}id:\s*"([a-z0-9-]+)"/gm), "/projects/");
checkDrift("press", ids("src/data/news.ts", /^\s{4}slug:\s*"([a-z0-9-]+)"/gm), "/press/");
checkDrift(
  "representatives",
  ids("src/data/representatives.ts", /^\s{4}id:\s*"([a-z0-9-]+)"/gm),
  "/representatives/"
);

/* ---- robots.txt ---- */
const robotsPath = join(DIST, "robots.txt");
if (!existsSync(robotsPath)) errors.push("robots.txt: не собран");
else {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/^Sitemap:\s*https:\/\/\S+sitemap\.xml/m.test(robots))
    errors.push("robots.txt: нет строки Sitemap с абсолютным адресом");
  if (!/Disallow:\s*\/admin/.test(robots)) errors.push("robots.txt: админка открыта для обхода");
}

/* ---- Отчёт ---- */
console.log(`\n${DIM}Проверено страниц: ${manifest.length}${OFF}`);

if (warnings.length) {
  console.log(`\n${YELLOW}Предупреждения (${warnings.length}):${OFF}`);
  for (const w of warnings) console.log(`  ${YELLOW}•${OFF} ${w}`);
}

if (errors.length) {
  console.log(`\n${RED}Ошибки (${errors.length}):${OFF}`);
  for (const e of errors) console.log(`  ${RED}x${OFF} ${e}`);
  console.log("");
  process.exit(1);
}

console.log(`\n${GREEN}OK — длины, уникальность, canonical, Open Graph и карта сайта в порядке.${OFF}\n`);
