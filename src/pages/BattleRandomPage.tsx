import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { BattleAgeUpOverlay } from "@/components/battle/BattleAgeUpOverlay";
import { BattleConfirmModal } from "@/components/battle/BattleConfirmModal";
import { BattleUnitPortrait } from "@/components/battle/BattleUnitPortrait";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import type { Unidade } from "@/data/catalog";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildBattleResultIndex,
  buildRoundPlan,
  filterAttackerPool,
  pickDeckHero,
  pickDefender,
  resolvePlayerChoice,
  summarizeRun,
  willAgeUp,
  type BattlePhase,
  type BattleResultIndex,
  type PlayableEraId,
  type RoundOutcome,
  type RoundRecord,
} from "@/lib/battleGame";
import type { PrecomputedBattleResult } from "@/lib/battleSimulator/precompute";
import { cn } from "@/lib/cn";
import { firstNome } from "@/lib/entityRefs";
import { getIconFieldUrl } from "@/lib/notionTokenAssets";
import { NotionText } from "@/components/ui/NotionText";

type LastResult = {
  outcome: RoundOutcome;
  mode: PrecomputedBattleResult["mode"];
  attacker: Unidade;
  defender: Unidade;
};

type CatalogSlice = ReturnType<typeof useCatalog>;

function outcomeClass(outcome: RoundOutcome): string {
  if (outcome === "win") return "border-emerald-500/50 bg-emerald-950/50 text-emerald-200";
  if (outcome === "loss") return "border-rose-500/50 bg-rose-950/50 text-rose-200";
  return "border-amber-500/40 bg-amber-950/40 text-amber-100";
}

function initialDefender(
  units: readonly Unidade[],
  eraId: PlayableEraId,
): { defenderId: number | null; used: number[] } {
  const defender = pickDefender(units, eraId, []);
  return {
    defenderId: defender?.id ?? null,
    used: defender ? [defender.id] : [],
  };
}

export function BattleRandomPage() {
  const { pantheonSlug } = useParams<{ pantheonSlug: string }>();
  const { t } = useTranslation();
  const catalog = useCatalog();
  const { panteaoBySlug } = catalog;

  const pantheon = pantheonSlug ? panteaoBySlug.get(pantheonSlug) : undefined;
  const [index, setIndex] = useState<BattleResultIndex | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [bootKey, setBootKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void import("@/data/unidades_aom_battle_results.json")
      .then((mod) => {
        if (cancelled) return;
        const rows = (mod.default ?? mod) as PrecomputedBattleResult[];
        setIndex(buildBattleResultIndex(rows));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!pantheonSlug || !pantheon) {
    return <Navigate to="/battle/random" replace />;
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 text-rose-100">
        {t("pages.battle.loadError")}
      </div>
    );
  }

  if (!index) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm text-zinc-400">
        {t("pages.battle.loading")}
      </div>
    );
  }

  return (
    <BattleRandomSession
      key={`${pantheon.id}-${bootKey}`}
      pantheon={pantheon}
      index={index}
      catalog={catalog}
      onRestart={() => setBootKey((k) => k + 1)}
    />
  );
}

