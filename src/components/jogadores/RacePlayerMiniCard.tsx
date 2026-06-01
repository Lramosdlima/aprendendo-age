import { useTranslation } from "@/hooks/useTranslation";
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

/** Resumo do jogador na pista (desktop) — estilo do popover, compacto. */
export function RacePlayerMiniCard({ player, className }: RacePlayerMiniCardProps) {
  const { t } = useTranslation();
  const cls = getRankClassification(player.rr);
  const theme = TIER_ACHIEVEMENT_THEME[cls.tierId];
  const label = playerDisplayLabel(player);
  const roman = rankRomanStepFromRr(player.rr);
  const clanTag = player.aomstatsClan?.trim();

  return (
    <div
      className={cn(
        "pointer-events-none relative min-w-[11.5rem] max-w-[14rem] overflow-hidden rounded-xl border border-aom-border/55 px-3 py-2.5 shadow-lg shadow-black/50",
        theme.surfaceClass,
        className,
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: GRID_SCRIM }}
      />

      <div className="relative space-y-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {clanTag ? (
            <span
              className="shrink-0 rounded-md border border-zinc-500/45 bg-black/25 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-100"
              title={clanTag}
            >
              {clanTag}
            </span>
          ) : null}
          <p className="min-w-0 truncate font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-zinc-50">
            {label}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "rounded-lg border border-aom-border/45 bg-zinc-950/65 px-2.5 py-1 ring-inset ring-1",
              theme.stepRing,
            )}
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              {t("pages.players.racePopoverRr")}
            </p>
            <p className={cn("mt-0.5 text-lg font-semibold tabular-nums leading-none", theme.stepAccent)}>
              {player.rr}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center rounded-lg border border-aom-border/45 bg-zinc-950/65 px-2 py-1 ring-inset ring-1",
              theme.stepRing,
            )}
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              {t("pages.players.raceMiniSubTier")}
            </p>
            <span
              className={cn(
                "mt-1 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold shadow-inner",
                rankRomanMedallionClass(cls.tierId),
              )}
            >
              {roman}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
