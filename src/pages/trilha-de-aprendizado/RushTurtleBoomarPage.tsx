import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { cn } from "@/lib/cn";

import { TrilhaCallout } from "./TrilhaCallout";
import { rushTurtleBoomarImg } from "./trilhaAssets";

const PROF_AJAX_VIDEO = "https://www.youtube.com/embed/-N9ntWXsKWs";

type PlaystyleMode = "rush" | "turtle" | "eco";

type PlaystyleModeConfig = {
  id: PlaystyleMode;
  labelKey: string;
  shortKey: string;
  statKey: "rush" | "turtle" | "eco";
  img: string;
  tabActive: string;
  tabIdle: string;
  accent: string;
  bar: string;
  ring: string;
};

const PLAYSTYLE_MODE_STYLE: PlaystyleModeConfig[] = [
  {
    id: "rush",
    labelKey: "pages.trilha.rush.modeRush",
    shortKey: "pages.trilha.rush.modeRushShort",
    statKey: "rush",
    img: "Modo_Aggro.png",
    tabActive: "border-pink-500/70 bg-pink-950/50 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.15)]",
    tabIdle: "border-zinc-700/80 bg-zinc-900/40 text-zinc-400 hover:border-pink-800/50 hover:text-pink-200",
    accent: "text-pink-300",
    bar: "bg-pink-400",
    ring: "ring-pink-500/30",
  },
  {
    id: "turtle",
    labelKey: "pages.trilha.rush.modeTurtle",
    shortKey: "pages.trilha.rush.modeTurtleShort",
    statKey: "turtle",
    img: "Modo_Turtle.png",
    tabActive: "border-teal-500/70 bg-teal-950/45 text-teal-100 shadow-[0_0_20px_rgba(45,212,191,0.12)]",
    tabIdle: "border-zinc-700/80 bg-zinc-900/40 text-zinc-400 hover:border-teal-800/50 hover:text-teal-200",
    accent: "text-teal-300",
    bar: "bg-teal-400",
    ring: "ring-teal-500/30",
  },
  {
    id: "eco",
    labelKey: "pages.trilha.rush.modeEco",
    shortKey: "pages.trilha.rush.modeEcoShort",
    statKey: "eco",
    img: "Modo_Eco.png",
    tabActive: "border-blue-500/70 bg-blue-950/45 text-blue-100 shadow-[0_0_20px_rgba(96,165,250,0.12)]",
    tabIdle: "border-zinc-700/80 bg-zinc-900/40 text-zinc-400 hover:border-blue-800/50 hover:text-blue-200",
    accent: "text-blue-300",
    bar: "bg-blue-400",
    ring: "ring-blue-500/30",
  },
];

function isMajorGod(hierarquia: string | undefined): boolean {
  const h = hierarquia?.toLowerCase();
  return h === "maior" || h === "major";
}

function scoreLabel(n: number, t: (key: string) => string): string {
  switch (n) {
    case 5:
      return t("pages.trilha.rush.scoreExcellent");
    case 4:
      return t("pages.trilha.rush.scoreGreat");
    case 3:
      return t("pages.trilha.rush.scoreGood");
    case 2:
      return t("pages.trilha.rush.scoreBad");
    case 1:
      return t("pages.trilha.rush.scoreTerrible");
    default:
      return String(n);
  }
}

function ScoreBar({ score, barClass }: { score: number; barClass: string }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-3 rounded-full sm:w-4", i <= score ? barClass : "bg-zinc-800")}
        />
      ))}
    </div>
  );
}

