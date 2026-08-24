const LOVABLE_ORIGIN = "https://mmonogram.lovable.app";
const LOVABLE_ASSET_PREFIX = "/__l5e/";

export function mediaUrl(src: string): string {
  if (!src) return src;
  const index = src.indexOf(LOVABLE_ASSET_PREFIX);
  if (index === -1) return src;
  return `${LOVABLE_ORIGIN}${src.slice(index)}`;
}

export function rewriteMediaInValue(value: unknown): unknown {
  if (typeof value === "string") return mediaUrl(value);
  if (Array.isArray(value)) return value.map(rewriteMediaInValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, rewriteMediaInValue(nested)]),
    );
  }
  return value;
}
