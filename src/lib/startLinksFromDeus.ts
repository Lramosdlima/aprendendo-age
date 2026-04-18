import { startsBuildOrder } from "@/data/catalog";

const startByTitulo = new Map(startsBuildOrder.map((s) => [s.titulo, s]));

export type StartRefItem =
  | { kind: "link"; id: number; titulo: string }
  | { kind: "text"; raw: string };

/**
 * O campo `starts` em `deuses_aom.json` é uma lista separada por vírgulas
 * cujos trechos coincidem com `titulo` em `starts_build_order.json`.
 */
export function parseStartReferences(startsText: string): StartRefItem[] {
  const parts = startsText
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.map((part) => {
    const exact = startByTitulo.get(part);
    if (exact) return { kind: "link", id: exact.id, titulo: exact.titulo };
    const collapsed = part.replace(/\s+/g, " ").trim();
    const fuzzy = startByTitulo.get(collapsed);
    if (fuzzy) return { kind: "link", id: fuzzy.id, titulo: fuzzy.titulo };
    return { kind: "text", raw: part };
  });
}
