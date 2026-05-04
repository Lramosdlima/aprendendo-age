import { type FormEvent, useState } from "react";
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
import { type RankTierId, getRankClassification } from "@/lib/rankClassification";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

function HintBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 cursor-help items-center justify-center rounded-full border border-zinc-600 bg-zinc-800/90 text-[11px] font-semibold text-zinc-400"
      title={label}
    >
      ?
    </span>
  );
}

function AgeBadge({ token }: { token: string }) {
  const src = getTokenAssetUrl(token);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="h-9 w-9 shrink-0 rounded-lg border border-aom-border bg-zinc-900/80 object-contain p-0.5 shadow-md shadow-black/40"
      width={36}
      height={36}
    />
  );
}

function ProfileAvatarBlock({
  avatarUrl,
  profileUrl,
  name,
  rankClass,
}: {
  avatarUrl: string | null;
  profileUrl: string;
  name: string;
  rankClass: ReturnType<typeof getRankClassification>;
}) {
  const ageSrc = getTokenAssetUrl(rankClass.ageToken);
  const inner = (
    <div className="relative mx-auto w-fit">
      <div
        className={cn("pointer-events-none absolute -inset-6 rounded-full blur-2xl", rankClass.avatarGlowClass)}
        aria-hidden
      />
      <div
        className={cn(
          "relative rounded-full border-4 bg-zinc-950/80 p-1 shadow-[0_0_40px_-8px_rgba(0,0,0,0.9)] ring-4 ring-inset",
          rankClass.avatarRingClass,
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-28 w-28 rounded-full object-cover sm:h-32 sm:w-32" width={128} height={128} />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-zinc-800 text-3xl text-zinc-500 sm:h-32 sm:w-32">?</div>
        )}
      </div>
      {ageSrc ? (
        <div className="absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-950/95 p-1 shadow-lg">
          <img src={ageSrc} alt="" className="h-9 w-9 object-contain" width={36} height={36} />
        </div>
      ) : null}
    </div>
  );

  if (profileUrl) {
    return (
      <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="block outline-none ring-amber-500/0 transition hover:ring-2 hover:ring-amber-500/30 rounded-full" title={`Perfil de ${name} no AoM Stats`}>
        {inner}
      </a>
    );
  }
  return inner;
}

function StatLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-800/80 py-2.5 last:border-0">
      <span className="text-sm text-zinc-500">{k}</span>
      <span className="text-right font-mono text-sm font-medium text-zinc-100">{v}</span>
    </div>
  );
}

function CategoryLine({
  title,
  value,
  rankClass,
  hint,
}: {
  title: string;
  value: string;
  rankClass: ReturnType<typeof getRankClassification>;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-aom-border/50 bg-zinc-900/50 px-3 py-3 sm:px-4">
      <AgeBadge token={rankClass.ageToken} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{title}</p>
        <p className="truncate text-sm font-semibold text-zinc-100">{value}</p>
      </div>
      <HintBadge label={hint} />
    </div>
  );
}

const TIER_LABEL_CLASS: Record<RankTierId, string> = {
  bronze: "text-amber-200/95",
  prata: "text-zinc-200",
  ouro: "text-amber-100/95",
  esmeralda: "text-emerald-200/95",
  diamante: "text-sky-200/95",
};

