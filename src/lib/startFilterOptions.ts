import type { StartBuildOrder } from "@/data/catalog";
import type { LocaleCatalog } from "@/data/catalogLocale";
import { deuses } from "@/data/catalog";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import { START_GOD_NAME_ALIASES, resolveStartGodPortraitItems } from "@/lib/startGodPortraits";

export type StartFilterKind = "pantheon" | "god";

export type StartFilterOption = {
  key: string;
  kind: StartFilterKind;
  label: string;
  iconSrc?: string;
  /** Cor de fundo do chip (tinte do panteão). */
  tint?: string;
};

const deusByNome = new Map(deuses.map((d) => [d.nome, d] as const));

export function canonicalStartGodName(label: string): string {
  return START_GOD_NAME_ALIASES[label] ?? label;
}

export function startHasGod(s: StartBuildOrder, canonicalName: string): boolean {
  return s.god.some((g) => canonicalStartGodName(g) === canonicalName);
}

export function matchesStartFilter(s: StartBuildOrder, filterKey: string | null): boolean {
  if (!filterKey) return true;
  if (filterKey.startsWith("pantheon:")) {
    return s.pantheon === filterKey.slice("pantheon:".length);
  }
  if (filterKey.startsWith("god:")) {
    return startHasGod(s, filterKey.slice("god:".length));
  }
  return true;
}

export function buildStartFilterOptions(
  starts: StartBuildOrder[],
  panteoes: LocaleCatalog["panteoes"],
): StartFilterOption[] {
  const pantheonNames = new Set<string>();
  const godNames = new Set<string>();

  for (const s of starts) {
    if (s.pantheon) pantheonNames.add(s.pantheon);
    for (const g of s.god) godNames.add(canonicalStartGodName(g));
  }

  const panteaoByNome = new Map(panteoes.map((p) => [p.nome, p] as const));

  const pantheons: StartFilterOption[] = [...pantheonNames]
    .sort((a, b) => a.localeCompare(b, "pt"))
    .map((nome) => {
      const panteao = panteaoByNome.get(nome);
      return {
        key: `pantheon:${nome}`,
        kind: "pantheon" as const,
        label: nome,
        iconSrc: panteao ? getPantheonWatermarkUrl(panteao) : undefined,
        tint: pantheonCardTint(nome),
      };
    });

  const gods: StartFilterOption[] = [...godNames]
    .sort((a, b) => a.localeCompare(b, "pt"))
    .map((nome) => {
      const portrait = resolveStartGodPortraitItems([nome])[0];
      const deus = deusByNome.get(nome);
      const panteaoNome = deus?.panteao?.[0]?.nome;
      return {
        key: `god:${nome}`,
        kind: "god" as const,
        label: nome,
        iconSrc: portrait?.src ?? undefined,
        tint: panteaoNome ? pantheonCardTint(panteaoNome) : undefined,
      };
    });

  return [...pantheons, ...gods];
}
