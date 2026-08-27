-- Ограничения на публичные заявки.
--
-- Политика INSERT на bookings обязана оставаться открытой: форму отправляет
-- анонимный посетитель, иначе она просто не работает. Но открытая политика
-- разрешает заодно и любую длину полей, и запись в служебные колонки —
-- в обход формы можно было завести заявку сразу со статусом completed и с
-- внутренней заметкой администратора, а поля набить мегабайтами текста.
--
-- Клиент это уже проверяет (honeypot, минимальное время заполнения, обрезка
-- длин в src/lib/leads.ts), но клиент — не граница безопасности: запрос к
-- PostgREST можно отправить и мимо страницы.
--
-- Ограничения ставятся NOT VALID: старые строки не перепроверяются, а всё
-- новое уже обязано им соответствовать.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_field_lengths') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_field_lengths CHECK (
        char_length(name) BETWEEN 2 AND 120
        AND char_length(phone) BETWEEN 6 AND 40
        AND (email IS NULL OR char_length(email) <= 254)
        AND (car IS NULL OR char_length(car) <= 120)
        AND (service IS NULL OR char_length(service) <= 120)
        AND (budget IS NULL OR char_length(budget) <= 120)
        AND (message IS NULL OR char_length(message) <= 4000)
        AND (notes IS NULL OR char_length(notes) <= 8000)
        AND (source IS NULL OR char_length(source) <= 40)
      ) NOT VALID;
  END IF;
END $$;

-- Колоночные привилегии: аноним пишет только то, что есть в форме.
-- status и notes остаются за админом, created_at/updated_at — за базой.
REVOKE INSERT, UPDATE, DELETE ON public.bookings FROM anon;
GRANT INSERT (name, phone, email, car, service, budget, message, source)
  ON public.bookings TO anon;
