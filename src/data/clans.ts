import clansJson from "./locale/pt/clans.json";

/**
 * Lista de clãs exibida em `/clans`.
 * Para logo: coloque o arquivo em `public/assets/clans/` e registre o slug em
 * `getClanLogoUrl` (`src/lib/clanAssetUrl.ts`), ou defina `logoSrc` na entrada.
 */
export type ClanEntry = {
  slug: string;
  tag: string;
  name: string;
  logoSrc?: string;
};

export const clans = clansJson as ClanEntry[];
