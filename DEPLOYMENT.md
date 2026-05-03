# 🚀 M-Monogram - Инструкция по развертыванию

## 📋 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Локальный запуск для проверки

```bash
npm run dev
```

Откройте http://localhost:5173 в браузере

### 3. Сборка для продакшена

```bash
npm run build
```

Готовые файлы будут в папке `dist/`

### 4. Превью продакшен-сборки локально

```bash
npm run preview
```

---

## 🌐 Развертывание на хостинге

### Вариант 1: Vercel (Рекомендуется) ⭐

**Самый простой способ:**

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Подключите ваш Git репозиторий (GitHub/GitLab/Bitbucket)
3. Vercel автоматически определит настройки Vite
4. Нажмите "Deploy"

**Через CLI:**

```bash
# Установить Vercel CLI
npm install -g vercel

# Деплой
vercel

# Продакшен деплой
vercel --prod
```

**Настройки Vercel:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

### Вариант 2: Netlify

**Через веб-интерфейс:**

1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Выберите ваш Git репозиторий
4. Настройки:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy site

**Через CLI:**

```bash
# Установить Netlify CLI
npm install -g netlify-cli

# Деплой
netlify deploy --prod --dir=dist
```

**Создайте файл `netlify.toml` в корне проекта:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Вариант 3: GitHub Pages

1. Обновите `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/m-monogram/', // замените на имя вашего репозитория
  // ... остальные настройки
})
```

2. Добавьте скрипт деплоя в `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

3. Установите gh-pages:

```bash
npm install -D gh-pages
```

4. Деплой:

```bash
npm run deploy
```

---

### Вариант 4: Собственный VPS/сервер (nginx)

**1. Соберите проект:**

```bash
npm run build
```

**2. Скопируйте папку `dist/` на сервер:**

```bash
scp -r dist/* user@your-server.com:/var/www/m-monogram/
```

**3. Настройте nginx:**

```nginx
server {
    listen 80;
    server_name m-monogram.com www.m-monogram.com;
    
    root /var/www/m-monogram;
    index index.html;
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json image/svg+xml;
    
    # Кеширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - все запросы на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**4. Перезапустите nginx:**

```bash
sudo systemctl reload nginx
```

**5. SSL сертификат (Let's Encrypt):**

```bash
sudo certbot --nginx -d m-monogram.com -d www.m-monogram.com
```

---

### Вариант 5: Docker

**Создайте `Dockerfile` в корне проекта:**

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Создайте `nginx.conf`:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Сборка и запуск:**

```bash
# Собрать образ
docker build -t m-monogram .

# Запустить контейнер
docker run -d -p 80:80 m-monogram
```

**Docker Compose (`docker-compose.yml`):**

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## ⚙️ Переменные окружения

Проект **не требует** переменных окружения для работы.

Если в будущем понадобятся (например, для API):

1. Создайте `.env.local`:

```env
VITE_API_URL=https://api.m-monogram.com
VITE_WHATSAPP_NUMBER=971501234567
```

2. Используйте в коде:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 🔧 Оптимизация для продакшена

### 1. Проверьте размер бандла:

```bash
npm run build
```

Посмотрите на размеры файлов в `dist/`

### 2. Анализ бандла:

```bash
npm install -D rollup-plugin-visualizer
```

Добавьте в `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
})
```

### 3. Сжатие изображений:

Все изображения уже оптимизированы, но для новых используйте:
- [TinyPNG](https://tinypng.com)
- [Squoosh](https://squoosh.app)

---

## 📊 Проверка производительности

После деплоя проверьте:

1. **Lighthouse** (в Chrome DevTools):
   - Performance
   - SEO
   - Accessibility
   - Best Practices

2. **PageSpeed Insights**: https://pagespeed.web.dev

3. **GTmetrix**: https://gtmetrix.com

---

## 🔒 Безопасность

### Заголовки безопасности (для nginx):

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;" always;
```

---

## 📱 Тестирование на разных устройствах

После деплоя проверьте сайт на:
- iPhone (Safari)
- Android (Chrome)
- iPad
- Desktop (Chrome, Firefox, Safari)

---

## 🐛 Troubleshooting

### Проблема: Белый экран после деплоя

**Решение:**
1. Проверьте консоль браузера (F12)
2. Убедитесь, что `base` в `vite.config.ts` настроен правильно
3. Проверьте, что все пути к ассетам абсолютные (начинаются с `/`)

### Проблема: 404 при обновлении страницы

**Решение:** Настройте SPA routing (см. примеры nginx выше)

### Проблема: Медленная загрузка

**Решение:**
1. Включите CDN (Cloudflare, AWS CloudFront)
2. Оптимизируйте изображения
3. Включите gzip/brotli сжатие

---

## 📞 Поддержка

При возникновении проблем проверьте:
1. Логи сервера
2. Консоль браузера
3. Network tab в DevTools

---

## ✅ Чеклист перед деплоем

- [ ] `npm run build` проходит без ошибок
- [ ] `npm run preview` работает корректно
- [ ] Все изображения оптимизированы
- [ ] Meta-теги заполнены (title, description)
- [ ] favicon.ico установлен
- [ ] robots.txt настроен
- [ ] Analytics подключен (если нужен)
- [ ] SSL сертификат настроен
- [ ] Домен настроен (DNS)

---

**Проект готов к деплою! 🚀**
