const CLAN_LOGO_BY_SLUG: Record<string, string> = {
  caok: "/assets/clans/CAOK_ClanAgeOfKings.webp",
  disc: "/assets/clans/DISC_Discordia.webp",
  g3n: "/assets/clans/G3N_Generais.webp",
  mdre: "/assets/clans/MDRE_MandaRecurso.webp",
  psgm: "/assets/clans/PSGM_Prostagma.webp",
};

/** URL pública do logo do clã em `public/assets/clans/`. */
export function getClanLogoUrl(clan: { slug: string; logoSrc?: string }): string | undefined {
  return clan.logoSrc ?? CLAN_LOGO_BY_SLUG[clan.slug];
}
