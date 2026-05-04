export type RankTierId = "bronze" | "prata" | "ouro" | "esmeralda" | "diamante";

export type RankClassification = {
  tierId: RankTierId;
  /** Texto completo da categoria (ex.: Diamante | Titã). */
  categoryLabel: string;
  /** Ex.: Diamante I */
  subcategoryLabel: string;
  hintCategory: string;
  hintSub: string;
  /** Token de ícone da era (borda / identidade visual). */
  ageToken: string;
  avatarGlowClass: string;
  avatarRingClass: string;
};

/** Alinhado ao form-retold (locales pt): Diamante | Titã, etc. */
export function getRankClassification(rr: number): RankClassification {
  if (rr < 1000) {
    const sub =
      rr < 800 ? { label: "Bronze III", hint: "Bronze III → 0 – 799 RR" } : rr < 900 ? { label: "Bronze II", hint: "Bronze II → 800 – 899 RR" } : { label: "Bronze I", hint: "Bronze I → 900 – 999 RR" };
    return {
      tierId: "bronze",
      categoryLabel: "Bronze | Arcáico",
      subcategoryLabel: sub.label,
      hintCategory: "Bronze → Abaixo de 1000 RR",
      hintSub: sub.hint,
      ageToken: "aomr_archaic_age_icon",
      avatarGlowClass: "bg-amber-600/35",
      avatarRingClass: "ring-amber-500/55 border-amber-400/40",
    };
  }
  if (rr < 1300) {
    const sub =
      rr < 1100
        ? { label: "Prata III", hint: "Prata III → 1000 – 1099 RR" }
        : rr < 1200
          ? { label: "Prata II", hint: "Prata II → 1100 – 1199 RR" }
          : { label: "Prata I", hint: "Prata I → 1200 – 1299 RR" };
    return {
      tierId: "prata",
      categoryLabel: "Prata | Clássico",
      subcategoryLabel: sub.label,
      hintCategory: "Prata → 1000 – 1299 RR",
      hintSub: sub.hint,
      ageToken: "aomr_classical_age_icon",
      avatarGlowClass: "bg-zinc-400/25",
      avatarRingClass: "ring-zinc-400/50 border-zinc-300/35",
    };
  }
  if (rr < 1600) {
    const sub =
      rr < 1400
        ? { label: "Ouro III", hint: "Ouro III → 1300 – 1399 RR" }
        : rr < 1500
          ? { label: "Ouro II", hint: "Ouro II → 1400 – 1499 RR" }
          : { label: "Ouro I", hint: "Ouro I → 1500 – 1599 RR" };
    return {
      tierId: "ouro",
      categoryLabel: "Ouro | Heróico",
      subcategoryLabel: sub.label,
      hintCategory: "Ouro → 1300 – 1599 RR",
      hintSub: sub.hint,
      ageToken: "aomr_heroic_age_icon",
      avatarGlowClass: "bg-amber-400/30",
      avatarRingClass: "ring-amber-300/50 border-amber-200/35",
    };
  }
  if (rr < 1800) {
    const sub =
      rr < 1700
        ? { label: "Esmeralda III", hint: "Esmeralda III → 1600 – 1699 RR" }
        : rr < 1750
          ? { label: "Esmeralda II", hint: "Esmeralda II → 1700 – 1749 RR" }
          : { label: "Esmeralda I", hint: "Esmeralda I → 1750 – 1799 RR" };
    return {
      tierId: "esmeralda",
      categoryLabel: "Esmeralda | Mítico",
      subcategoryLabel: sub.label,
      hintCategory: "Esmeralda → 1600 – 1799 RR",
      hintSub: sub.hint,
      ageToken: "aomr_mythic_age_icon",
      avatarGlowClass: "bg-emerald-500/30",
      avatarRingClass: "ring-emerald-400/50 border-emerald-300/35",
    };
  }
  const sub =
    rr < 1900
      ? { label: "Diamante III", hint: "Diamante III → 1800 – 1899 RR" }
      : rr < 2000
        ? { label: "Diamante II", hint: "Diamante II → 1900 – 1999 RR" }
        : { label: "Diamante I", hint: "Diamante I → 2000+ RR" };
  return {
    tierId: "diamante",
    categoryLabel: "Diamante | Titã",
    subcategoryLabel: sub.label,
    hintCategory: "Diamante → 1800+ RR",
    hintSub: sub.hint,
    ageToken: "aomr_wonder_age_icon",
    avatarGlowClass: "bg-sky-500/35",
    avatarRingClass: "ring-sky-400/55 border-sky-300/45",
  };
}
