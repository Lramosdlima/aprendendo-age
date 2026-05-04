export type RankGuideStep = { label: string; rr: string };

export type RankGuideTier = {
  id: string;
  token: string;
  rankName: string;
  eraName: string;
  rrBand: string;
  playerShare: string;
  narrative: string[];
  steps: RankGuideStep[];
  surfaceClass: string;
  titleClass: string;
  stepRing: string;
  stepAccent: string;
};

/** Mesmos dados da secção TierAchievement em `RankPage`. */
export const RANK_GUIDE_TIERS: RankGuideTier[] = [
  {
    id: "bronze",
    token: "aomr_archaic_age_icon",
    rankName: "Bronze",
    eraName: "Arcáico",
    rrBand: "0 – 999 RR",
    playerShare: "≈ 46,9%",
    narrative: ["Quase metade dos jogadores.", "Elo inicial, aprendizado, retorno ao jogo."],
    steps: [
      { label: "Bronze III", rr: "0–799" },
      { label: "Bronze II", rr: "800–899" },
      { label: "Bronze I", rr: "900–999" },
    ],
    surfaceClass:
      "bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(180,83,9,0.22),transparent)] bg-zinc-950 ring-1 ring-amber-900/35",
    titleClass: "text-amber-100",
    stepRing: "ring-amber-600/40",
    stepAccent: "text-amber-200/95",
  },
  {
    id: "prata",
    token: "aomr_classical_age_icon",
    rankName: "Prata",
    eraName: "Clássico",
    rrBand: "1000 – 1299 RR",
    playerShare: "≈ 36,7%",
    narrative: ["Maior concentração ativa.", "Jogadores casuais, mas ainda inconsistentes."],
    steps: [
      { label: "Prata III", rr: "1000–1099" },
      { label: "Prata II", rr: "1100–1199" },
      { label: "Prata I", rr: "1200–1299" },
    ],
    surfaceClass:
      "bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,rgba(161,161,170,0.2),transparent)] bg-zinc-950 ring-1 ring-zinc-500/30",
    titleClass: "text-zinc-100",
    stepRing: "ring-zinc-500/45",
    stepAccent: "text-zinc-200",
  },
  {
    id: "ouro",
    token: "aomr_heroic_age_icon",
    rankName: "Ouro",
    eraName: "Heróico",
    rrBand: "1300 – 1599 RR",
    playerShare: "≈ 11,7%",
    narrative: ["Acima da média!", "Aqui o jogador já “joga bem”."],
    steps: [
      { label: "Ouro III", rr: "1300–1399" },
      { label: "Ouro II", rr: "1400–1499" },
      { label: "Ouro I", rr: "1500–1599" },
    ],
    surfaceClass:
      "bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,rgba(234,179,8,0.18),transparent)] bg-zinc-950 ring-1 ring-amber-500/25",
    titleClass: "text-amber-50",
    stepRing: "ring-amber-400/35",
    stepAccent: "text-amber-200",
  },
  {
    id: "esmeralda",
    token: "aomr_mythic_age_icon",
    rankName: "Esmeralda",
    eraName: "Mítico",
    rrBand: "1600 – 1799 RR",
    playerShare: "≈ 3,0%",
    narrative: ["Jogadores fortes!", "Já começa a rarear bastante na distribuição."],
    steps: [
      { label: "Esmeralda III", rr: "1600–1699" },
      { label: "Esmeralda II", rr: "1700–1749" },
      { label: "Esmeralda I", rr: "1750–1799" },
    ],
    surfaceClass:
      "bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,rgba(16,185,129,0.16),transparent)] bg-zinc-950 ring-1 ring-emerald-700/30",
    titleClass: "text-emerald-100",
    stepRing: "ring-emerald-500/40",
    stepAccent: "text-emerald-200/95",
  },
  {
    id: "diamante",
    token: "aomr_wonder_age_icon",
    rankName: "Diamante",
    eraName: "Divino",
    rrBand: "1800 – +",
    playerShare: "≈ 1,7%",
    narrative: ["Elite do jogo!", "A parte final representa os melhores ~10% dos jogadores — prestígio real!"],
    steps: [
      { label: "Diamante III", rr: "1800–1899" },
      { label: "Diamante II", rr: "1900–1999" },
      { label: "Diamante I", rr: "2000+" },
    ],
    surfaceClass:
      "bg-[radial-gradient(ellipse_75%_50%_at_50%_15%,rgba(56,189,248,0.2),transparent)] bg-zinc-950 ring-1 ring-sky-500/35",
    titleClass: "text-sky-100",
    stepRing: "ring-sky-400/45",
    stepAccent: "text-sky-200",
  },
];
