import { Link } from "react-router-dom";

import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./trilha-de-aprendizado/TrilhaCallout";

type RankStep = { label: string; rr: string };

type RankTier = {
  id: string;
  token: string;
  rankName: string;
  eraName: string;
  rrBand: string;
  playerShare: string;
  narrative: string[];
  steps: RankStep[];
  /** Tailwind gradient stops (background). */
  surfaceClass: string;
  titleClass: string;
  stepRing: string;
  stepAccent: string;
};

const AOMSTATS_PROFILES = "https://aomstats.io/profiles?s=";
const FORM_RETOLD = "https://form-retold.vercel.app/";

const TIERS: RankTier[] = [
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
    narrative: ["Maior concentração ativa.", "Jogadores estáveis, mas ainda inconsistentes."],
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
    narrative: ["Acima da média.", "Aqui o jogador já “joga bem”."],
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
    narrative: ["Jogadores fortes.", "Já começa a rarear bastante na distribuição."],
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
    narrative: ["Elite do jogo!", "A parte final representa os melhores ~10% dos jogadores — prestígio real."],
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

function TierAchievement({ tier, index }: { tier: RankTier; index: number }) {
  const iconSrc = getTokenAssetUrl(tier.token);

  return (
    <section
      id={tier.id}
      aria-labelledby={`${tier.id}-heading`}
      className={cn(
        "relative scroll-mt-28 overflow-hidden rounded-3xl border border-aom-border/60 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.85)] md:scroll-mt-24",
        tier.surfaceClass,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M40 0L40 80M0 40L80 40'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative flex min-h-[min(88dvh,52rem)] flex-col items-center justify-center px-4 py-16 sm:px-8 sm:py-20 md:py-24">
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-500">
          Progressão {index + 1} / {TIERS.length}
        </p>

        <div className="relative mb-8 flex items-center justify-center">
          <div
            className={cn(
              "absolute h-[min(52vw,16rem)] w-[min(52vw,16rem)] rounded-full blur-3xl sm:h-72 sm:w-72",
              tier.id === "diamante" && "bg-sky-500/25",
              tier.id === "esmeralda" && "bg-emerald-500/20",
              tier.id === "ouro" && "bg-amber-500/20",
              tier.id === "prata" && "bg-zinc-400/15",
              tier.id === "bronze" && "bg-amber-800/25",
            )}
            aria-hidden
          />
          {iconSrc ? (
            <img
              src={iconSrc}
              alt=""
              className="relative z-[1] h-[min(44vw,13rem)] w-[min(44vw,13rem)] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:h-56 sm:w-56 md:h-64 md:w-64"
              width={256}
              height={256}
            />
          ) : (
            <div className="relative z-[1] flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-zinc-600 bg-zinc-900/80 text-zinc-500">
              —
            </div>
          )}
        </div>

        <div className="relative z-[1] max-w-2xl text-center">
          <h2 id={`${tier.id}-heading`} className={cn("font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl", tier.titleClass)}>
            {tier.rankName}
            <span className="text-zinc-500"> | </span>
            <span className="text-zinc-200">{tier.eraName}</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            Faixa geral: <span className="font-medium text-zinc-200">{tier.rrBand}</span>
            <span className="mx-2 text-zinc-600">·</span>
            Base (amostra): <span className="font-medium text-zinc-200">{tier.playerShare}</span>
          </p>
          <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-zinc-400 sm:text-[0.9375rem]">
            {tier.narrative.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>

        <div className="relative z-[1] mt-12 w-full max-w-3xl">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Subdivisões</p>
          <p className="mb-6 text-center text-[11px] text-zinc-600">Do menor RR ao maior dentro desta divisão (III → I).</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {tier.steps.map((step) => (
              <div
                key={step.label}
                className={cn(
                  "relative z-[1] flex flex-col items-center rounded-2xl border border-aom-border/50 bg-zinc-950/55 px-4 py-5 text-center shadow-inner shadow-black/40 backdrop-blur-sm ring-2 ring-inset",
                  tier.stepRing,
                )}
              >
                <span className={cn("text-sm font-semibold tracking-tight", tier.stepAccent)}>{step.label}</span>
                <span className="mt-2 font-mono text-xs text-zinc-400">{step.rr} RR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RankPage() {
  const headerIcon = getTokenAssetUrl("aomr_wonder_age_icon");

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Veja sua RR em Rank"
        headerIconSrc={headerIcon}
        description={
          <>
            Como ler sua pontuação ranqueada (RR) e onde cada divisão começa — no estilo das eras do jogo, em formato fácil de navegar.
          </>
        }
      />

      <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-[0.9375rem]">
        Para ver o elo, acesse{" "}
        <a
          href={AOMSTATS_PROFILES}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-amber-400/95 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300 [word-break:break-all]"
        >
          aomstats.io/profiles?s=
        </a>
        . Ou, no jogo, abra seu perfil: o ranking aparece como{" "}
        <strong className="text-zinc-100">Pontuação Ranqueada</strong>.
      </p>

      <TrilhaCallout variant="gray" icon={<span aria-hidden>✨</span>}>
        <p>
          <strong className="text-zinc-200">Bordas personalizadas:</strong> existe um sistema experimental para visualizar seu rank com bordas por progresso. Envie seus dados no formulário:{" "}
          <a href={FORM_RETOLD} target="_blank" rel="noreferrer noopener" className="font-medium text-amber-300/95 underline-offset-2 hover:text-amber-200">
            form-retold.vercel.app
          </a>
          .
        </p>
      </TrilhaCallout>

      <nav
        aria-label="Atalhos para divisões"
        className="sticky top-[calc(env(safe-area-inset-top,0px)+4.25rem)] z-20 -mx-1 flex flex-wrap justify-center gap-2 rounded-2xl border border-aom-border/50 bg-zinc-950/90 px-2 py-3 shadow-lg shadow-black/40 backdrop-blur-md sm:top-6 sm:px-4 md:top-8"
      >
        {TIERS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={cn(
              "rounded-full border border-aom-border/60 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-100",
            )}
          >
            {t.rankName}
          </a>
        ))}
      </nav>

      <div className="space-y-12 md:space-y-16">
        {TIERS.map((tier, index) => (
          <TierAchievement key={tier.id} tier={tier} index={index} />
        ))}
      </div>

      <section aria-labelledby="como-funciona-heading" className="rounded-2xl border border-zinc-700/40 bg-zinc-900/40 px-5 py-6 sm:px-8 sm:py-8">
        <h2 id="como-funciona-heading" className="font-[family-name:var(--font-display)] text-xl font-semibold text-zinc-100 sm:text-2xl">
          Como funciona?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Esse sistema experimental foi calibrado com jogadores de elo alto (~2100) do Retold. Referência:{" "}
          <strong className="text-zinc-200">7070 jogadores</strong> (fevereiro/2026).
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-400 marker:text-zinc-600">
          <li>
            <strong className="text-zinc-200">Só 9 jogadores acima de 2100</strong> → ~<strong className="text-zinc-200">0,13%</strong> da base.
          </li>
          <li>
            <strong className="text-zinc-200">Até o jogador #3755 está em elo 999</strong> → mais de <strong className="text-zinc-200">53%</strong> abaixo de 1000.
          </li>
          <li>
            1000 de elo é o centro aproximado da distribuição; o pico absoluto concentra-se em 1000–1050. A jogabilidade a partir de 1000 muda bastante; depois de 1300, a diferença é ainda maior.
          </li>
        </ul>
        <div className="mt-6 space-y-2 border-t border-zinc-700/35 pt-6 text-sm text-zinc-400">
          <p>🔹 A maior parte dos jogadores está em Bronze/Prata.</p>
          <p>🔹 Ouro deve parecer especial e recompensador.</p>
          <p>🔹 Esmeralda separa jogadores fortes de muito fortes.</p>
          <p>🔹 Diamante é pequeno e aspiracional.</p>
        </div>
      </section>

      <p className="text-center text-xs text-zinc-600">
        Conteúdo alinhado ao guia original da trilha. Voltar ao{" "}
        <Link to="/trilha-de-aprendizado" className="text-amber-400/90 underline-offset-2 hover:text-amber-300">
          início da trilha
        </Link>
        .
      </p>
    </div>
  );
}
