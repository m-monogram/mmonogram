## Цель

Привести весь сайт (публичная часть + админка) к единому стилю на базе уже подключённого шрифта **Riviera Nights** и дизайн-токенов из `src/index.css`. Устранить шрифтовой и стилистический разнобой, проверить и починить визуальные/функциональные дефекты на каждой странице.

## Что нашёл при аудите

1. **Шрифты**
   - В `index.css` основной шрифт — `Riviera Nights`, токены `--font-family-primary` и Tailwind `font-display/font-body/font-sans` уже завязаны на него. ✅
   - В `index.html` остался комментарий про Josefin + загружается только Noto Sans Arabic. ✅ почти ок.
   - Но в админке (`AdminUsers`, `AdminSettings`) и `chart.tsx`, `ProjectTemplate`, `ModificationDetail` используется `font-mono` — выбивается из премиум-стиля.
   - В `index.html` нет preload для критичного `.otf` Riviera Nights → FOIT/FOUT и «прыгающий» шрифт при первой загрузке.

2. **Память проекта vs реальность**
   - Память (`mem://index.md`) утверждает, что используется Josefin Sans. Реальность — Riviera Nights. Память надо обновить, иначе будущие правки снова уведут в Josefin.

3. **Типографика**
   - Глобальные `h1..h4` и `p` стилизованы централизованно — хорошо.
   - Но многие компоненты дублируют `font-display text-Xxl tracking-widest uppercase` вручную. Это работает, но создаёт расхождения в размерах между страницами (privacy/offer/admin/project modal). Унифицируем через утилитарные классы `.h-display-1/2/3` и `.text-eyebrow`.

4. **Цвета и кнопки**
   - В компонентах местами `text-white`, `bg-white/10`, `border-white/20` вместо семантических токенов. По правилам дизайн-системы должно быть `text-foreground`, `bg-foreground/10`, `border-border`. Приведём к токенам, чтобы тема была консистентной.
   - Кнопки: есть и `.btn-primary`/`.btn-outline`, и ad-hoc inline-классы (например в `ProjectModal`, `OfferAgreement`, `PrivacyPolicy`). Сведём CTA-кнопки на `.btn-primary/.btn-outline`.

5. **Страницы — прогон**
   - **Home** — лендинг загружается, но есть лишние коммент-варианты в `AnimatePresence`; OK.
   - **Brand / Projects / Project Detail / Commission / Verify / Contact / Booking** — единый шаблон (Header + ParticleBackground + Suspense). Хорошо. Проверим выравнивание hero, отступов и H1 после унификации типографики.
   - **PrivacyPolicy / OfferAgreement** — длинные текстовые страницы с собственной локальной типографикой и кнопкой Back, которая не использует `.btn-outline`. Унифицируем.
   - **NotFound** — мини-страница, использует общие токены, ок; добавим Header для консистентности.
   - **Admin (Login, Dashboard, Projects, Sections, SectionEditor, Navigation, Media, Settings, Users, Bookings)** — сейчас «технический» вид: `text-white`, `bg-white/5`, `font-mono` для ID. Сделаем более премиум: токены вместо white-литералов, `font-body` вместо `font-mono` (кроме реальных code-блоков, где оставим mono осознанно с правильным fallback стеком).

6. **Работоспособность**
   - Прогоним все маршруты в превью (Home, Brand, Projects, /projects/:id для каждого проекта из `data/projects.ts`, Commission, Verify, Contact, Booking, Privacy, Offer, NotFound, /admin) и проверим консоль/network на ошибки.
   - Проверим формы Contact/Booking, навигацию из меню, переключение языков EN/RU/AR (включая RTL), загрузку изображений и отсутствие 404 на ассетах.
   - Проверим адаптивность на 375px, 768px, 1280px на 3–4 ключевых страницах.

## Что сделаем (правки в коде)

### A. Типографика и шрифт
1. Добавить в `index.html` `<link rel="preload" as="font" type="font/otf" href="/riviera-font-family/RivieraNightsTrial-Light.otf" crossorigin>` (Light + Regular) — устранит FOUT.
2. В `index.css` добавить утилитарные классы:
   - `.h-display-1` (hero), `.h-display-2` (section), `.h-display-3` (card heading) — на базе уже существующих CSS-переменных `--text-hero/--text-section/--text-caption`.
   - `.text-eyebrow` — uppercase + tracking-widest + caption-size, для всех мини-подзаголовков.
