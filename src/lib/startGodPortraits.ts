import type { DeusPortraitHeaderItem } from "@/components/deus/DeusPortraitHeaderActions";
import { deuses, deusSlugById } from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";

/** Nomes em `starts_build_order.json` que não coincidem com `deuses_aom.json`. */
export const START_GOD_NAME_ALIASES: Record<string, string> = {
  Isis: "Ísis",
  Ra: "Rá",
  Freyr: "Frey",
};

const deusByNome = new Map(deuses.map((d) => [d.nome, d] as const));

export function resolveStartGodPortraitItems(labels: string[]): DeusPortraitHeaderItem[] {
  const items: DeusPortraitHeaderItem[] = [];
  labels.forEach((label, index) => {
    const nome = START_GOD_NAME_ALIASES[label] ?? label;
    const d = deusByNome.get(nome);
    const slug = d ? deusSlugById.get(d.id) : undefined;
    if (!d || !slug) return;
    items.push({
      key: `${d.id}-${index}`,
      slug,
      nome: d.nome,
      src: getDeusAssetUrl(d),
    });
  });
  return items;
}
