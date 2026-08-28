-- Проверка, что миграция 20260827120000_harden_public_bookings применилась.
-- Ничего не меняет, только читает системные каталоги.
--
-- Один запрос, а не несколько: SQL Editor в Supabase показывает результат
-- только последнего запроса, и разбитая на блоки проверка выдавала лишь
-- четвёртую таблицу.
--
-- Ожидаемый итог: три строки «ОК» и одна справочная.

SELECT 'Ограничение длин полей' AS проверка,
       COALESCE(string_agg(conname, ', ' ORDER BY conname), '— нет') AS значение,
       CASE WHEN count(*) FILTER (WHERE conname = 'bookings_field_lengths') = 1
            THEN 'ОК' ELSE 'НЕ ПРИМЕНЕНО' END AS итог
FROM pg_constraint
WHERE conrelid = 'public.bookings'::regclass AND contype = 'c'

UNION ALL

SELECT 'Колонки, куда аноним может писать',
       COALESCE(string_agg(c.column_name, ', ' ORDER BY c.column_name), '— нет'),
       CASE
         WHEN count(*) = 0 THEN 'ПРОБЛЕМА: форма не сможет отправить заявку'
         WHEN bool_or(c.column_name IN ('status', 'notes')) THEN 'ПРОБЛЕМА: доступны служебные колонки'
         WHEN count(*) = 8 THEN 'ОК'
         ELSE 'проверить вручную'
       END
FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.table_name = 'bookings'
  AND has_column_privilege('anon', 'public.bookings', c.column_name, 'INSERT')

UNION ALL

SELECT 'Права анонима на таблицу целиком',
       COALESCE(NULLIF(concat_ws(', ',
         CASE WHEN has_table_privilege('anon', 'public.bookings', 'SELECT') THEN 'SELECT' END,
         CASE WHEN has_table_privilege('anon', 'public.bookings', 'INSERT') THEN 'INSERT' END,
         CASE WHEN has_table_privilege('anon', 'public.bookings', 'UPDATE') THEN 'UPDATE' END,
         CASE WHEN has_table_privilege('anon', 'public.bookings', 'DELETE') THEN 'DELETE' END
       ), ''), '— нет'),
       CASE WHEN has_table_privilege('anon', 'public.bookings', 'INSERT')
              OR has_table_privilege('anon', 'public.bookings', 'UPDATE')
              OR has_table_privilege('anon', 'public.bookings', 'DELETE')
            THEN 'ПРОБЛЕМА: REVOKE не отработал' ELSE 'ОК' END

UNION ALL

SELECT 'Политики RLS',
       string_agg(policyname || ' → ' || cmd, '; ' ORDER BY policyname),
       'справочно'
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'bookings';