function MajorGodsTop10({
  mode,
  locale,
}: {
  mode: PlaystyleModeConfig & { label: string; short: string };
  locale: string;
}) {
  const { deuses, deusSlugById } = useCatalog();
  const { t } = useTranslation();

  const top10 = useMemo(() => {
    const key = mode.statKey;
    return deuses
      .filter((d) => isMajorGod(d.hierarquia) && typeof d[key] === "number")
      .sort((a, b) => (b[key] as number) - (a[key] as number) || a.nome.localeCompare(b.nome, locale))
      .slice(0, 10);
  }, [deuses, mode.statKey, locale]);

  return (
    <ol className="space-y-2">
      {top10.map((deus, index) => {
        const score = deus[mode.statKey] as number;
        const portrait = getDeusAssetUrl(deus);
        const rank = index + 1;
        const isPodium = rank <= 3;

        return (
          <li key={deus.id}>
            <Link
              to={`/deuses/${deusSlugById.get(deus.id) ?? deus.id}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                "border-zinc-800/90 bg-zinc-950/50 hover:border-zinc-600 hover:bg-zinc-900/70",
                isPodium && `ring-1 ${mode.ring}`,
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
                  isPodium ? "bg-zinc-800/90 text-amber-100" : "bg-zinc-900 text-zinc-500",
                )}
              >
                {rank}
              </span>
              {portrait ? (
                <img
                  src={portrait}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-zinc-700/80 object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900 text-xs text-zinc-600">
                  ?
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-amber-100/95 group-hover:text-amber-50">{deus.nome}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <ScoreBar score={score} barClass={mode.bar} />
                  <span className={cn("text-xs tabular-nums", mode.accent)}>
                    {score}/5 · {scoreLabel(score, t)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function RushTurtleBoomarPage() {
  const { t, locale } = useTranslation();
  const [modeId, setModeId] = useState<PlaystyleMode>("rush");

  const modes = PLAYSTYLE_MODE_STYLE.map((m) => ({
    ...m,
    label: t(m.labelKey),
    short: t(m.shortKey),
  }));
  const mode = modes.find((m) => m.id === modeId) ?? modes[0]!;

  return (
    <div>
      <BackLink to="/trilha-de-aprendizado">{t("pages.trilha.backLink")}</BackLink>
      <PageHeader title={t("pages.trilha.rush.title")} description={t("pages.trilha.rush.description")} />

      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <p>{t("pages.trilha.rush.intro")}</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-zinc-500">
          <li>
            {t("pages.trilha.rush.playAggressive")}{" "}
            <img
              src={rushTurtleBoomarImg("Modo_Aggro.png")}
              alt=""
              className="inline-block h-7 w-7 align-[-0.15em] rounded object-contain sm:h-8 sm:w-8"
            />
            ;
          </li>
          <li>
            {t("pages.trilha.rush.playEconomic")}{" "}
            <img
              src={rushTurtleBoomarImg("Modo_Eco.png")}
              alt=""
              className="inline-block h-7 w-7 align-[-0.15em] rounded object-contain sm:h-8 sm:w-8"
            />
            ;
          </li>
          <li>
            {t("pages.trilha.rush.playDefensive")}{" "}
            <img
              src={rushTurtleBoomarImg("Modo_Turtle.png")}
              alt=""
              className="inline-block h-7 w-7 align-[-0.15em] rounded object-contain sm:h-8 sm:w-8"
            />
            .
          </li>
        </ul>
        <p>{t("pages.trilha.rush.rockPaperScissors")}</p>
        <p>{t("pages.trilha.rush.summary")}</p>

        <TrilhaCallout variant="gray" icon="💡">
          <p className="font-medium text-zinc-200">{t("pages.trilha.rush.tipTitle")}</p>
          <p>{t("pages.trilha.rush.tipP1")}</p>
          <p>{t("pages.trilha.rush.tipP2")}</p>
          <p>{t("pages.trilha.rush.tipP3")}</p>
        </TrilhaCallout>

        <p>{t("pages.trilha.rush.watchVideo")}</p>

        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
          <iframe
            title={t("pages.trilha.rush.ajaxRef")}
            src={PROF_AJAX_VIDEO}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <blockquote className="border-l-2 border-zinc-600 pl-4 text-zinc-400">
          <strong className="text-zinc-300">{t("pages.trilha.rush.referenceLabel")}</strong> Professor Ajax
        </blockquote>

        <section className="rounded-xl border border-pink-900/40 bg-pink-950/20 p-5">
          <div className="flex flex-row items-start gap-4 sm:gap-5">
            <img
              src={rushTurtleBoomarImg("Modo_Aggro.png")}
              alt={t("pages.trilha.rush.rushIllustrationAlt")}
              className="w-24 shrink-0 self-start rounded-lg border border-aom-border object-contain sm:w-36"
            />
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-pink-200">
                {t("pages.trilha.rush.rushTitle")}
              </h2>
              <p>{t("pages.trilha.rush.rushDesc")}</p>
              <p>
                <span className="text-emerald-400">{t("pages.trilha.rush.prosLabel")}</span> {t("pages.trilha.rush.rushPros")}
              </p>
              <p>
                <span className="text-red-400">{t("pages.trilha.rush.consLabel")}</span> {t("pages.trilha.rush.rushCons")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-5">
          <div className="flex flex-row items-start gap-4 sm:gap-5">
            <img
              src={rushTurtleBoomarImg("Modo_Turtle.png")}
              alt={t("pages.trilha.rush.turtleIllustrationAlt")}
              className="w-24 shrink-0 self-start rounded-lg border border-aom-border object-contain sm:w-36"
            />
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-teal-200">
                {t("pages.trilha.rush.turtleTitle")}
              </h2>
              <p>{t("pages.trilha.rush.turtleDesc")}</p>
              <p>
                <span className="text-emerald-400">{t("pages.trilha.rush.prosLabel")}</span> {t("pages.trilha.rush.turtlePros")}
              </p>
              <p>
                <span className="text-red-400">{t("pages.trilha.rush.consLabel")}</span> {t("pages.trilha.rush.turtleCons")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-900/40 bg-blue-950/25 p-5">
          <div className="flex flex-row items-start gap-4 sm:gap-5">
            <img
              src={rushTurtleBoomarImg("Modo_Eco.png")}
              alt={t("pages.trilha.rush.ecoIllustrationAlt")}
              className="w-24 shrink-0 self-start rounded-lg border border-aom-border object-contain sm:w-36"
            />
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-blue-200">
                {t("pages.trilha.rush.ecoTitle")}
              </h2>
              <p>{t("pages.trilha.rush.ecoDesc")}</p>
              <p>
                <span className="text-emerald-400">{t("pages.trilha.rush.prosLabel")}</span> {t("pages.trilha.rush.ecoPros")}
              </p>
              <p>
                <span className="text-red-400">{t("pages.trilha.rush.consLabel")}</span> {t("pages.trilha.rush.ecoCons")}
              </p>
            </div>
          </div>
        </section>

        <img
          src={rushTurtleBoomarImg("Contra - RTS Estratégia.png")}
          alt={t("pages.trilha.rush.counterDiagramAlt")}
          className="mt-4 max-w-full rounded-lg border border-aom-border"
        />

        <section className="rounded-2xl border border-amber-900/35 bg-gradient-to-b from-zinc-950/80 to-zinc-950/40 p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
                {t("pages.trilha.rush.top10Title")}
              </h2>
              <p className="mt-1 max-w-xl text-zinc-400">
                {t("pages.trilha.rush.top10Desc")}{" "}
                <Link className="text-amber-200 underline hover:text-amber-50" to="/deuses">
                  {t("nav.gods")}
                </Link>
                .
              </p>
            </div>
            <img
              src={rushTurtleBoomarImg(mode.img)}
              alt=""
              className="hidden h-14 w-14 shrink-0 rounded-lg border border-aom-border object-contain sm:block"
            />
          </div>

          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label={t("pages.trilha.rush.archetypeRanking")}>
            {modes.map((m) => {
              const active = m.id === modeId;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setModeId(m.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    active ? m.tabActive : m.tabIdle,
                  )}
                >
                  <img src={rushTurtleBoomarImg(m.img)} alt="" className="h-6 w-6 rounded object-contain" />
                  {m.short}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" aria-label={t("pages.trilha.rush.top10Panel", { mode: mode.label })}>
            <p className="mb-3 text-xs text-zinc-500">
              {t("pages.trilha.rush.sortedBy", { mode: mode.short })}
            </p>
            <MajorGodsTop10 mode={mode} locale={locale === "en" ? "en" : "pt"} />
          </div>
        </section>
      </div>
    </div>
  );
}
