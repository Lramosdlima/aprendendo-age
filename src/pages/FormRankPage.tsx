import { type FormEvent, type ReactNode, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/ui/PageHeader";
import {
  fetchGodStats,
  fetchPlayerStats,
  parseElo,
  pickSup1v1Row,
  type GodStatRow,
  type PlayerStatsResponse,
  type ProfileStatRow,
} from "@/lib/formRetoldApi";
import { getGodPortraitUrl } from "@/lib/godIconFromName";
import { cn } from "@/lib/cn";
import { type RankTierId, TIER_ACHIEVEMENT_THEME, getRankClassification } from "@/lib/rankClassification";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

const GRID_SCRIM =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M40 0L40 80M0 40L80 40'/%3E%3C/g%3E%3C/svg%3E\")";

function HintBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 cursor-help items-center justify-center rounded-full border border-white/35 bg-white/5 text-[11px] font-semibold text-white/90"
      title={label}
    >
      ?
    </span>
  );
}

function AchievementShell({
  tierId,
  className,
  children,
}: {
  tierId: RankTierId;
  className?: string;
  children: ReactNode;
}) {
  const theme = TIER_ACHIEVEMENT_THEME[tierId];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-aom-border/60 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.85)]",
        theme.surfaceClass,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: GRID_SCRIM }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function StatSubCard({
  tierId,
  title,
  value,
  sub,
  /** Grelha estreita (cards de deus em 3 colunas no desktop). */
  tight,
}: {
  tierId: RankTierId;
  title: string;
  value: string;
  sub?: string;
  tight?: boolean;
}) {
  const theme = TIER_ACHIEVEMENT_THEME[tierId];
  return (
    <div
      className={cn(
        "box-border flex min-h-0 min-w-0 flex-col items-center justify-center rounded-2xl border border-aom-border/50 bg-zinc-950/55 text-center shadow-inner shadow-black/40 backdrop-blur-sm ring-inset",
        theme.stepRing,
        /* AJUSTE MANUAL (padding dos mini-stats): altere px-/py- abaixo. */
        tight ? "ring-1 px-3.5 py-4 sm:px-4 sm:py-4" : "ring-2 px-4 py-4 sm:px-5 sm:py-5",
      )}
    >
      <span
        className={cn(
          "max-w-full shrink-0 font-medium uppercase tracking-[0.18em] text-zinc-500",
          tight ? "text-[10px] leading-tight sm:text-[10px]" : "text-[10px] tracking-[0.2em]",
        )}
      >
        {title}
      </span>
      <span
        className={cn(
          /* RR / WR / números: nunca partir ao meio (evita "148" + "8"). Sem break-words aqui. */
          "mt-2 block w-full max-w-full text-center font-semibold tabular-nums leading-none tracking-tight whitespace-nowrap",
          tight
            ? /* AJUSTE MANUAL (tamanho do número nos deuses): altere text-[11px] / sm:text-xs. */
              "px-1 text-[11px] sm:px-2 sm:text-xs md:text-[0.8125rem]"
            : "min-w-0 px-2.5 text-base sm:px-3 sm:text-lg md:text-xl",
          theme.stepAccent,
        )}
      >
        {value}
      </span>
      {sub ? (
        <span className="mt-1.5 max-w-full shrink-0 px-2 text-center font-mono text-[10px] leading-snug text-zinc-500 sm:text-[11px]">
          {sub}
        </span>
      ) : null}
    </div>
  );
}

function CategorySubCard({
  tierId,
  ageToken,
  label,
  value,
  hint,
}: {
  tierId: RankTierId;
  ageToken: string;
  label: string;
  value: string;
  hint: string;
}) {
  const theme = TIER_ACHIEVEMENT_THEME[tierId];
  const ageSrc = getTokenAssetUrl(ageToken);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-aom-border/50 bg-zinc-950/55 px-3 py-3 shadow-inner shadow-black/40 ring-2 ring-inset sm:px-4",
        theme.stepRing,
      )}
    >
      {ageSrc ? (
        <img src={ageSrc} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-aom-border/60 bg-black/20 object-contain p-0.5" width={40} height={40} />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{label}</p>
        <p className="truncate text-sm font-semibold text-zinc-100">{value}</p>
      </div>
      <HintBadge label={hint} />
    </div>
  );
}

