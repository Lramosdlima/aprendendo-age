/**
 * `tipo` em `unidades_aom.json`: categorias com ícone opcional (`:token:` via {@link NotionText}).
 */

export type UnidadeTipoItem = {
  type: string;
  /** Nome do token sem `:`; vazio = só texto (ex.: Batedor 👁). */
  icon: string;
};

export function hasTipoContent(t: UnidadeTipoItem[] | null | undefined): boolean {
  return Array.isArray(t) && t.length > 0;
}

/** Texto equivalente ao formato antigo para pesquisa / meta. */
export function tipoItemsToSearchBlob(items: UnidadeTipoItem[] | null | undefined): string {
  if (!items?.length) return "";
  return items.map((it) => [it.type, it.icon].filter(Boolean).join(" ")).join(" ");
}

/** Reconstrói o fragmento Notion de um item (como no JSON string antigo). */
export function tipoItemToNotionText(it: UnidadeTipoItem): string {
  const icon = (it.icon ?? "").trim();
  if (!icon) return it.type ?? "";
  const label = (it.type ?? "").trim();
  return `${label} :${icon}:`;
}

export function tipoItemsToNotionText(items: UnidadeTipoItem[] | null | undefined): string {
  if (!items?.length) return "";
  return items.map(tipoItemToNotionText).join(", ");
}

/**
 * Cor do rótulo de tipo (lista de unidades, cabeçalhos). `Curandeiro` e outros sem match ficam neutros.
 */
export function tipoTypeTextClass(typeLabel: string): string {
  const t = (typeLabel ?? "").trim();
  if (!t) return "text-zinc-300";

  if (t.startsWith("Infantaria")) return "text-red-400";
  if (t.startsWith("Cavalaria")) return "text-emerald-400";
  if (t.startsWith("Artilharia")) return "text-sky-400";
  if (t.startsWith("Herói")) return "text-yellow-300";
  if (t.startsWith("Batedor")) return "text-zinc-500";
  if (t.startsWith("Mítica")) return "text-pink-400";
  if (t.startsWith("Cerco")) return "text-amber-700";
  if (t.startsWith("Voador")) return "text-zinc-400";

  return "text-zinc-300";
}
