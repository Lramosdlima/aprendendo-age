import {
  construcaoById,
  construcaoSlugById,
  deusById,
  deusSlugById,
  eraById,
  eraSlugById,
  godpowerById,
  godpowerSlugById,
  panteaoById,
  panteaoSlugById,
  tecnologias,
  tecnologiaSlugByIndex,
  unidadeById,
  unidadeSlugById,
} from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";
import { getConstrucaoAssetUrl, getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";
import type { EntityNumRef, EntityStrRef } from "@/lib/entityRefs";

export type EntityLinkKind =
  | "deus"
  | "panteao"
  | "era"
  | "godpower"
  | "unidade"
  | "tecnologia"
  | "construcao";

export type ResolvedEntityLink = {
  kind: EntityLinkKind;
  to: string;
  label: string;
  imageSrc?: string;
};

function tecnologiaIndexByNome(nome: string): number {
  return tecnologias.findIndex((t) => t.nome === nome);
}

export function resolveDeusLink(id: number, label?: string): ResolvedEntityLink | null {
  const d = deusById.get(id);
  if (!d) return null;
  return {
    kind: "deus",
    to: `/deuses/${deusSlugById.get(id) ?? id}`,
    label: label ?? d.nome,
    imageSrc: getDeusAssetUrl(d),
  };
}

export function resolvePanteaoLink(id: number, label?: string): ResolvedEntityLink | null {
  const p = panteaoById.get(id);
  if (!p) return null;
  return {
    kind: "panteao",
    to: `/panteoes/${panteaoSlugById.get(id) ?? id}`,
    label: label ?? p.nome,
    imageSrc: getPantheonWatermarkUrl(p),
  };
}

export function resolveEraLink(id: number, label?: string): ResolvedEntityLink | null {
  const e = eraById.get(id);
  if (!e) return null;
  return {
    kind: "era",
    to: `/eras/${eraSlugById.get(id) ?? id}`,
    label: label ?? e.nome,
    imageSrc: getEraAssetUrl(e),
  };
}

export function resolveGodpowerLink(id: number, label?: string): ResolvedEntityLink | null {
  const g = godpowerById.get(id);
  if (!g) return null;
  return {
    kind: "godpower",
    to: `/poderes/${godpowerSlugById.get(id) ?? id}`,
    label: label ?? g.nome,
    imageSrc: getGodPowerAssetUrl(g),
  };
}

export function resolveUnidadeLink(id: number, label?: string): ResolvedEntityLink | null {
  const u = unidadeById.get(id);
  if (!u) return null;
  return {
    kind: "unidade",
    to: `/unidades/${unidadeSlugById.get(id) ?? id}`,
    label: label ?? u.nome,
    imageSrc: getUnidadeAssetUrl(u),
  };
}

export function resolveConstrucaoLink(id: number, label?: string): ResolvedEntityLink | null {
  const c = construcaoById.get(id);
  if (!c) return null;
  return {
    kind: "construcao",
    to: `/construcoes/${construcaoSlugById.get(id) ?? id}`,
    label: label ?? c.nome,
    imageSrc: getConstrucaoAssetUrl(c),
  };
}

export function resolveTecnologiaLink(ref: EntityStrRef): ResolvedEntityLink | null {
  const ti = tecnologiaIndexByNome(ref.nome);
  if (ti < 0) return null;
  return resolveTecnologiaLinkByIndex(ti, ref.nome);
}

export function resolveTecnologiaLinkByIndex(index: number, label?: string): ResolvedEntityLink | null {
  const t = tecnologias[index];
  if (!t) return null;
  const slug = tecnologiaSlugByIndex.get(index);
  if (!slug) return null;
  return {
    kind: "tecnologia",
    to: `/tecnologias/${slug}`,
    label: label ?? t.nome,
    imageSrc: getTecnologiaAssetUrl(t),
  };
}

/** Resolve `{ id, nome }` numérico conforme o tipo de entidade. */
export function resolveEntityNumRef(kind: Exclude<EntityLinkKind, "tecnologia">, ref: EntityNumRef): ResolvedEntityLink | null {
  switch (kind) {
    case "deus":
      return resolveDeusLink(ref.id, ref.nome);
    case "panteao":
      return resolvePanteaoLink(ref.id, ref.nome);
    case "era":
      return resolveEraLink(ref.id, ref.nome);
    case "godpower":
      return resolveGodpowerLink(ref.id, ref.nome);
    case "unidade":
      return resolveUnidadeLink(ref.id, ref.nome);
    case "construcao":
      return resolveConstrucaoLink(ref.id, ref.nome);
    default:
      return null;
  }
}
