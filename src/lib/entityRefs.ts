/** Referência `{ id, nome }` com `id` numérico (panteão, era, poder divino, deus, unidade, start…). */
export type EntityNumRef = { id: number; nome: string };

/** Referência com `id` string (ex.: tecnologias no Notion em `deuses_aom.json`). */
export type EntityStrRef = { id: string; nome: string };

export function firstNumId(refs: EntityNumRef[] | undefined | null): number | undefined {
  const id = refs?.[0]?.id;
  return typeof id === "number" ? id : undefined;
}

export function firstNome(refs: { nome: string }[] | undefined | null): string | undefined {
  return refs?.[0]?.nome;
}

export function joinRefNomes(refs: { nome: string }[] | undefined | null, sep = ", "): string {
  return (refs ?? []).map((r) => r.nome).join(sep);
}

/** Campo legado ainda string (ex.: `panteoes: "Geral"`) ou já migrado para `[{ id, nome }]`. */
export function joinRefNomesOrString(
  v: string | { nome: string }[] | null | undefined,
  sep = ", ",
): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return joinRefNomes(v, sep);
}
