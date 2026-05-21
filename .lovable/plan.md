# Единый шрифт на всём сайте — Riviera Nights

## Что я проверил

Прошёлся по всем стилям и компонентам:

- `src/index.css` — единственный загруженный шрифт это **Riviera Nights** (Ultralight → Black, 6 начертаний, `font-display: swap`).
- `tailwind.config.ts` — `font-sans`, `font-display`, `font-body` все привязаны к `var(--font-family-primary)` = Riviera Nights. То есть любой класс типа `font-display`, `font-body`, `font-sans` уже даёт один и тот же шрифт.
- `body`, `h1–h6`, `p`, `.font-display`, `.font-body`, `.h-display-1/2/3`, `.text-eyebrow`, `.text-tagline` — все используют `var(--font-family-primary)`. Здесь всё чисто.
- Арабская версия (`[dir="rtl"]`) использует `'Noto Sans Arabic', 'Riviera Nights'` — это правильно, потому что Riviera Nights не содержит арабских глифов. Трогать не нужно.

## Что выбивается из единого стиля

Нашёл 2 места, где включается **моноширинный** шрифт (system mono, не Riviera Nights):

1. **`src/pages/RepresentativeDetailPage.tsx`** — 3 использования `font-mono`:
   - строка 173: метка с координатами/кодом представителя
   - строка 181: контейнер с локальным временем
   - строка 184: само значение локального времени
2. **`src/components/ui/chart.tsx`** строка 211 — это shadcn-чарт (числа в тултипе). Это служебный UI-компонент, не используется на публичных страницах. **Трогать не буду**, чтобы не сломать табличное выравнивание цифр, если чарт где-то появится.

Других мест с чужими шрифтами (Inter, Poppins, Arial, Josefin, inline `font-family`, `font-[...]`, `font-serif`) — нет.

## План правок

Единственное изменение в коде:

**`src/pages/RepresentativeDetailPage.tsx`**
- Убрать `font-mono` в трёх местах (строки 173, 181, 184). Tracking/uppercase/размер сохраняю — внешний вид «технического» лейбла остаётся (uppercase + широкий tracking), просто рендерится в Riviera Nights, как и весь остальной сайт.

Никакие другие файлы менять не нужно — система шрифтов уже унифицирована через `--font-family-primary` и tailwind-токены.

## Технические детали

```diff
- className="text-[10px] tracking-[0.25em] uppercase text-foreground/40 font-mono"
+ className="text-[10px] tracking-[0.25em] uppercase text-foreground/40"

- className="flex ... text-[10px] sm:text-xs tracking-[0.2em] uppercase text-foreground/40 font-mono"
+ className="flex ... text-[10px] sm:text-xs tracking-[0.2em] uppercase text-foreground/40"

- className="text-foreground/85 text-base font-mono tracking-widest"
+ className="text-foreground/85 text-base tracking-widest"
```

После этого весь публичный сайт (Home, Brand, Projects, Project Detail, Modifications, Commission, Contact, Booking, News, News Detail, Representatives, Representative Detail, Verify, Privacy, Offer, 404, Admin) будет на одном шрифте — **Riviera Nights** (с фолбэком на Noto Sans Arabic только в RTL).
