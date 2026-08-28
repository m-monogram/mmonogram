import { supabase } from "@/integrations/supabase/client";
import { sanitizePhone, sanitizeText } from "@/lib/validation";

export interface LeadPayload {
  name: string;
  phone: string;
  /**
   * Ловушка для ботов: поле скрыто от человека, но видно автозаполнению
   * скриптов. Заполнено — заявка молча отбрасывается. Публичная политика
   * bookings разрешает INSERT кому угодно (иначе форма бы не работала),
   * так что это единственный барьер на стороне клиента; серверный лимит
   * частоты нужно ставить отдельно, edge-функцией.
   */
  companyWebsite?: string;
  email?: string | null;
  car?: string | null;
  service?: string | null;
  message?: string | null;
  /** Form source for admin: booking | contact | website */
  source?: string;
  page?: string;
}

export interface LeadResult {
  ok: boolean;
  id?: string;
  error?: string;
  /** true if outbound webhook accepted (Telegram / n8n / etc.) */
  notified?: boolean;
}

const WEBHOOK_URL = (import.meta.env.VITE_LEADS_WEBHOOK_URL as string | undefined)?.trim() || "";

/** Soft phone check for lead forms (UAE local + international). */
export function isValidLeadPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/** Минимум времени между открытием формы и отправкой, мс. */
const MIN_FILL_MS = 1500;

export function normalizeLead(payload: LeadPayload): LeadPayload | { error: string } {
  if (payload.companyWebsite) return { error: "spam" };
  const name = sanitizeText(payload.name || "", 100);
  const phoneRaw = sanitizeText(payload.phone || "", 30);
  const phone = sanitizePhone(phoneRaw);
  const email = payload.email ? sanitizeText(payload.email, 120) : null;
  const car = payload.car ? sanitizeText(payload.car, 100) : null;
  const service = payload.service ? sanitizeText(payload.service, 100) : null;
  const message = payload.message ? sanitizeText(payload.message, 1000) : null;

  if (!name || name.length < 2) return { error: "name" };
  if (!phone || !isValidLeadPhone(phone)) return { error: "phone" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "email" };

  return {
    name,
    phone,
    email: email || null,
    car: car || null,
    service: service || null,
    message: message || null,
    source: payload.source || "website",
    page: payload.page || (typeof window !== "undefined" ? window.location.pathname : undefined),
  };
}

/**
 * Форму, отправленную быстрее человека, отбрасываем. Возвращает true, если
 * отправку следует пропустить (притворившись успешной — боту знать не нужно).
 */
export function looksAutomated(openedAt: number): boolean {
  return Date.now() - openedAt < MIN_FILL_MS;
}

/** Human-readable message for Telegram / WhatsApp / n8n. */
export function formatLeadMessage(lead: LeadPayload): string {
  const lines = [
    "🆕 New lead — M-Monogram",
    "",
    `👤 Name: ${lead.name}`,
    `📞 Phone: ${lead.phone}`,
  ];
  if (lead.email) lines.push(`✉️ Email: ${lead.email}`);
  if (lead.car) lines.push(`🚗 Car: ${lead.car}`);
  if (lead.service) lines.push(`🛠 Service: ${lead.service}`);
  if (lead.message) lines.push(`💬 Message: ${lead.message}`);
  lines.push("");
  lines.push(`📍 Source: ${lead.source || "website"}`);
  if (lead.page) lines.push(`🔗 Page: ${lead.page}`);
  return lines.join("\n");
}

async function notifyWebhook(lead: LeadPayload & { id?: string }): Promise<boolean> {
  if (!WEBHOOK_URL) return false;

  try {
    const text = formatLeadMessage(lead);
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Compatible with n8n Webhook + Telegram Bot “sendMessage” style consumers
        channel: "lead",
        text,
        message: text,
        lead: {
          id: lead.id ?? null,
          name: lead.name,
          phone: lead.phone,
          email: lead.email ?? null,
          car: lead.car ?? null,
          service: lead.service ?? null,
          message: lead.message ?? null,
          source: lead.source ?? "website",
          page: lead.page ?? null,
          created_at: new Date().toISOString(),
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Lead webhook failed:", err);
    return false;
  }
}

/**
 * Save lead to Supabase `bookings` and optionally notify VITE_LEADS_WEBHOOK_URL
 * (n8n → Telegram, Make.com, etc.).
 * Succeeds if DB insert OR webhook succeeds (so Telegram can work before table exists).
 */
export async function submitLead(raw: LeadPayload): Promise<LeadResult> {
  const normalized = normalizeLead(raw);
  if ("error" in normalized) {
    return { ok: false, error: normalized.error };
  }

  let dbOk = false;
  let dbError: string | undefined;

  try {
    const client = supabase as any;
    /* Без .select(): читать bookings разрешено только админу и редактору
       (RLS), а INSERT ... RETURNING требует ещё и права на чтение строки.
       С анонимной заявки такой запрос возвращал ошибку — посетитель видел
       «не удалось отправить», хотя писал настоящую заявку. Идентификатор
       нужен был только для строки в вебхуке и легко без него обходится. */
    const { error } = await client.from("bookings").insert({
      name: normalized.name,
      phone: normalized.phone,
      email: normalized.email,
      car: normalized.car,
      service: normalized.service,
      message: normalized.message,
      source: normalized.source,
      /* status не передаём: у анонима нет привилегии на эту колонку
         (см. миграцию 20260827120000_harden_public_bookings), а значение
         по умолчанию в базе и так 'new'. Иначе заявку можно было завести
         сразу закрытой, минуя форму. */
    });

    if (error) {
      console.error("Lead insert failed:", error);
      /* MM001/MM002 — свои коды ограничителя частоты в базе (миграция
         20260827180000). Их нужно отличать от настоящего сбоя: посетителю
         показывается «уже отправлено», а не «ошибка, попробуйте ещё раз»,
         иначе он будет жать кнопку по кругу и получать то же самое. */
      dbError = error.code === "MM001" || error.code === "MM002" ? "throttled" : error.message || "db";
    } else {
      dbOk = true;
    }
  } catch (err) {
    console.error("Lead submit exception:", err);
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const notified = await notifyWebhook(normalized);

  if (dbOk || notified) {
    return { ok: true, notified };
  }

  return { ok: false, error: dbError || "notify" };
}

/** @deprecated use submitLead */
export async function submitBooking(payload: LeadPayload): Promise<LeadResult> {
  return submitLead(payload);
}
