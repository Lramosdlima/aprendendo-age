/**
 * Lista de clãs exibida em `/clans`.
 * Para logo: coloque o arquivo em `public/clans/` (ex.: `public/clans/cbb.png`)
 * e defina `logoSrc: "/clans/cbb.png"` na entrada.
 */
export type ClanEntry = {
  slug: string;
  tag: string;
  name: string;
  logoSrc?: string;
};

export const clans: ClanEntry[] = [
  { slug: "caok", tag: "CaOK", name: "Clan Age Of Kings" },
  { slug: "cbb", tag: "CBB", name: "Clan Bom De Briga" },
  { slug: "psgm", tag: "PSGM", name: "PROSTAGMA" },
  { slug: "disc", tag: "DISC", name: "DISCÓRDIA" },
];