function splitCategoryLabel(categoryLabel: string): { rank: string; era: string } {
  const parts = categoryLabel.split("|").map((s) => s.trim());
  return { rank: parts[0] ?? categoryLabel, era: parts[1] ?? "" };
}

function PlayerHero({
  player,
  row1v1,
  rr,
  classification,
}: {
  player: PlayerStatsResponse;
  row1v1: ProfileStatRow;
  rr: number;
  classification: ReturnType<typeof getRankClassification>;
}) {
  const theme = TIER_ACHIEVEMENT_THEME[classification.tierId];
  const ageSrc = getTokenAssetUrl(classification.ageToken);
  const { rank: rankWord, era: eraWord } = splitCategoryLabel(classification.categoryLabel);

  const innerAvatar = (
    <div className="relative mx-auto w-fit">
      <div className={cn("pointer-events-none absolute -inset-8 rounded-full blur-3xl sm:-inset-10", theme.iconBlurClass)} aria-hidden />
      <div className="relative flex flex-col items-center">
        {ageSrc ? (
          <img
            src={ageSrc}
            alt=""
            className="relative z-[1] h-[min(40vw,11rem)] w-[min(40vw,11rem)] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:h-48 sm:w-48"
            width={192}
            height={192}
          />
        ) : null}
        <div className="relative z-[2] -mt-10 flex justify-center sm:-mt-12">
          <div
            className={cn(
              "rounded-full border-[3px] bg-zinc-950/90 p-0.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.9)] ring-2 ring-inset",
              theme.stepRing,
            )}
          >
            {player.playerAvatarUrl ? (
              <img
                src={player.playerAvatarUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
                width={96}
                height={96}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl text-zinc-500 sm:h-24 sm:w-24">?</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AchievementShell tierId={classification.tierId} className="mx-auto max-w-xl">
      <div className="px-4 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
        <p className="mb-6 text-center font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-white/85">Perfil · Sup 1v1</p>

        {player.profileUrl ? (
          <a
            href={player.profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="block outline-none transition hover:opacity-95"
            title={`Abrir perfil de ${player.profileName} no AoM Stats`}
          >
            {innerAvatar}
          </a>
        ) : (
          innerAvatar
        )}

        <h2 className="mt-8 text-center font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          <span className={theme.titleRankClass}>{rankWord}</span>
          {eraWord ? (
            <>
              <span className="text-zinc-500"> | </span>
              <span className="text-zinc-200">{eraWord}</span>
            </>
          ) : null}
        </h2>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
          {player.clanTag ? (
            <span
              className="rounded-md border border-amber-700/40 bg-black/25 px-2 py-0.5 font-mono text-xs font-semibold text-amber-200/95"
              title={player.funStats?.clan_name ?? player.clanTag}
            >
              [{player.clanTag}]
            </span>
          ) : null}
          <span className="font-[family-name:var(--font-display)] text-lg font-medium text-zinc-100 sm:text-xl">{player.profileName}</span>
        </div>

        <p className="mt-2 text-center text-[11px] text-zinc-500">Subcategoria atual: {classification.subcategoryLabel}</p>

        <div className="mt-10 w-full min-w-0">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Estatísticas</p>
          <p className="mb-5 text-center text-[11px] text-zinc-600">Dados da fila Sup 1v1 no AoM Stats.</p>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 sm:[grid-template-columns:repeat(3,minmax(0,1fr))]">
            <StatSubCard tierId={classification.tierId} title="RR" value={String(rr)} />
            <StatSubCard tierId={classification.tierId} title="Taxa de vitória" value={row1v1.winRate} />
            <StatSubCard tierId={classification.tierId} title="Vitórias" value={String(row1v1.wins)} />
          </div>
          <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:[grid-template-columns:repeat(2,minmax(0,1fr))]">
            <StatSubCard tierId={classification.tierId} title="Derrotas" value={String(row1v1.losses)} />
            {row1v1.rank ? (
              <StatSubCard tierId={classification.tierId} title="Rank (leaderboard)" value={row1v1.rank} sub="Posição global" />
            ) : (
              <StatSubCard tierId={classification.tierId} title="Partidas" value={`${row1v1.wins + row1v1.losses}`} sub="Vitórias + derrotas" />
            )}
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Classificação</p>
          <CategorySubCard
            tierId={classification.tierId}
            ageToken={classification.ageToken}
            label="Categoria"
            value={classification.categoryLabel}
            hint={classification.hintCategory}
          />
          <CategorySubCard
            tierId={classification.tierId}
            ageToken={classification.ageToken}
            label="Subcategoria"
            value={classification.subcategoryLabel}
            hint={classification.hintSub}
          />
        </div>
      </div>
    </AchievementShell>
  );
}

function GodAchievementCard({ god }: { god: GodStatRow }) {
  const cls = getRankClassification(god.elo);
  const theme = TIER_ACHIEVEMENT_THEME[cls.tierId];
  const ageSrc = getTokenAssetUrl(cls.ageToken);
  const portrait = getGodPortraitUrl(god.god);
  const { rank: rankWord, era: eraWord } = splitCategoryLabel(cls.categoryLabel);

  return (
    <AchievementShell tierId={cls.tierId} className="h-full">
      <div className="flex min-w-0 flex-col items-center px-4 pb-8 pt-7 sm:px-5 sm:pb-9 sm:pt-8">
        <p className="mb-4 text-center font-mono text-[9px] font-medium uppercase tracking-[0.32em] text-white/85">Deus · Sup 1v1</p>

        {/*
          AJUSTE MANUAL — tamanho do ícone da ERA (anel exterior):
          ↓ largura/altura do quadrado que contém o PNG da era (ex.: subir para sm:w-40).
        */}
        <div className="relative mx-auto aspect-square w-[9rem] sm:w-[9.0rem]">
          <div
            className={cn("pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl", theme.iconBlurClass)}
            aria-hidden
          />
          {ageSrc ? (
            <img
              src={ageSrc}
              alt=""
              className="absolute left-1/2 top-1/2 z-[1] h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
              width={132}
              height={132}
            />
          ) : null}
          {/*
            AJUSTE MANUAL — tamanho do RETRATO do deus (círculo interior):
            ↓ h-[…rem] w-[…rem] e sm:h-… sm:w-… (cerca de 70–75% do lado do quadrado da era costuma ficar bem).
          */}
          <div className="absolute inset-0 z-[2] flex items-center justify-center">
            <div
              className={cn(
                "h-[5.75rem] w-[5.75rem] shrink-0 rounded-full border-[2.5px] bg-zinc-950/90 p-[3px] shadow-lg ring-2 ring-inset sm:h-24 sm:w-24",
                theme.stepRing,
              )}
            >
              {portrait ? (
                <img src={portrait} alt="" className="h-full w-full rounded-full object-cover" width={76} height={76} />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">—</div>
              )}
            </div>
          </div>
        </div>

        <h3 className="mt-5 text-center font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-amber-50/95 sm:text-xl">
          {god.god}
        </h3>

        <p className="mt-1 text-center font-[family-name:var(--font-display)] text-sm sm:text-base">
          <span className={theme.titleRankClass}>{rankWord}</span>
          {eraWord ? (
            <>
              <span className="text-zinc-500"> | </span>
              <span className="text-zinc-300">{eraWord}</span>
            </>
          ) : null}
        </p>
        <p className="mt-1 text-center text-xs text-zinc-500">({cls.subcategoryLabel})</p>

        <div className="mt-6 w-full min-w-0">
          <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Estatísticas</p>
          {/*
            AJUSTE MANUAL — layout RR/WR/Jogos:
            - Abaixo do breakpoint `sm`: 1 coluna (cada stat em linha própria = mais largura).
            - A partir de `sm`: 3 colunas. Ajuste `gap-*` ou troque `repeat(3,…)` se quiser.
          */}
          <div className="grid w-full min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-[repeat(3,minmax(0,1fr))] sm:gap-3">
            <StatSubCard tight tierId={cls.tierId} title="RR" value={String(god.elo)} />
            <StatSubCard tight tierId={cls.tierId} title="WR" value={god.winRate} />
            <StatSubCard tight tierId={cls.tierId} title="Jogos" value={String(god.games)} />
          </div>
        </div>
      </div>
    </AchievementShell>
  );
}

export function FormRankPage() {
  const headerIcon = getTokenAssetUrl("aomr_wonder_age_icon");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerStatsResponse | null>(null);
  const [row1v1, setRow1v1] = useState<ProfileStatRow | undefined>(undefined);
  const [gods, setGods] = useState<GodStatRow[]>([]);

  const rr = row1v1 ? parseElo(row1v1.elo) : undefined;
  const classification = rr != null ? getRankClassification(rr) : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = name.trim();
    if (!q) {
      setError("Digite o nome do jogador (igual ao do jogo).");
      return;
    }
    setError(null);
    setLoading(true);
    setPlayer(null);
    setRow1v1(undefined);
    setGods([]);
    try {
      const data = await fetchPlayerStats(q);
      const one = pickSup1v1Row(data.profileStats);
      if (!one) {
        setError("Resposta sem estatísticas de modo.");
        return;
      }
      const eloNum = parseElo(one.elo);
      if (eloNum == null) {
        setError(`Dados de ${data.profileName} carregados, mas o RR de Sup 1v1 não foi encontrado.`);
        setPlayer(data);
        return;
      }
      setPlayer(data);
      setRow1v1(one);
      try {
        const g = await fetchGodStats(data.profileId);
        setGods(g.slice(0, 3));
      } catch {
        setGods([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao buscar os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Classificação por RR"
        headerIconSrc={headerIcon}
        description="Consulta direta ao AoM Stats — mesmo backend do formulário Retold."
        actions={
          <Link
            to="/rank"
            className="inline-flex items-center rounded-lg border border-aom-border bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-amber-500/35 hover:text-amber-100"
          >
            ← Guia de ranks
          </Link>
        }
      />

      <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-zinc-700/55 bg-zinc-950 p-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] sm:p-7">
        <div className="relative z-[1]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">AOM STATS</p>
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">Digite o nome do jogador (idêntico ao do jogo).</p>
          <form onSubmit={onSubmit} className={cn("mt-6 space-y-4", loading && "pointer-events-none opacity-70")}>
            <label className="block">
              <span className="sr-only">Nome do jogador</span>
              <input
                type="text"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                disabled={loading}
                placeholder="Ex: Mosca_"
                autoComplete="off"
                className="w-full rounded-xl border border-zinc-600/90 bg-black/35 px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-bold text-black shadow-md shadow-black/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" aria-hidden />
                  Carregando…
                </>
              ) : (
                "Aplicar"
              )}
            </button>
          </form>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-900/45 bg-red-950/35 px-3 py-2 text-center text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      {player && row1v1 && classification && rr != null ? (
        <div className="space-y-12">
          <section aria-labelledby="result-main-heading">
            <h2 id="result-main-heading" className="sr-only">
              Resultado: {player.profileName}
            </h2>
            <PlayerHero player={player} row1v1={row1v1} rr={rr} classification={classification} />
          </section>

          <section aria-labelledby="gods-heading" className="mx-auto max-w-4xl">
            <p className="mb-2 text-center font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">Progressão</p>
            <h3 id="gods-heading" className="text-center font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
              Principais deuses
            </h3>
            <p className="mx-auto mt-2 max-w-md text-center text-[11px] text-zinc-500">Top 3 por RR na fila Sup 1v1 — mesmo estilo de conquista por faixa.</p>
            {gods.length === 0 ? (
              <p className="mx-auto mt-8 max-w-xl rounded-2xl border border-aom-border/50 bg-zinc-950/60 py-8 text-center text-sm text-zinc-500">
                Nenhuma estatística de deuses encontrada.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
                {gods.map((g, i) => (
                  <div key={g.god} className="relative">
                    <p className="mb-2 text-center font-mono text-[9px] font-medium uppercase tracking-[0.35em] text-zinc-500">
                      {i + 1} / {gods.length}
                    </p>
                    <GodAchievementCard god={g} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
