import clansJson from "./locale/pt/clans.json";

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

export const clans = clansJson as ClanEntry[];
