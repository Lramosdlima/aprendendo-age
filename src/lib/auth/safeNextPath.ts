/** Evita open redirect no parâmetro `next`. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  const raw = (next ?? fallback).trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
