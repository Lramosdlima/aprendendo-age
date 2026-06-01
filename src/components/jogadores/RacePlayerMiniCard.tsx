import { cn } from "@/lib/cn";
import { type AomRacePlayer, playerDisplayLabel } from "@/lib/playersApi";
import {
  getRankClassification,
  rankRomanMedallionClass,
  rankRomanStepFromRr,
  TIER_ACHIEVEMENT_THEME,
} from "@/lib/rankClassification";

const GRID_SCRIM =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M40 0L40 80M0 40L80 40'/%3E%3C/g%3E%3C/svg%3E\")";

type RacePlayerMiniCardProps = {
  player: AomRacePlayer;
  className?: string;
};

/** Resumo do jogador na pista (desktop) — uma linha, estilo do tier. */
export function RacePlayerMiniCard({ player, className }: RacePlayerMiniCardProps) {
  const cls = getRankClassification(player.rr);
  const theme = TIER_ACHIEVEMENT_THEME[cls.tierId];
  const label = playerDisplayLabel(player);
  const roman = rankRomanStepFromRr(player.rr);
  const clanTag = player.aomstatsClan?.trim();

  return (
    <div
      className={cn(
        "pointer-events-none relative w-max max-w-[min(20rem,calc(100vw-8rem))] overflow-hidden rounded-xl border border-aom-border/55 px-3 py-2 shadow-lg shadow-black/50",
        theme.surfaceClass,
        className,
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: GRID_SCRIM }}
      />

      <div className="relative flex min-w-0 items-center gap-2">
        {clanTag ? (
          <span
            className="shrink-0 rounded-md border border-zinc-500/45 bg-black/25 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-100"
            title={clanTag}
          >
            {clanTag}
          </span>
        ) : null}
        <p className="min-w-0 truncate font-[family-name:var(--font-display)] text-sm font-semibold leading-none text-zinc-50">
          {label}
        </p>
        <span className={cn("shrink-0 text-sm font-semibold tabular-nums leading-none", theme.stepAccent)}>
          {player.rr}
        </span>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold shadow-inner",
            rankRomanMedallionClass(cls.tierId),
          )}
        >
          {roman}
        </span>
      </div>
    </div>
  );
}
