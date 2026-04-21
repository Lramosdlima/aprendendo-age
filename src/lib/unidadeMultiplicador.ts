/**
 * `multiplicador` em `unidades_aom.json`: lista estruturada + reconstrução do texto
 * no formato esperado por {@link NotionText} (ícones `:token:`).
 */

export type UnidadeMultiplicadorItem = {
  type: string;
  /** Nome do token sem `:` (ex.: `aomr_type_infantry_icon`). Vazio = segmento só texto/emojis. */
  icon: string;
  /**
   * Valor canónico para números simples (ex.: `"1.25"`), ou texto completo após o token
   * (ex.: `"12x (hack)"`, `"0.5%"`, descrições longas).
   */
  value: string;
};

const PANTHEON_PT: Record<string, string> = {
  greeks: "Grego",
  egyptians: "Egípcio",
  norse: "Nórdico",
  atlanteans: "Atlante",
  chinese: "Chinês",
  japanese: "Japonês",
  azteca: "Asteca",
};

/** Rótulo de “tipo” alinhado às categorias do jogo na UI (ex.: Artilharia para arqueiros). */
const TYPE_SLUG_PT: Record<string, string> = {
  archer: "Artilharia",
  infantry: "Infantaria",
  cavalry: "Cavalaria",
  building: "Construção",
  myth_unit: "Unidade mítica",
  hero: "Herói",
  ship: "Navio",
  siege_ship: "Navio de cerco",
  siege_weapon: "Arma de cerco",
  flying_unit: "Unidade voadora",
  titan: "Titã",
  tower: "Torre",
  wall: "Muralha",
  villager: "Aldeão",
  human_soldier: "Soldado humano",
  close_combat_ship: "Navio de combate corpo a corpo",
  archer_ship: "Navio arqueiro",
};

export function multiplicadorTypeFromIcon(icon: string): string {
  const k = icon.toLowerCase().trim();
  if (!k) return "Texto";

  const pant = /^aomr_pantheon_([a-z]+)_icon$/.exec(k);
  if (pant?.[1]) {
    return PANTHEON_PT[pant[1]] ?? pant[1].charAt(0).toUpperCase() + pant[1].slice(1);
  }

  const unit = /^aomr_type_([a-z0-9_]+)_icon$/.exec(k);
  if (unit?.[1]) {
    return TYPE_SLUG_PT[unit[1]] ?? unit[1].replace(/_/g, " ");
  }

  return k.replace(/^aomr_/, "").replace(/_icon$/i, "").replace(/_/g, " ");
}

/** Há conteúdo a mostrar (não é lista vazia / ausente). */
export function hasMultiplicadorContent(
  m: UnidadeMultiplicadorItem[] | null | undefined,
): boolean {
  return Array.isArray(m) && m.length > 0;
}

/**
 * Reconstrói o texto no estilo original (tokens `:name:` + sufixos) para render com {@link NotionText}.
 */
export function multiplicadorItemsToNotionText(
  items: UnidadeMultiplicadorItem[] | null | undefined,
): string {
  if (!items?.length) return "";

  const parts: string[] = [];
  for (const it of items) {
    const icon = (it.icon ?? "").trim();
    const value = it.value ?? "";

    if (!icon) {
      parts.push(value);
      continue;
    }

    const tail = formatTailForNotion(value);
    parts.push(`:${icon}:${tail}`);
  }
  return parts.join(" || ");
}

/** Número canónico (`1.25`) → `1,25x` como no dataset antigo; resto mantém-se. */
function formatTailForNotion(value: string): string {
  const v = value.trim();
  if (!v) return "";

  if (/^\d+(\.\d+)?$/.test(v)) {
    return `${v.replace(".", ",")}x`;
  }
  return v;
}