function BattleRandomSession({
  pantheon,
  index,
  catalog,
  onRestart,
}: {
  pantheon: CatalogSlice["panteoes"][number];
  index: BattleResultIndex;
  catalog: CatalogSlice;
  onRestart: () => void;
}) {
  const { t } = useTranslation();
  const { unidades, unidadeById, eras, eraById } = catalog;
  const plan = useMemo(() => buildRoundPlan(), []);
  const firstEra = (plan[0]?.eraId ?? 2) as PlayableEraId;
  const first = initialDefender(unidades, firstEra);
  const initialHero = pickDeckHero(unidades, pantheon.id, firstEra);

  const [phase, setPhase] = useState<BattlePhase>("playing");
  const [roundIndex, setRoundIndex] = useState(0);
  const [defenderId, setDefenderId] = useState<number | null>(first.defenderId);
  const [usedDefenderIds, setUsedDefenderIds] = useState<number[]>(first.used);
  const [deckHeroId, setDeckHeroId] = useState<number | null>(initialHero?.id ?? null);
  const [pendingAttackerId, setPendingAttackerId] = useState<number | null>(null);
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [ageUpEraId, setAgeUpEraId] = useState<PlayableEraId | null>(null);

  const currentEraId = (plan[roundIndex]?.eraId ?? 2) as PlayableEraId;
  const currentEra = eraById.get(currentEraId);

  const attackerPool = useMemo(
    () => filterAttackerPool(unidades, pantheon.id, currentEraId, deckHeroId),
    [unidades, pantheon.id, currentEraId, deckHeroId],
  );

  const defender = defenderId != null ? unidadeById.get(defenderId) : undefined;
  const pendingAttacker =
    pendingAttackerId != null ? unidadeById.get(pendingAttackerId) : undefined;

  const wins = history.filter((h) => h.outcome === "win").length;
  const losses = history.filter((h) => h.outcome === "loss").length;
  const draws = history.filter((h) => h.outcome === "draw").length;

  const confirmAttack = useCallback(() => {
    if (!pendingAttacker || !defender || phase !== "playing") return;
    const resolved = resolvePlayerChoice(index, pendingAttacker.id, defender.id);
    if (!resolved) return;

    const record: RoundRecord = {
      index: roundIndex,
      eraId: currentEraId,
      defenderId: defender.id,
      attackerId: pendingAttacker.id,
      outcome: resolved.outcome,
      mode: resolved.result.mode,
    };

    setHistory((prev) => [...prev, record]);
    setLastResult({
      outcome: resolved.outcome,
      mode: resolved.result.mode,
      attacker: pendingAttacker,
      defender,
    });
    setPendingAttackerId(null);
    setPhase("result");
  }, [pendingAttacker, defender, phase, index, roundIndex, currentEraId]);

  const continueAfterResult = useCallback(() => {
    const nextIndex = roundIndex + 1;
    if (nextIndex >= plan.length) {
      setPhase("summary");
      return;
    }

    if (willAgeUp(plan, roundIndex)) {
      setAgeUpEraId(plan[nextIndex]!.eraId);
      setPhase("age_up");
      return;
    }

    const nextEra = plan[nextIndex]!.eraId;
    const nextDefender = pickDefender(unidades, nextEra, usedDefenderIds);
    setRoundIndex(nextIndex);
    setDefenderId(nextDefender?.id ?? null);
    if (nextDefender) {
      setUsedDefenderIds((prev) =>
        prev.includes(nextDefender.id) ? prev : [...prev, nextDefender.id],
      );
    }
    setLastResult(null);
    setPhase("playing");
  }, [roundIndex, plan, unidades, usedDefenderIds]);

  const finishAgeUp = useCallback(() => {
    const nextIndex = roundIndex + 1;
    const nextEra = plan[nextIndex]?.eraId ?? currentEraId;
    const nextDefender = pickDefender(unidades, nextEra, usedDefenderIds);
    const nextHero = pickDeckHero(unidades, pantheon.id, nextEra);
    setRoundIndex(nextIndex);
    setDefenderId(nextDefender?.id ?? null);
    setDeckHeroId(nextHero?.id ?? null);
    if (nextDefender) {
      setUsedDefenderIds((prev) =>
        prev.includes(nextDefender.id) ? prev : [...prev, nextDefender.id],
      );
    }
    setAgeUpEraId(null);
    setLastResult(null);
    setPhase("playing");
  }, [roundIndex, plan, currentEraId, unidades, usedDefenderIds, pantheon.id]);

  if (defenderId == null) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 text-rose-100">
        {t("pages.battle.noDefender")}
      </div>
    );
  }

  if (phase === "summary") {
    const summary = summarizeRun(history);
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-amber-100">
          {t("pages.battle.summaryTitle")}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{t("pages.battle.summaryDescription")}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label={t("pages.battle.wins")} value={summary.wins} tone="win" />
          <StatCard label={t("pages.battle.losses")} value={summary.losses} tone="loss" />
          <StatCard label={t("pages.battle.draws")} value={summary.draws} tone="draw" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {([2, 3, 4] as const).map((eraId) => {
            const era = eraById.get(eraId);
            const stats = summary.byEra[eraId];
            return (
              <div key={eraId} className="rounded-xl border border-aom-border bg-zinc-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {era?.nome ?? `Era ${eraId}`}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {t("pages.battle.eraStats", {
                    wins: String(stats.wins),
                    losses: String(stats.losses),
                    draws: String(stats.draws),
                  })}
                </p>
              </div>
            );
          })}
        </div>

        <ul className="mt-6 space-y-2">
          {summary.history.map((row) => {
            const atk = unidadeById.get(row.attackerId);
            const def = unidadeById.get(row.defenderId);
            const era = eras.find((e) => e.id === row.eraId);
            return (
              <li
                key={row.index}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                  outcomeClass(row.outcome),
                )}
              >
                <span className="font-semibold">#{row.index + 1}</span>
                <span className="text-zinc-400">{era?.nome}</span>
                <span>
                  {atk?.nome ?? row.attackerId} → {def?.nome ?? row.defenderId}
                </span>
                <span className="ml-auto font-semibold uppercase">
                  {t(`pages.battle.outcome.${row.outcome}`)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl border border-amber-500/50 bg-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/30"
          >
            {t("pages.battle.playAgain")}
          </button>
          <Link
            to="/battle"
            className="rounded-xl border border-aom-border bg-zinc-900/60 px-4 py-2.5 text-center text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
          >
            {t("pages.battle.backToMenu")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
            {t("pages.battle.randomBattle")}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-50 sm:text-3xl">
            {pantheon.nome}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {t("pages.battle.roundProgress", {
              current: String(roundIndex + 1),
              total: String(plan.length),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ScorePill label={t("pages.battle.wins")} value={wins} tone="win" />
          <ScorePill label={t("pages.battle.losses")} value={losses} tone="loss" />
          <ScorePill label={t("pages.battle.draws")} value={draws} tone="draw" />
        </div>
      </header>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-aom-border bg-zinc-950/70 px-4 py-3">
        {currentEra?.icon ? (
          <img
            src={getIconFieldUrl(currentEra.icon)}
            alt=""
            aria-hidden
            className="size-10 object-contain"
          />
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">{t("pages.battle.currentAge")}</p>
          <p className="font-semibold text-amber-100">{currentEra?.nome ?? `Era ${currentEraId}`}</p>
        </div>
        <div className="ml-auto flex gap-1">
          {plan.map((r) => (
            <span
              key={r.index}
              className={cn(
                "size-2.5 rounded-full",
                r.index < roundIndex
                  ? "bg-amber-400"
                  : r.index === roundIndex
                    ? "bg-amber-200 ring-2 ring-amber-400/40"
                    : "bg-zinc-700",
              )}
              title={`#${r.index + 1}`}
            />
          ))}
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
            {t("pages.battle.yourDeck")}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{t("pages.battle.pickUnitHint")}</p>
          <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {attackerPool.map((u) => (
              <li key={u.id} className="flex justify-center">
                <BattleUnitPortrait
                  nome={u.nome}
                  icon={u.icon}
                  size="sm"
                  disabled={phase !== "playing"}
                  selected={pendingAttackerId === u.id}
                  onClick={() => setPendingAttackerId(u.id)}
                />
              </li>
            ))}
          </ul>
          {attackerPool.length === 0 ? (
            <p className="mt-4 text-sm text-rose-300">{t("pages.battle.emptyDeck")}</p>
          ) : null}
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-amber-400">
            VS
          </span>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300/90">
            {t("pages.battle.enemy")}
          </p>
          {defender ? (
            <div className="mt-4 flex flex-col items-center gap-3 text-center">
              <BattleUnitPortrait nome={defender.nome} icon={defender.icon} size="lg" />
              <p className="font-semibold text-amber-50">{defender.nome}</p>
              <UnidadeTipoLine tipo={defender.tipo} colored className="justify-center" />
              {firstNome(defender.panteao) ? (
                <p className="text-xs text-zinc-400">
                  <NotionText text={firstNome(defender.panteao)!} />
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-400">{t("pages.battle.noDefender")}</p>
          )}
        </div>
      </section>

      {phase === "result" && lastResult ? (
        <div className={cn("mt-6 rounded-2xl border p-5", outcomeClass(lastResult.outcome))}>
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {t(`pages.battle.outcome.${lastResult.outcome}`)}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {lastResult.attacker.nome} vs {lastResult.defender.nome}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider opacity-70">
            {lastResult.mode === "mode_category_battle"
              ? t("pages.battle.modeCategory")
              : t("pages.battle.modeAttributes")}
          </p>
          <button
            type="button"
            onClick={continueAfterResult}
            className="mt-4 rounded-xl border border-white/20 bg-black/25 px-4 py-2.5 text-sm font-semibold transition hover:bg-black/40"
          >
            {roundIndex + 1 >= plan.length
              ? t("pages.battle.seeSummary")
              : t("pages.battle.continue")}
          </button>
        </div>
      ) : null}

      <BattleConfirmModal
        open={pendingAttackerId != null && phase === "playing"}
        attacker={pendingAttacker ?? null}
        defender={defender ?? null}
        onClose={() => setPendingAttackerId(null)}
        onConfirm={confirmAttack}
      />

      <BattleAgeUpOverlay
        open={phase === "age_up" && ageUpEraId != null}
        eraId={ageUpEraId ?? 3}
        eraName={eraById.get(ageUpEraId ?? 3)?.nome ?? ""}
        eraIcon={eraById.get(ageUpEraId ?? 3)?.icon}
        onDone={finishAgeUp}
      />
    </div>
  );
}

function ScorePill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "win" | "loss" | "draw";
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 font-semibold tabular-nums",
        tone === "win" && "border-emerald-500/40 bg-emerald-950/40 text-emerald-200",
        tone === "loss" && "border-rose-500/40 bg-rose-950/40 text-rose-200",
        tone === "draw" && "border-amber-500/40 bg-amber-950/40 text-amber-100",
      )}
    >
      {label}: {value}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "win" | "loss" | "draw";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-center",
        outcomeClass(tone === "win" ? "win" : tone === "loss" ? "loss" : "draw"),
      )}
    >
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
