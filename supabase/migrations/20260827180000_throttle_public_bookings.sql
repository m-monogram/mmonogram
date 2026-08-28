-- Ограничение частоты отправки заявок.
--
-- Политика INSERT открыта для анонима — иначе форма не работает. Ограничения
-- на длину полей (миграция 20260827120000) режут размер одной заявки, но не
-- их количество: скриптом можно налить тысячи коротких записей за минуту.
-- На клиенте барьеры есть — honeypot и минимальное время заполнения, — но
-- клиент не граница безопасности: запрос уходит и мимо страницы.
--
-- Полноценный лимит по IP делается edge-функцией, здесь её нет. Но два
-- дешёвых правила на стороне базы закрывают обе реальные картины: повторную
-- отправку одной и той же формы и заливку потоком.
--
--   один телефон  — не чаще раза в 2 минуты. Человек, поправивший опечатку,
--                   подождёт; скрипт, долбящий одной payload, встанет.
--   вся таблица   — не больше 30 заявок в минуту. Для ателье это запас в
--                   десятки раз, а поток обрубает.
--
-- Коды ошибок свои (MM001, MM002): по ним форма отличает «слишком часто» от
-- настоящего сбоя и показывает человеку понятный текст, а не «ошибка базы».

CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_phone_created_at_idx ON public.bookings (phone, created_at DESC);

CREATE OR REPLACE FUNCTION public.throttle_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  same_phone integer;
  total_recent integer;
BEGIN
  SELECT count(*) INTO same_phone
  FROM public.bookings
  WHERE phone = NEW.phone
    AND created_at > now() - interval '2 minutes';

  IF same_phone > 0 THEN
    RAISE EXCEPTION 'Заявка с этого номера уже отправлена'
      USING ERRCODE = 'MM001';
  END IF;

  SELECT count(*) INTO total_recent
  FROM public.bookings
  WHERE created_at > now() - interval '1 minute';

  IF total_recent >= 30 THEN
    RAISE EXCEPTION 'Слишком много заявок за минуту'
      USING ERRCODE = 'MM002';
  END IF;

  RETURN NEW;
END;
$$;

/* Функция читает таблицу в обход RLS — иначе аноним, которому чтение заявок
   закрыто, всегда видел бы ноль и лимит не срабатывал бы вовсе. Права на
   выполнение самой функции анониму не нужны: триггер вызывает её от имени
   владельца. */
REVOKE ALL ON FUNCTION public.throttle_bookings() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bookings_throttle ON public.bookings;
CREATE TRIGGER bookings_throttle
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.throttle_bookings();
