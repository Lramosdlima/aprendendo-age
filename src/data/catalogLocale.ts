import type { Locale } from "@/i18n/types";
import {
  aldeoes as aldeoesPt,
  construcoes as construcoesPt,
  deuses as deusesPt,
  eras as erasPt,
  godpowers as godpowersPt,
  mapas as mapasPt,
  panteoes as panteoesPt,
  startsBuildOrder as startsBuildOrderPt,
  tecnologias as tecnologiasPt,
  unidades as unidadesPt,
  deusBySlug as deusBySlugPt,
  deusSlugById,
  panteaoBySlug as panteaoBySlugPt,
  panteaoSlugById,
  eraBySlug as eraBySlugPt,
  eraSlugById,
  godpowerBySlug as godpowerBySlugPt,
  godpowerSlugById,
  construcaoBySlug as construcaoBySlugPt,
  construcaoSlugById,
  unidadeBySlug as unidadeBySlugPt,
  unidadeSlugById,
  aldeaoBySlug as aldeaoBySlugPt,
  aldeaoSlugById,
  tecnologiaBySlug as tecnologiaBySlugPt,
  tecnologiaSlugByIndex,
  tecnologiaIndexByNotionId,
  mapaBySlug as mapaBySlugPt,
  mapaSlugByIndex,
  type Mapa,
  type Godpower,
  type Tecnologia,
  type Unidade,
  type StartBuildOrder,
} from "@/data/catalog";

import aldeoesEnJson from "@/data/locale/en/aldeoes.json";
import construcoesEnJson from "@/data/locale/en/construcoes.json";
import deusesEnJson from "@/data/locale/en/deuses_aom.json";
import erasEnJson from "@/data/locale/en/eras.json";
import godpowersEnJson from "@/data/locale/en/godpowers.json";
import mapasEnJson from "@/data/locale/en/mapas.json";
import panteoesEnJson from "@/data/locale/en/panteoes.json";
import startsEnJson from "@/data/locale/en/starts_build_order.json";
import tecnologiasEnJson from "@/data/locale/en/tecnologias.json";
import unidadesEnJson from "@/data/locale/en/unidades_aom.json";

const aldeoesEn = aldeoesEnJson as typeof aldeoesPt;
const construcoesEn = construcoesEnJson as typeof construcoesPt;
const deusesEn = deusesEnJson as typeof deusesPt;
const erasEn = erasEnJson as typeof erasPt;
const godpowersEn = godpowersEnJson as Godpower[];
const mapasEn = mapasEnJson as Mapa[];
const panteoesEn = panteoesEnJson as typeof panteoesPt;
const startsBuildOrderEn = startsEnJson as StartBuildOrder[];
const tecnologiasEn = tecnologiasEnJson as Tecnologia[];
const unidadesEn = unidadesEnJson as Unidade[];

function byIdMap<T extends { id: number }>(items: readonly T[]): Map<number, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function remapSlugMap<T extends { id: number }>(
  ptBySlug: Map<string, T & { id: number }>,
  localizedById: Map<number, T>,
): Map<string, T> {
  const out = new Map<string, T>();
  for (const [slug, ptEntity] of ptBySlug) {
    out.set(slug, localizedById.get(ptEntity.id) ?? (ptEntity as unknown as T));
  }
  return out;
}

function remapIndexSlugMap<T>(
  ptBySlug: Map<string, T>,
  ptItems: readonly T[],
  localizedItems: readonly T[],
): Map<string, T> {
  const out = new Map<string, T>();
  for (const [slug, ptEntity] of ptBySlug) {
    const idx = ptItems.indexOf(ptEntity);
    out.set(slug, idx >= 0 ? localizedItems[idx]! : ptEntity);
  }
  return out;
}

export type LocaleCatalog = {
  locale: Locale;
  aldeoes: typeof aldeoesPt;
  construcoes: typeof construcoesPt;
  deuses: typeof deusesPt;
  eras: typeof erasPt;
  godpowers: Godpower[];
  mapas: Mapa[];
  panteoes: typeof panteoesPt;
  startsBuildOrder: StartBuildOrder[];
  tecnologias: Tecnologia[];
  unidades: Unidade[];
  deusById: Map<number, (typeof deusesPt)[number]>;
  panteaoById: Map<number, (typeof panteoesPt)[number]>;
  eraById: Map<number, (typeof erasPt)[number]>;
  godpowerById: Map<number, Godpower>;
  construcaoById: Map<number, (typeof construcoesPt)[number]>;
  unidadeById: Map<number, Unidade>;
  aldeaoById: Map<number, (typeof aldeoesPt)[number]>;
  startById: Map<number, StartBuildOrder>;
  startBySlug: Map<string, StartBuildOrder>;
  deusBySlug: Map<string, (typeof deusesPt)[number]>;
  deusSlugById: Map<number, string>;
  panteaoBySlug: Map<string, (typeof panteoesPt)[number]>;
  panteaoSlugById: Map<number, string>;
  eraBySlug: Map<string, (typeof erasPt)[number]>;
  eraSlugById: Map<number, string>;
  godpowerBySlug: Map<string, Godpower>;
  godpowerSlugById: Map<number, string>;
  construcaoBySlug: Map<string, (typeof construcoesPt)[number]>;
  construcaoSlugById: Map<number, string>;
  unidadeBySlug: Map<string, Unidade>;
  unidadeSlugById: Map<number, string>;
  aldeaoBySlug: Map<string, (typeof aldeoesPt)[number]>;
  aldeaoSlugById: Map<number, string>;
  tecnologiaBySlug: Map<string, Tecnologia>;
  tecnologiaSlugByIndex: Map<number, string>;
  tecnologiaIndexByNotionId: Map<string, number>;
  mapaBySlug: Map<string, Mapa>;
  mapaSlugByIndex: Map<number, string>;
};

