## News & Events — новый раздел сайта

Создаём отдельный раздел "News & Events" с листингом всех новостей/событий и индивидуальной страницей для каждой записи. Всё в едином стиле: pure black, glassmorphism, Riviera Nights typography, EN/RU/AR.

---

### 1. Где будет видно на главной

Добавим **заметную точку входа** в двух местах:

1. **Header / Navigation menu (2x2 grid)** — добавляем 7-ю карточку "News & Events" с собственной обложкой (подберу `menu-news.webp` из существующих ассетов или временно используем подходящее фото). Меню расширится до 3-колоночной сетки на десктопе либо новая карточка станет `isWide` снизу — выберу вариант, который лучше ляжет.
2. **HomePage** — новая секция **`NewsHighlightSection`** между `StatsSection` и `RepresentativesMapSection`. Тёмная секция с eyebrow "Latest News", крупным заголовком, 3 последними карточками новостей (image + дата + заголовок) и кнопкой-ссылкой "All News & Events →". Карточки в той же эстетике, что `LatestAdditionsCarousel` (glassmorphism, единая типографика, hover-glow).

---

### 2. Структура страниц

**`/news`** — листинг:
- Hero: фоновое фото + eyebrow "Journal", h-display заголовок "News & Events", подзаголовок "Check out the newest updates and information about events".
- Сетка карточек (2 кол. на десктопе, 1 на мобиле): обложка, дата, категория-чип (News / Event / Press), заголовок, короткий excerpt, "Read more →".
- Опциональный фильтр по категории (chip-row сверху сетки).
- Footer + NextSectionCTA на Contact.

**`/news/:slug`** — страница новости:
- Hero-баннер с обложкой (ratio 21/9), overlay с категорией, датой, заголовком, автором (опц.).
- Контентная колонка max-w-3xl: rich text (параграфы, подзаголовки, цитаты, картинки внутри) — рендерим из `content_blocks` (массив блоков с типами `paragraph | heading | image | quote`).
- Галерея фото внизу (опц.) — переиспользуем `ProjectGallery` стиль с lightbox.
- "Related news" — 2-3 карточки других записей.
- Sticky share-row: copy link, WhatsApp, Telegram (как в `RepresentativeDetailPage`).
- Back-link "← All News & Events".

---

### 3. Данные

Сейчас новостей ещё нет — стартуем с чистого листа. План:

- **Файл `src/data/news.ts`** с TypeScript-моделью `NewsItem` и сидовым массивом из 3 примерных записей (mix EN/RU/AR контента в multilingual-объектах). Это даст рабочий MVP без БД.
- Модель:
  ```ts
  type NewsCategory = 'news' | 'event' | 'press';
  type LocalizedString = { en: string; ru: string; ar: string };
  type ContentBlock =
    | { type: 'paragraph'; text: LocalizedString }
    | { type: 'heading'; text: LocalizedString }
    | { type: 'image'; src: string; alt?: LocalizedString }
    | { type: 'quote'; text: LocalizedString; author?: string };
  interface NewsItem {
    slug: string;
    category: NewsCategory;
    publishedAt: string;          // ISO
    cover: string;
    gallery?: string[];
    title: LocalizedString;
    excerpt: LocalizedString;
    content: ContentBlock[];
    author?: string;
    eventDate?: string;           // для events
    location?: string;
  }
  ```
- Хелперы: `getAllNews()`, `getNewsBySlug(slug)`, `getRelatedNews(slug, n)`.

> CMS-интеграция (Supabase-таблица `news`) — это следующий шаг, уже под админ-дашборд. На этой итерации не делаем, чтобы не раздувать диф; модель сделана так, чтобы потом легко перенести в БД.

---

### 4. Translations (EN/RU/AR)

Добавим namespace `news` в `src/data/translations.ts`:
- `nav.news`, `nav.newsDesc`
- `news.eyebrow`, `news.title`, `news.subtitle`, `news.allNews`, `news.readMore`, `news.backToNews`, `news.relatedTitle`, `news.share`, `news.copyLink`, `news.copied`, `news.publishedOn`, `news.category.news/event/press`, `news.eventDate`, `news.eventLocation`, `news.empty`
- `homeNews.eyebrow`, `homeNews.title`, `homeNews.cta`

---

### 5. Routing

В `src/App.tsx`:
```tsx
<Route path="/news" element={<NewsPage />} />
<Route path="/news/:slug" element={<NewsDetailPage />} />
```

В `useNavigation` — добавить маппинг `"news" → "/news"`.

---

### 6. Файлы

**Новые:**
- `src/data/news.ts`
- `src/pages/NewsPage.tsx`
- `src/pages/NewsDetailPage.tsx`
- `src/components/sections/NewsHighlightSection.tsx`
- `src/components/news/NewsCard.tsx`
- `src/components/news/NewsContentRenderer.tsx`

**Изменяемые:**
- `src/App.tsx` — 2 новых route + lazy import
- `src/components/Header.tsx` — добавить карточку News в menu-grid + импорт обложки
- `src/pages/HomePage.tsx` — вставить `<NewsHighlightSection />`
- `src/components/Footer.tsx` — линк "News & Events" в навигации футера
- `src/data/translations.ts` — новый namespace во всех 3 языках
- `src/hooks/useNavigation.ts` — маппинг "news"

---

### 7. Стилистика

- Pure black background (`bg-premium-black`), glassmorphism cards (`bg-slate-900/30 backdrop-blur-xl border-white/10` + inner glow).
- Riviera Nights через `.h-display-1/2/3`, `.text-eyebrow`.
- Hover: subtle scale + glow, как у проектных карточек.
- Изображения через `ResponsiveImage` (WebP, lazy, LCP priority для hero).
- Mobile-first, snap-scroll где уместно.
- Полная RTL-совместимость для AR.

---

### Что НЕ входит в этот план

- Supabase CMS-таблица `news` и админка (отдельной задачей).
- Загрузка обложек через storage (пока — статические импорты из `src/assets`).
- Email-подписка / RSS.

После approve соберу всё, добавлю 3 демо-новости (1 news, 1 event, 1 press) с осмысленным контентом на 3 языках и проверю что переключение EN/RU/AR работает на обеих страницах.