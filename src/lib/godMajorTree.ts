import { deuses } from "@/data/catalog";

export type Deus = (typeof deuses)[number];

/** Deuses menores do panteão do major, na ordem de `god_maior_relacao_ids`, agrupados por era de escolha. */
export type GodMajorTreeTiers = {
  classical: Deus[];
  heroic: Deus[];
  mythic: Deus[];
};

/**
 * Agrupa IDs em `god_maior_relacao_ids` por `era_id` do deus menor (Clássica=2, Heróica=3, Mítica=4).
 * Preserva a ordem do array no JSON dentro de cada faixa.
 */
export function bucketMinorsByEra(major: Deus, byId: Map<number, Deus>): GodMajorTreeTiers | null {
  const ids = major.god_maior_relacao_ids;
  if (!ids?.length) return null;

  const classical: Deus[] = [];
  const heroic: Deus[] = [];
  const mythic: Deus[] = [];

  for (const id of ids) {
    const minor = byId.get(id);
    if (!minor || minor.hierarquia !== "Menor") continue;
    switch (minor.era_id) {
      case 2:
        classical.push(minor);
        break;
      case 3:
        heroic.push(minor);
        break;
      case 4:
        mythic.push(minor);
        break;
      default:
        break;
    }
  }

  if (classical.length === 0 && heroic.length === 0 && mythic.length === 0) return null;

  return { classical, heroic, mythic };
}

export function isBinaryMajorTree(t: GodMajorTreeTiers): boolean {
  return t.classical.length === 2 && t.heroic.length === 2 && t.mythic.length === 2;
}