function buildPtCatalog(): LocaleCatalog {
  const deusById = byIdMap(deusesPt);
  const panteaoById = byIdMap(panteoesPt);
  const eraById = byIdMap(erasPt);
  const godpowerById = byIdMap(godpowersPt);
  const construcaoById = byIdMap(construcoesPt);
  const unidadeById = byIdMap(unidadesPt);
  const aldeaoById = byIdMap(aldeoesPt);
  const startById = new Map(startsBuildOrderPt.map((s) => [s.id, s]));
  const startBySlug = new Map(startsBuildOrderPt.map((s) => [s.slug, s]));

  return {
    locale: "pt",
    aldeoes: aldeoesPt,
    construcoes: construcoesPt,
    deuses: deusesPt,
    eras: erasPt,
    godpowers: godpowersPt,
    mapas: mapasPt,
    panteoes: panteoesPt,
    startsBuildOrder: startsBuildOrderPt,
    tecnologias: tecnologiasPt,
    unidades: unidadesPt,
    deusById,
    panteaoById,
    eraById,
    godpowerById,
    construcaoById,
    unidadeById,
    aldeaoById,
    startById,
    startBySlug,
    deusBySlug: deusBySlugPt,
    deusSlugById,
    panteaoBySlug: panteaoBySlugPt,
    panteaoSlugById,
    eraBySlug: eraBySlugPt,
    eraSlugById,
    godpowerBySlug: godpowerBySlugPt,
    godpowerSlugById,
    construcaoBySlug: construcaoBySlugPt,
    construcaoSlugById,
    unidadeBySlug: unidadeBySlugPt,
    unidadeSlugById,
    aldeaoBySlug: aldeaoBySlugPt,
    aldeaoSlugById,
    tecnologiaBySlug: tecnologiaBySlugPt,
    tecnologiaSlugByIndex,
    tecnologiaIndexByNotionId,
    mapaBySlug: mapaBySlugPt,
    mapaSlugByIndex,
  };
}

function buildEnCatalog(): LocaleCatalog {
  const deusById = byIdMap(deusesEn);
  const panteaoById = byIdMap(panteoesEn);
  const eraById = byIdMap(erasEn);
  const godpowerById = byIdMap(godpowersEn);
  const construcaoById = byIdMap(construcoesEn);
  const unidadeById = byIdMap(unidadesEn);
  const aldeaoById = byIdMap(aldeoesEn);
  const startById = new Map(startsBuildOrderEn.map((s) => [s.id, s]));
  const startBySlug = new Map(startsBuildOrderEn.map((s) => [s.slug, s]));

  return {
    locale: "en",
    aldeoes: aldeoesEn,
    construcoes: construcoesEn,
    deuses: deusesEn,
    eras: erasEn,
    godpowers: godpowersEn,
    mapas: mapasEn,
    panteoes: panteoesEn,
    startsBuildOrder: startsBuildOrderEn,
    tecnologias: tecnologiasEn,
    unidades: unidadesEn,
    deusById,
    panteaoById,
    eraById,
    godpowerById,
    construcaoById,
    unidadeById,
    aldeaoById,
    startById,
    startBySlug,
    deusBySlug: remapSlugMap(deusBySlugPt, deusById),
    deusSlugById,
    panteaoBySlug: remapSlugMap(panteaoBySlugPt, panteaoById),
    panteaoSlugById,
    eraBySlug: remapSlugMap(eraBySlugPt, eraById),
    eraSlugById,
    godpowerBySlug: remapSlugMap(godpowerBySlugPt, godpowerById),
    godpowerSlugById,
    construcaoBySlug: remapSlugMap(construcaoBySlugPt, construcaoById),
    construcaoSlugById,
    unidadeBySlug: remapSlugMap(unidadeBySlugPt, unidadeById),
    unidadeSlugById,
    aldeaoBySlug: remapSlugMap(aldeaoBySlugPt, aldeaoById),
    aldeaoSlugById,
    tecnologiaBySlug: remapIndexSlugMap(tecnologiaBySlugPt, tecnologiasPt, tecnologiasEn),
    tecnologiaSlugByIndex,
    tecnologiaIndexByNotionId,
    mapaBySlug: remapIndexSlugMap(mapaBySlugPt, mapasPt, mapasEn),
    mapaSlugByIndex,
  };
}

const catalogs: Record<Locale, LocaleCatalog> = {
  pt: buildPtCatalog(),
  en: buildEnCatalog(),
};

export function getLocaleCatalog(locale: Locale): LocaleCatalog {
  return catalogs[locale];
}

/** Nome de exibição localizado; em PT mostra subtítulo inglês se existir. */
export function entityDisplayDescription(
  entity: { nome: string; ingles?: string | null },
  locale: Locale,
  t: (key: string, params?: Record<string, string | number>) => string,
): string | undefined {
  if (locale === "en") return undefined;
  if (entity.ingles && entity.ingles !== entity.nome) {
    return t("common.englishName", { name: entity.ingles });
  }
  return undefined;
}