3. Заменить в страницах `PrivacyPolicy`, `OfferAgreement`, `NotFound`, `ProjectModal` дублирующиеся «`font-display text-Xxl tracking-widest uppercase`» на новые утилиты.
4. Убрать `font-mono` из админки и не-кодовых мест (`ProjectTemplate`, `ModificationDetail`, `chart.tsx` оставим как есть — это библиотека). Заменить на `font-body` либо `text-eyebrow`.
5. Гарантировать, что нигде нет хардкод `font-['...']` или встроенного `Inter/Poppins/Helvetica` — поиск показал, что нет (попадания только в слова типа «Interior»).

### B. Цвета / токены
1. Пройтись по `src/pages/admin/*` и заменить:
   - `text-white` → `text-foreground`
   - `text-white/40|60|70` → `text-muted-foreground` или `text-foreground/<n>`
   - `bg-white/5|10` → `bg-foreground/5|10`
   - `border-white/10|20|30` → `border-border` / `border-foreground/20`
   - `bg-black/50` → `bg-background/80` или `bg-premium-black/80`
2. То же — точечно в `PrivacyPolicy`, `OfferAgreement`, кнопках Back.
3. Кнопки CTA в `ProjectModal`, `PrivacyPolicy`, `OfferAgreement` свести на `.btn-primary` / `.btn-outline`.

### C. Унификация лейаутов страниц
1. Создать тонкий wrapper-компонент `PageShell` (Header + ParticleBackground + Suspense + общий padding-top для контента под fixed-header), который используют **все** публичные страницы. Это уберёт повторяющийся бойлерплейт в Brand/Projects/Modifications/Verify/Contact/Booking/Privacy/Offer/NotFound и гарантирует одинаковое поведение.
2. `NotFound` обернуть в `PageShell` (сейчас Header отсутствует).
3. `PrivacyPolicy` / `OfferAgreement` — добавить общий контейнер `max-w-3xl mx-auto pt-24 pb-32 px-6` и единый Back-button-стиль.

### D. Админка
1. Единый стиль карточек: `glass-panel` вместо `bg-white/5 border border-white/10`.
2. Заголовки: `.h-display-3` + `.text-eyebrow` для подписей.
3. Таблицы: единый padding/линии через `border-border`.
4. Login: тот же hero-стиль, что и публичный сайт (тёмный фон, тонкая glass-карточка, Riviera Nights).

### E. Память проекта
- Обновить `mem://design/typography-standard-josefin` (заменить на Riviera Nights) и Core-секцию в `mem://index.md`, чтобы будущие сессии не возвращали Josefin.

### F. Проверка (после правок)
1. `tsc`/build уже автоматический — следим за ошибками.
2. Открыть в браузер-инструменте каждый маршрут, снять консоль и сетевые запросы, убедиться что:
   - Нет 404/ошибок.
   - Заголовки рендерятся одним шрифтом (Riviera Nights, в RTL — Noto Sans Arabic).
   - Кнопки и формы кликабельны, навигация по SPA работает.
3. Снять скриншоты Home / Brand / Projects / Commission / Contact / Admin Login на десктопе и 390px и сверить визуальную консистентность.

## Что НЕ трогаем

- Бизнес-логику Supabase, RLS, edge-функции.
- Контент (тексты, картинки, переводы).
- Структуру роутов и компонентную архитектуру (только тонкие правки + новый `PageShell`).
- `chart.tsx` и прочие shadcn-примитивы (только утилитарные правки если необходимы).

## Критерии готовности

- На всех страницах (включая /admin/*) один и тот же шрифт Riviera Nights, без `font-mono`-вкраплений в неподходящих местах.
- Заголовки и eyebrow-подписи имеют одинаковые размеры/трекинг на всех страницах.
- Кнопки CTA — единый стиль (`.btn-primary` / `.btn-outline`).
- Цвета через семантические токены, никаких прямых `text-white`/`bg-white/x` в кастомных компонентах.
- Маршруты открываются без ошибок в консоли, формы работают, мобильная и RTL-вёрстки не ломаются.
- Память проекта обновлена под реальное состояние шрифтов.
