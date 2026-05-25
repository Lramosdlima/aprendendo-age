/** Linhas de efeito mecânico (`campo`) em tecnologias.json. */
export function normalizeCampoLines(
  campo: string | string[] | undefined | null,
): string[] {
  if (campo == null) return [];
  if (Array.isArray(campo)) return campo.map((s) => s.trim()).filter(Boolean);
  if (typeof campo !== "string" || !campo.trim()) return [];
  return campo
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function campoSearchBlob(campo: string | string[] | undefined | null): string {
  return normalizeCampoLines(campo).join(" ");
}
