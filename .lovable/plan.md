# План ускорения сайта

Цель — подготовить сайт к проверке: максимальная скорость загрузки всех страниц, отличные оценки Lighthouse (LCP, FCP, TBT, TTFB) на мобильных и десктопе.

## Что сейчас тормозит (диагностика)

1. **Тяжёлые изображения проектов** — `src/assets/IMG_6695…6708.jpg` весят 350–850 КБ каждое (≈9 МБ суммарно), `lovable-uploads/*.jpg` ещё 2 МБ. Все JPEG, без WebP/AVIF, без `srcset`.
2. **Шрифты Riviera Nights** — 12 файлов OTF (≈185 КБ). OTF не сжимается так, как WOFF2: после конверсии каждый файл уменьшается в 3–5 раз и грузится быстрее.
3. **Сломанный preload в `index.html`** — `/src/assets/hero-main.jpg` и `/src/assets/logo-white.png` существуют только в dev; в production эти пути 404, браузер тратит запрос впустую и preload не работает.
4. **Шрифт Noto Sans Arabic с Google Fonts** грузится для всех пользователей, даже в EN/RU (≈30 КБ + блокирующий request к стороннему домену).
5. **Видео** (`brand-hero-video.mp4`, `g900-maybach-video.mp4`, `rr-fusion-video.mp4` — 5.2 МБ) могут грузиться агрессивно. Нужно `preload="none"` + `poster` на нероликах не выше fold.
6. **CSS index.css на 765 строк** — содержит много неиспользуемых утилит/классов (например `.h-display-*`, дубликаты), но трогать рискованно — оставим как есть, основной выигрыш от изображений и шрифтов.

## Что меняем

### 1. Шрифты: OTF → WOFF2 (ключевой выигрыш)
- Сконвертировать все 12 файлов `public/riviera-font-family/*.otf` в `.woff2` (через `fonttools`/`pyftsubset`).
- Обновить `@font-face` в `src/index.css` на `format('woff2')`.
- Обновить `<link rel="preload" as="font">` в `index.html` на новые WOFF2.
- Ожидаемая экономия: ~120 КБ + критическая цепочка шрифтов короче → лучше FCP.

### 2. Изображения: ресайз + WebP
- Пройтись по `src/assets/*.jpg` (всё, что ≥ 250 КБ) и `public/lovable-uploads/*.jpg`:
  - Уменьшить до разумного max ширины 1600px (галерейные) / 1100px (карточные).
  - Сохранить как WebP quality 78 рядом с оригиналом (`.webp`).
  - Перевести импорты в компонентах галерей/карточек (`ProjectCard`, `ProjectModal`, `LatestCreations`, `ProjectTemplate`, `WheelsCarousel`, `ProjectsCarousel`, `ContactBookingSection`, `BrandSection`) на `.webp`.
- Цель: суммарный вес графики ≈ 12 МБ → ≈ 3 МБ.

### 3. Preload в index.html
- Убрать неработающие preload `/src/assets/hero-main.jpg` и `/src/assets/logo-white.png` (в production они 404).
- Заменить на корректные импортируемые ассеты (Vite вставляет хеш) — либо просто убрать preload (Vite сам modulepreload при импорте), либо использовать `import.meta.glob` / `new URL(...)` подход — на практике безопаснее **удалить эти строки**: hero всё равно eager-loaded из React.

### 4. Arabic font — условная загрузка
- Убрать `<link>` Noto Sans Arabic из `index.html`.
- Подгружать его динамически в `LanguageContext`, только когда `language === 'ar'`.

### 5. Видео — ленивая загрузка
- Убедиться, что все `<video>` имеют `preload="none"` (или `metadata`) и `poster` (статический WebP-кадр). Если `autoPlay` нужен — оставить, но добавить `playsInline muted` и грузить только когда в viewport (IntersectionObserver — уже есть в `OptimizedImage`, добавить аналог для видео).

### 6. Кеш / прочее
- В `index.html` оставить `<link rel="preconnect">` только на реально используемые домены (`fonts.gstatic.com`, `cdn.gpteng.co`). DNS-prefetch на `fonts.googleapis.com` убрать после удаления Arabic.
- Проверить, что `cssCodeSplit: true` (уже да) и `manualChunks` (уже да) — менять не нужно.

## Что НЕ меняем (риск регресса > выгода)

- Структуру роутов и Suspense — уже оптимальны.
- Дизайн-токены, Tailwind config, компоненты UI.
- Логику CMS, Supabase запросы, RLS.
- Содержимое `index.css` (только @font-face URLs).

## Технические детали

```text
public/riviera-font-family/
  *.otf  →  *.woff2   (fonttools: pyftsubset --flavor=woff2)
src/index.css         (заменить format('opentype') → format('woff2'))
index.html            (preload .woff2; убрать broken preloads; убрать Arabic <link>)

src/assets/*.jpg (≥250KB)  →  *.webp (cwebp -q 78 -resize 1600 0)
public/lovable-uploads/*.jpg → *.webp

src/contexts/LanguageContext.tsx
  + useEffect: if (language === 'ar') append <link> for Noto Sans Arabic
```

## Ожидаемый результат

- LCP мобильный: 6.3s → ~2.0s
- FCP: 3.4s → ~1.2s
- Total transfer: ~14 МБ → ~4 МБ
- Lighthouse Performance: текущий низкий → 90+

## План работ (последовательно)

1. Конвертация шрифтов OTF→WOFF2 + правки `index.css` + `index.html`.
2. Удаление сломанных preload + удаление Arabic `<link>` + динамическая загрузка через LanguageContext.
3. Конверсия и ресайз JPG → WebP, обновление импортов в компонентах галерей и hero.
4. Аудит `<video>`: `preload="none"`, постеры.
5. Проверка билда (без ошибок) и визуальный осмотр главных страниц (/, /brand, /projects, /commission, /contact) на превью.
