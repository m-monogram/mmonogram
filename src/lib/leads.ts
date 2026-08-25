import { supabase } from "@/integrations/supabase/client";
import { sanitizePhone, sanitizeText } from "@/lib/validation";

export interface LeadPayload {
  name: string;
  phone: string;
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

export function normalizeLead(payload: LeadPayload): LeadPayload | { error: string } {
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

  let id: string | undefined;
  let dbOk = false;
  let dbError: string | undefined;

  try {
    const client = supabase as any;
    const { data, error } = await client
      .from("bookings")
      .insert({
        name: normalized.name,
        phone: normalized.phone,
        email: normalized.email,
        car: normalized.car,
        service: normalized.service,
        message: normalized.message,
        source: normalized.source,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Lead insert failed:", error);
      dbError = error.message || "db";
    } else {
      dbOk = true;
      id = data?.id as string | undefined;
    }
  } catch (err) {
    console.error("Lead submit exception:", err);
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const notified = await notifyWebhook({ ...normalized, id });

  if (dbOk || notified) {
    return { ok: true, id, notified };
  }

  return { ok: false, error: dbError || "notify" };
}

/** @deprecated use submitLead */
export async function submitBooking(payload: LeadPayload): Promise<LeadResult> {
  return submitLead(payload);
}
