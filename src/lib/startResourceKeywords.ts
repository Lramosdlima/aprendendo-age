/**
 * Recursos e trabalhadores nos starts: no JSON usamos só o texto;
 * na renderização expandimos para highlight + :token: (recursos) ou palavra + :token: (trabalhadores).
 */
import { expandBuildingKeywords } from "@/lib/startBuildingKeywords";

/** Evita expandir de novo se já houver :aomr_*: logo após a palavra. */
const NOT_IF_ICON = String.raw`(?!\s*:aomr_)`;

/** Remove markup legado «palavra + ícone» antes de regravar o JSON (migração). */
export function stripLegacyResourceMarkup(text: string): string {
  let t = text;
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

/** Não expandir logo após letra/número nem após «>» de tag (ex.: <tag>Aldeão). */
const B = String.raw`(?<![\p{L}\p{M}\p{N}_<>])`;
const A = String.raw`(?![\p{L}\p{M}\p{N}_])`;
const U = "giu" as const;

/**
 * Expande trabalhadores (grego, egípcio, nórdico, atlante, chinês, japonês).
 * Linhas com «Cidadão Inicial :aomr_citizen_hero_icon:» no JSON mantêm o token manual; não use só texto para esse caso.
 */
export function expandWorkerKeywords(text: string): string {
  if (!text) return text;
  let t = text;

  const rules: Array<{ re: RegExp; token: string }> = [
    { re: new RegExp(`${B}(Aldeões\\s+iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_villager_greek_icon" },
    { re: new RegExp(`${B}(Aldeão\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_villager_greek_icon" },
    { re: new RegExp(`${B}(Aldeões)(?!\\s+iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_villager_greek_icon" },
    { re: new RegExp(`${B}(Aldeão)(?!\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_villager_greek_icon" },

    { re: new RegExp(`${B}(Trabalhadores\\s+Iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_laborer_icon" },
    { re: new RegExp(`${B}(Trabalhador\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_laborer_icon" },
    { re: new RegExp(`${B}(Trabalhadores)(?!\\s+[Ii]nicial)${NOT_IF_ICON}${A}`, U), token: "aomr_laborer_icon" },
    { re: new RegExp(`${B}(Trabalhador)(?!\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_laborer_icon" },

    { re: new RegExp(`${B}(Coletores\\s+do\\s+Ouro)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },
    { re: new RegExp(`${B}(Coletor\\s+do\\s+Ouro)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },
    { re: new RegExp(`${B}(Coletores\\s+iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },
    { re: new RegExp(`${B}(Coletores\\s+inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },
    { re: new RegExp(`${B}(Coletor\\s+inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },
    { re: new RegExp(`${B}(Coletores)(?!\\s+[Ii]nicial)(?!\\s+do\\s+Ouro)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },
    { re: new RegExp(`${B}(Coletor)(?!\\s+[Ii]nicial)(?!\\s+do\\s+Ouro)${NOT_IF_ICON}${A}`, U), token: "aomr_gatherer_icon" },

    { re: new RegExp(`${B}(Anões\\s+iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_dwarf_icon" },
    { re: new RegExp(`${B}(Anões)(?!\\s+[Ii]nicial)${NOT_IF_ICON}${A}`, U), token: "aomr_dwarf_icon" },
    { re: new RegExp(`${B}(Anão)${NOT_IF_ICON}${A}`, U), token: "aomr_dwarf_icon" },

    {
      re: new RegExp(`${B}(Cidadão\\s+Inicial)(?!\\s*:aomr_citizen_)`, U),
      token: "aomr_citizen_icon",
    },
    { re: new RegExp(`${B}(Cidadãos)(?!\\s+[Ii]nicial)${NOT_IF_ICON}${A}`, U), token: "aomr_citizen_icon" },
    { re: new RegExp(`${B}(Cidadão)(?!\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_citizen_icon" },

    { re: new RegExp(`${B}(Camponeses\\s+inicias)${NOT_IF_ICON}${A}`, U), token: "aomr_peasant_icon" },
    { re: new RegExp(`${B}(Camponês\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_peasant_icon" },
    { re: new RegExp(`${B}(Camponeses\\s+iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_peasant_icon" },
    { re: new RegExp(`${B}(Camponeses)(?!\\s+[Ii]nicial)${NOT_IF_ICON}${A}`, U), token: "aomr_peasant_icon" },
    { re: new RegExp(`${B}(Camponês)(?!\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_peasant_icon" },
    { re: new RegExp(`${B}(Campones)${NOT_IF_ICON}${A}`, U), token: "aomr_peasant_icon" },

    { re: new RegExp(`${B}(Kuafu\\s+inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_kuafu_icon" },
    { re: new RegExp(`${B}(Kuafus)${NOT_IF_ICON}${A}`, U), token: "aomr_kuafu_icon" },
    { re: new RegExp(`${B}(Kuafu)${NOT_IF_ICON}${A}`, U), token: "aomr_kuafu_icon" },

    { re: new RegExp(`${B}(Plebeus\\s+Iniciais)${NOT_IF_ICON}${A}`, U), token: "aomr_commoner_icon" },
    { re: new RegExp(`${B}(Plebeu\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_commoner_icon" },
    { re: new RegExp(`${B}(Plebeus)(?!\\s+[Ii]nicial)${NOT_IF_ICON}${A}`, U), token: "aomr_commoner_icon" },
    { re: new RegExp(`${B}(Plebeu)(?!\\s+Inicial)${NOT_IF_ICON}${A}`, U), token: "aomr_commoner_icon" },

    { re: new RegExp(`${B}(Colonos)${NOT_IF_ICON}${A}`, U), token: "aomr_settler_icon" },
    { re: new RegExp(`${B}(Colono)${NOT_IF_ICON}${A}`, U), token: "aomr_settler_icon" },
  ];

  for (const { re, token } of rules) {
    t = t.replace(re, (m) => `${m} :${token}:`);
  }
  return t;
}

/**
 * Expande ocorrências isoladas das palavras-recurso para highlight + ícone.
 * Usa limites Unicode para não casar «favor» dentro de «favorável», etc.
 */
export function expandResourceKeywords(text: string): string {
  if (!text) return text;
  const boundaryBefore = String.raw`(?<![\p{L}\p{M}\p{N}_])`;
  const boundaryAfter = String.raw`(?![\p{L}\p{M}\p{N}_])`;
  const u = "giu" as const;
  let t = text;
  t = t.replace(
    new RegExp(`${boundaryBefore}(comida)${NOT_IF_ICON}${boundaryAfter}`, u),
    (_x, m: string) => `<highlight-red>${m}</highlight-red>:foodaom:`,
  );
  t = t.replace(
    new RegExp(`${boundaryBefore}(madeira)${NOT_IF_ICON}${boundaryAfter}`, u),
    (_x, m: string) => `<highlight-brown>${m}</highlight-brown>:woodaom:`,
  );
  t = t.replace(
    new RegExp(`${boundaryBefore}(ouro)${NOT_IF_ICON}${boundaryAfter}`, u),
    (_x, m: string) => `<highlight-yellow>${m}</highlight-yellow>:goldaom:`,
  );
  t = t.replace(
    new RegExp(`${boundaryBefore}(favor)${NOT_IF_ICON}${boundaryAfter}`, u),
    (_x, m: string) => `<highlight-blue>${m}</highlight-blue>:favoraom:`,
  );
  return t;
}

/** Ordem: trabalhadores → edifícios/estruturas (nome+ícone) → recursos. */
export function expandStartInlineKeywords(text: string): string {
  return expandResourceKeywords(expandBuildingKeywords(expandWorkerKeywords(text)));
}