function GodMiniCard({ god }: { god: GodStatRow }) {
  const portrait = getGodPortraitUrl(god.god);
  const cls = getRankClassification(god.elo);
  const era = getTokenAssetUrl(cls.ageToken);
  const eraLabel = cls.categoryLabel.split("|")[1]?.trim() ?? cls.categoryLabel;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-aom-border/55 bg-zinc-900/45 px-3 py-4 text-center shadow-inner shadow-black/30">
      <p className="w-full truncate text-sm font-semibold text-amber-100/95">{god.god}</p>
      <div className={cn("relative mt-3", cls.avatarGlowClass, "rounded-full p-[3px]")}>
        <div className={cn("rounded-full border-2 bg-zinc-950 p-0.5", cls.avatarRingClass)}>
          {portrait ? (
            <img src={portrait} alt="" className="h-14 w-14 rounded-full object-cover" width={56} height={56} />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">—</div>
          )}
        </div>
        {era ? (
          <span className="absolute -bottom-1 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 p-0.5 shadow">
            <img src={era} alt="" className="h-5 w-5 object-contain" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-lg font-semibold text-zinc-100">{god.elo}</p>
      <p className="mt-1 text-[11px] text-zinc-500">WR {god.winRate}</p>
      <p className={cn("mt-2 text-xs font-medium", TIER_LABEL_CLASS[cls.tierId])}>{eraLabel}</p>
      <p className="text-[11px] text-zinc-400">({cls.subcategoryLabel})</p>
    </div>
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

      <div className="mx-auto max-w-xl rounded-2xl border border-aom-border/60 bg-zinc-900/35 p-5 shadow-lg shadow-black/20 sm:p-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-amber-500/90">AoM Stats</p>
        <p className="mt-2 text-center text-sm text-zinc-400">Digite o nome do jogador (idêntico ao do jogo).</p>
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
              className="w-full rounded-xl border border-aom-border bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/45 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/25 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950"
                  aria-hidden
                />
                Carregando…
              </>
            ) : (
              "Aplicar"
            )}
          </button>
        </form>
        {error ? (
          <p className="mt-4 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-center text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {player && row1v1 && classification && rr != null ? (
        <div className="space-y-8">
          <section
            aria-labelledby="result-main-heading"
            className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-aom-border/60 bg-gradient-to-b from-zinc-900/80 to-zinc-950/95 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.85)]"
          >
            <h2 id="result-main-heading" className="sr-only">
              Resultado: {player.profileName}
            </h2>
            <div className="border-b border-aom-border/40 bg-zinc-950/50 px-4 py-8 sm:px-8">
              <ProfileAvatarBlock
                avatarUrl={player.playerAvatarUrl}
                profileUrl={player.profileUrl}
                name={player.profileName}
                rankClass={classification}
              />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center">
                {player.clanTag ? (
                  <span
                    className="rounded-md border border-amber-600/35 bg-amber-950/40 px-2 py-0.5 font-mono text-xs font-semibold text-amber-200"
                    title={player.funStats?.clan_name ?? player.clanTag}
                  >
                    [{player.clanTag}]
                  </span>
                ) : null}
                <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-amber-50 sm:text-2xl">{player.profileName}</span>
              </div>
            </div>
            <div className="space-y-0 px-4 py-2 sm:px-6">
              <StatLine k="RR" v={String(rr)} />
              <StatLine k="Taxa de vitória" v={row1v1.winRate} />
              <StatLine k="Vitórias" v={String(row1v1.wins)} />
              <StatLine k="Derrotas" v={String(row1v1.losses)} />
              {row1v1.rank ? <StatLine k="Rank (leaderboard)" v={row1v1.rank} /> : null}
            </div>
            <div className="space-y-3 px-4 pb-6 pt-4 sm:px-6">
              <CategoryLine title="Categoria" value={classification.categoryLabel} rankClass={classification} hint={classification.hintCategory} />
              <CategoryLine title="Subcategoria" value={classification.subcategoryLabel} rankClass={classification} hint={classification.hintSub} />
            </div>
          </section>

          <section aria-labelledby="gods-heading" className="mx-auto max-w-xl">
            <h3 id="gods-heading" className="mb-4 text-center font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-200">
              Principais deuses (Sup 1v1)
            </h3>
            {gods.length === 0 ? (
              <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-6 text-center text-sm text-zinc-500">Nenhuma estatística de deuses encontrada.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {gods.map((g) => (
                  <GodMiniCard key={g.god} god={g} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
