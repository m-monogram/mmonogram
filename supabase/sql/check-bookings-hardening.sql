-- Проверка, что миграция 20260827120000_harden_public_bookings применилась.
-- Ничего не меняет, только читает системные каталоги.
-- Запускать в Supabase → SQL Editor.

-- 1. Ограничение на длины полей.
--    Ожидается строка bookings_field_lengths.
--    validated = false — это норма: ограничение добавлено как NOT VALID,
--    старые строки не перепроверяются, всё новое проверяется.
SELECT conname AS constraint_name,
       convalidated AS validated
FROM pg_constraint
WHERE conrelid = 'public.bookings'::regclass
  AND contype = 'c'
ORDER BY conname;

-- 2. Что аноним может писать по колонкам.
--    Ожидается ровно восемь строк с INSERT:
--    budget, car, email, message, name, phone, service, source.
--    Если в списке есть status или notes — миграция не отработала.
SELECT privilege_type, column_name
FROM information_schema.column_privileges
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name = 'bookings'
  AND privilege_type IN ('INSERT', 'UPDATE')
ORDER BY privilege_type, column_name;

-- 3. Права анонима на таблицу целиком.
--    Ожидается только SELECT (его гасит RLS: политики на чтение заявок
--    выданы лишь роли authenticated с ролью admin/editor).
--    INSERT, UPDATE, DELETE тут быть не должно.
SELECT privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY privilege_type;

-- 4. Политики RLS на таблице — на случай, если их правили руками.
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'bookings'
ORDER BY policyname;
