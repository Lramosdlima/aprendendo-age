import { type FormEvent, useState } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";

import { ModalApp } from "@/components/ui/ModalApp";
import { PageHeader } from "@/components/ui/PageHeader";
import { searchPlayersByName, type AomStatsSearchProfileRow } from "@/lib/formRetoldApi";
import { cn } from "@/lib/cn";
import { RANK_GUIDE_TIERS as TIERS, type RankGuideTier as RankTier } from "@/lib/rankGuideTiers";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

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

function goToRankForm(navigate: NavigateFunction, alias: string, profileId: number) {
  const sp = new URLSearchParams();
  sp.set("player", alias.trim() || String(profileId));
  sp.set("aomstats_id", String(profileId));
  navigate({ pathname: "/rank/form", search: sp.toString() });
}

export function RankPage() {
  const headerIcon = getTokenAssetUrl("aomr_wonder_age_icon");
  const navigate = useNavigate();
  const [playerQuery, setPlayerQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [pickModalOpen, setPickModalOpen] = useState(false);
  const [pickProfiles, setPickProfiles] = useState<AomStatsSearchProfileRow[]>([]);
  const [pickSelectedId, setPickSelectedId] = useState<number | null>(null);

  async function onConsultRank(e: FormEvent) {
    e.preventDefault();
    const q = playerQuery.trim();
    if (!q) {
      setFormError("Digite o nome do jogador (igual ao do jogo).");
      return;
    }
    setFormError(null);
    setSearchBusy(true);
    try {
      const profiles = await searchPlayersByName(q);
      if (profiles.length === 0) {
        setFormError("Nenhum jogador encontrado no AoM Stats com esse nome.");
        return;
      }
      if (profiles.length === 1) {
        const p = profiles[0]!;
        goToRankForm(navigate, p.alias ?? q, p.profile_id);
        return;
      }
      setPickProfiles(profiles);
      setPickSelectedId(null);
      setPickModalOpen(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao pesquisar no AoM Stats.");
    } finally {
      setSearchBusy(false);
    }
  }

  function confirmPickAndGo() {
    if (pickSelectedId == null) return;
    const p = pickProfiles.find((x) => x.profile_id === pickSelectedId);
    if (!p) return;
    setPickModalOpen(false);
    setPickProfiles([]);
    goToRankForm(navigate, p.alias || String(p.profile_id), p.profile_id);
  }

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Veja sua RR em Rank"
        headerIconSrc={headerIcon}
        description={
          <>
            Já se perguntou: Como que seria meu Elo baseado no Rank? Fizemos um sistema baseado na pontuação ranqueada (RR) com cada divisão no estilo das eras do jogo! Confira!
          </>
        }
      />

      <div className="rounded-2xl border border-aom-border/50 bg-zinc-900/40 p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-zinc-400 sm:max-w-2xl">
          Consulte agora seu Elo de RR no estilo das Eras do Age of Mythology! Digite o nome do jogador (idêntico ao do jogo) e abra a consulta no AoM Stats.
        </p>
        <form
          onSubmit={onConsultRank}
          className={cn("mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3", searchBusy && "pointer-events-none opacity-70")}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Nome do jogador</span>
            <input
              type="text"
              value={playerQuery}
              onChange={(ev) => {
                setPlayerQuery(ev.target.value);
                if (formError) setFormError(null);
              }}
              disabled={searchBusy}
              placeholder="Ex: Mosca_"
              autoComplete="off"
              className="w-full rounded-xl border border-zinc-600/90 bg-black/35 px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed"
            />
          </label>
          <button
            type="submit"
            disabled={searchBusy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-900/25 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/35 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[10.5rem]"
          >
            {searchBusy ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" aria-hidden />
                A procurar…
              </>
            ) : (
              "Consultar Rank"
            )}
          </button>
        </form>
        {formError ? (
          <p className="mt-3 rounded-xl border border-red-900/45 bg-red-950/35 px-3 py-2 text-center text-sm text-red-200" role="alert">
            {formError}
          </p>
        ) : null}
      </div>

      <ModalApp
        open={pickModalOpen}
        onClose={() => {
          setPickModalOpen(false);
          setPickProfiles([]);
          setPickSelectedId(null);
        }}
        title="Qual jogador deseja consultar?"
        description="Vários perfis no AoM Stats correspondem a essa pesquisa. Selecione o jogador correto para abrir a página de RR."
        className="max-w-lg"
      >
        <ul className="max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto pr-0.5" role="list">
          {pickProfiles.map((p) => {
            const active = pickSelectedId === p.profile_id;
            return (
              <li key={p.profile_id}>
                <button
                  type="button"
                  onClick={() => setPickSelectedId(p.profile_id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                    "border-zinc-600/80 bg-zinc-900/60 hover:border-amber-500/40",
                    active && "border-amber-500/60 ring-2 ring-amber-500/25",
                  )}
                >
                  {p.avatar_link ? (
                    <img src={p.avatar_link} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" width={44} height={44} />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm text-zinc-500">?</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-zinc-200">
                      {(p.clan_name ?? "").trim() ? (
                        <span className="text-amber-200/90">[{(p.clan_name ?? "").trim()}] </span>
                      ) : null}
                      <span className="font-medium">{p.alias || p.profile_id}</span>
                    </div>
                    <div className="font-mono text-xs text-zinc-500">ID {p.profile_id}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pickSelectedId == null}
            onClick={confirmPickAndGo}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Consultar este perfil
          </button>
        </div>
      </ModalApp>

      <nav
        aria-label="Atalhos para divisões"
        className="sticky top-[calc(env(safe-area-inset-top,0px)+4.25rem)] z-20 -mx-1 flex flex-wrap justify-center gap-2 rounded-2xl border border-aom-border/50 bg-zinc-950/90 px-2 py-3 shadow-lg shadow-black/40 backdrop-blur-md sm:top-6 sm:px-4 md:top-8"
      >
        {TIERS.map((t) => {
          const iconSrc = getTokenAssetUrl(t.token);
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-aom-border/60 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-100",
              )}
            >
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt=""
                  className="h-4 w-4 shrink-0 object-contain opacity-95 sm:h-[1.125rem] sm:w-[1.125rem]"
                  width={18}
                  height={18}
                />
              ) : null}
              <span>{t.rankName}</span>
            </a>
          );
        })}
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
    </div>
  );
}
