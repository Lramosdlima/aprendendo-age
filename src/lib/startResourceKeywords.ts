/**
 * Recursos comuns nos starts: no JSON usamos só a palavra (ex.: «comida»);
 * na renderização expandimos para highlight + ícone :token:.
 */

/** Remove markup legado «palavra + ícone» antes de regravar o JSON (migração). */
export function stripLegacyResourceMarkup(text: string): string {
  let t = text;
  // madeira: variante com token dentro de segundo highlight
  t = t.replace(
    /<highlight-brown>([^<]*)<\/highlight-brown><highlight-brown>:woodaom:<\/highlight-brown>/gi,
    "$1",
  );
  t = t.replace(/<highlight-red>([^<]*)<\/highlight-red>\s*:foodaom:/gi, "$1");
  t = t.replace(/<highlight-brown>([^<]*)<\/highlight-brown>\s*:woodaom:/gi, "$1");
  t = t.replace(/<highlight-yellow>([^<]*)<\/highlight-yellow>\s*:goldaom:/gi, "$1");
  t = t.replace(/<highlight-blue>([^<]*)<\/highlight-blue>\s*:favoraom:/gi, "$1");
  return t;
}

/**
 * Expande ocorrências isoladas das palavras-recurso para highlight + ícone.
 * Só deve ser usado em conteúdo de starts (tabelas / lead / footer).
 * Usa limites Unicode para não casar «favor» dentro de «favorável», etc.
 */
export function expandResourceKeywords(text: string): string {
  if (!text) return text;
  const boundaryBefore = String.raw`(?<![\p{L}\p{M}\p{N}_])`;
  const boundaryAfter = String.raw`(?![\p{L}\p{M}\p{N}_])`;
  const u = "giu" as const;
  let t = text;
  t = t.replace(new RegExp(`${boundaryBefore}(comida)${boundaryAfter}`, u), (_x, m: string) => `<highlight-red>${m}</highlight-red>:foodaom:`);
  t = t.replace(new RegExp(`${boundaryBefore}(madeira)${boundaryAfter}`, u), (_x, m: string) => `<highlight-brown>${m}</highlight-brown>:woodaom:`);
  t = t.replace(new RegExp(`${boundaryBefore}(ouro)${boundaryAfter}`, u), (_x, m: string) => `<highlight-yellow>${m}</highlight-yellow>:goldaom:`);
  t = t.replace(new RegExp(`${boundaryBefore}(favor)${boundaryAfter}`, u), (_x, m: string) => `<highlight-blue>${m}</highlight-blue>:favoraom:`);
  return t;
}
