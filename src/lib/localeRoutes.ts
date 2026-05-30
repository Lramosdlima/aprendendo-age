import type { Locale } from "@/i18n/types";

/** Seções de catálogo com listagem + detalhe por slug. */
export type LocaleSection =
  | "panteoes"
  | "deuses"
  | "eras"
  | "poderes"
  | "construcoes"
  | "unidades"
  | "aldeoes"
  | "mapas"
  | "tecnologias"
  | "starts";

const SECTION_SEGMENT: Record<Locale, Record<LocaleSection, string>> = {
  pt: {
    panteoes: "panteoes",
    deuses: "deuses",
    eras: "eras",
    poderes: "poderes",
    construcoes: "construcoes",
    unidades: "unidades",
    aldeoes: "aldeoes",
    mapas: "mapas",
    tecnologias: "tecnologias",
    starts: "starts",
  },
  en: {
    panteoes: "pantheons",
    deuses: "gods",
    eras: "ages",
    poderes: "god-powers",
    construcoes: "buildings",
    unidades: "units",
    aldeoes: "villagers",
    mapas: "maps",
    tecnologias: "technologies",
    starts: "starts",
  },
};

const SEGMENT_TO_SECTION = new Map<string, LocaleSection>(
  (["pt", "en"] as Locale[]).flatMap((locale) =>
    (Object.entries(SECTION_SEGMENT[locale]) as [LocaleSection, string][]).map(([section, segment]) => [
      segment,
      section,
    ]),
  ),
);

export function localeSectionSegment(locale: Locale, section: LocaleSection): string {
  return SECTION_SEGMENT[locale][section];
}

/** Path de listagem ou detalhe (`/tecnologias` ou `/technologies/labirinto-de-minos`). Slugs permanecem PT-canônicos. */
export function localeSectionPath(locale: Locale, section: LocaleSection, slug?: string | number): string {
  const base = `/${localeSectionSegment(locale, section)}`;
  if (slug == null || slug === "") return base;
  return `${base}/${slug}`;
}

export function allSectionPathSegments(section: LocaleSection): string[] {
  return [SECTION_SEGMENT.pt[section], SECTION_SEGMENT.en[section]];
}

export function sectionFromPathSegment(segment: string): LocaleSection | undefined {
  return SEGMENT_TO_SECTION.get(segment);
}

/** Converte path entre PT/EN preservando slug e query (ex.: `/technologies/foo` → `/tecnologias/foo`). */
export function swapLocaleInPath(pathname: string, toLocale: Locale): string {
  const q = pathname.indexOf("?");
  const pathOnly = q === -1 ? pathname : pathname.slice(0, q);
  const search = q === -1 ? "" : pathname.slice(q);
  const parts = pathOnly.split("/").filter(Boolean);
  if (parts.length === 0) return `/${search}`;

  const section = sectionFromPathSegment(parts[0]!);
  if (!section) return `${pathname}`;

  const fromLocale: Locale = toLocale === "pt" ? "en" : "pt";
  if (parts[0] !== SECTION_SEGMENT[fromLocale][section]) return `${pathname}`;

  parts[0] = SECTION_SEGMENT[toLocale][section];
  return `/${parts.join("/")}${search}`;
}
