import { useCallback, useRef, useState, type ReactNode } from "react";
import { looksAutomated } from "@/lib/leads";

/**
 * Барьер против ботов для публичных форм заявок.
 *
 * Политика RLS у таблицы bookings разрешает INSERT кому угодно — иначе форма
 * не работала бы у неавторизованного посетителя. Значит, единственная защита
 * от автоматической рассылки на стороне сайта — эта пара приёмов:
 *
 *  1. Поле-ловушка. Человек его не видит и не может заполнить (оно вынесено
 *     за пределы экрана и исключено из обхода по Tab), а скрипт заполняет всё
 *     подряд. Заполнено — заявка молча отбрасывается.
 *  2. Время заполнения. Форма, отправленная быстрее полутора секунд после
 *     появления на экране, заполнена не руками.
 *
 * Полноценный лимит частоты возможен только на сервере (edge-функция или
 * ограничение в самой базе) — здесь его нет и быть не может: любой запрос
 * уходит прямо из браузера.
 */
export function useLeadGuard() {
  const openedAt = useRef(Date.now());
  const [trapValue, setTrapValue] = useState("");

  const isAutomated = useCallback(
    () => trapValue.trim().length > 0 || looksAutomated(openedAt.current),
    [trapValue],
  );

  const trap: ReactNode = (
    <div aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
      <label htmlFor="company-website-field">Company website</label>
      <input
        id="company-website-field"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={trapValue}
        onChange={(e) => setTrapValue(e.target.value)}
      />
    </div>
  );

  return { trap, trapValue, isAutomated };
}
