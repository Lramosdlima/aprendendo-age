/** Slug de rota a partir da sigla (`CaOK` → `caok`). */
export function clanSlugFromTag(tag: string): string {
  return tag.trim().toLowerCase();
}
