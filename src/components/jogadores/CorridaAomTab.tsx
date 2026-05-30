import { useEffect, useMemo, useState } from "react";

import { RacePlayerPopover } from "@/components/jogadores/RacePlayerPopover";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { type AomRacePlayer, playerDisplayLabel } from "@/lib/playersApi";
import {
  layoutRaceAvatars,
  raceTrackMinHeightPx,
  RACE_TIER_MARKERS,
  RACE_TRACK_LANE_CLASS,
} from "@/lib/raceTrackLayout";
import { getRankGuideTiers } from "@/lib/rankGuideTiers";
import { getRankClassification, TIER_ACHIEVEMENT_THEME } from "@/lib/rankClassification";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

type PlacedPlayer = AomRacePlayer & {
  bottomPercent: number;
  zIndex: number;
};

function useRandomHopPlayerIds(playerIds: string[], intervalMs = 2800) {
  const [hoppingIds, setHoppingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (playerIds.length === 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = intervalMs + Math.random() * 1200 - 600;
      timeoutId = setTimeout(() => {
        const count = playerIds.length <= 3 ? 1 : Math.random() < 0.35 ? 2 : 1;
        const picked = new Set<string>();
        while (picked.size < count && picked.size < playerIds.length) {
          picked.add(playerIds[Math.floor(Math.random() * playerIds.length)]!);
        }
        setHoppingIds(picked);
        setTimeout(() => setHoppingIds(new Set()), 650);
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timeoutId);
  }, [intervalMs, playerIds]);

  return hoppingIds;
}

function raceAvatarTransform(bottomPercent: number): string {
  if (bottomPercent >= 99.5) return "translate(-50%, -50%)";
  if (bottomPercent <= 0.5) return "translate(-50%, 50%)";
  return "translate(-50%, 50%)";
}

function RaceAvatar({
  player,
  hopping,
  selected,
  onSelect,
}: {
  player: PlacedPlayer;
  hopping: boolean;
  selected: boolean;
  onSelect: (player: PlacedPlayer, anchor: HTMLElement) => void;
}) {
  const { t } = useTranslation();
  const cls = getRankClassification(player.rr);
  const theme = TIER_ACHIEVEMENT_THEME[cls.tierId];
  const label = playerDisplayLabel(player);

  return (
    <div
      className="pointer-events-auto absolute h-12 w-12 shrink-0 sm:h-[3.25rem] sm:w-[3.25rem]"
      style={{
        bottom: `${player.bottomPercent}%`,
        left: "50%",
        transform: raceAvatarTransform(player.bottomPercent),
        zIndex: selected ? 250 : player.zIndex,
      }}
    >
      <button
        type="button"
        aria-expanded={selected}
        aria-label={t("pages.players.raceAvatarOpen", { name: label })}
        onClick={(e) => onSelect(player, e.currentTarget)}
        className={cn(
          "race-avatar-hop relative block h-full w-full touch-manipulation rounded-full border-2 bg-zinc-950 p-0 shadow-lg shadow-black/50 transition",
          "cursor-pointer overflow-hidden",
          "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          theme.stepRing,
          selected && "ring-2 ring-amber-300/70 ring-offset-2 ring-offset-zinc-950",
          hopping && "is-hopping",
        )}
      >
        {player.logoPath ? (
          <img
            src={player.logoPath}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover"
            width={48}
            height={48}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
            ?
          </span>
        )}
      </button>
      <span className="sr-only">
        {t("pages.players.racePlayerRr", { name: label, rr: player.rr })}
      </span>
    </div>
  );
}

export function CorridaAomTab({ players }: { players: AomRacePlayer[] }) {
  const { t } = useTranslation();
  const tiers = useMemo(() => getRankGuideTiers(t), [t]);

  const trackMinHeight = useMemo(() => raceTrackMinHeightPx(players.length, players), [players]);

  const placed = useMemo(() => {
    const layout = layoutRaceAvatars(players, trackMinHeight);
    const byId = new Map(players.map((p) => [p.id, p]));

    return layout
      .map((slot) => {
        const player = byId.get(slot.id);
        if (!player) return null;
        return {
          ...player,
          bottomPercent: slot.bottomPercent,
          zIndex: slot.zIndex,
        };
      })
      .filter((p): p is PlacedPlayer => p != null);
  }, [players, trackMinHeight]);

  const hoppingIds = useRandomHopPlayerIds(placed.map((p) => p.id));

  const [popover, setPopover] = useState<{ player: PlacedPlayer; anchor: HTMLElement } | null>(null);

  const handleAvatarSelect = (player: PlacedPlayer, anchor: HTMLElement) => {
    setPopover((prev) => (prev?.player.id === player.id ? null : { player, anchor }));
  };

  if (players.length === 0) {
    return (
      <p className="rounded-2xl border border-aom-border/60 bg-zinc-950/50 px-4 py-10 text-center text-sm text-zinc-500">
        {t("pages.players.raceEmpty")}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-6 text-center text-sm text-zinc-400">{t("pages.players.raceDesc")}</p>

      <div
        className="relative mx-auto w-full max-w-md px-4 pb-8 pt-4 sm:px-8"
        style={{ minHeight: `${trackMinHeight}px` }}
      >
        {/* Faixa útil da pista — marcos, linha e avatares compartilham 0% (base) e 100% (topo) */}
        <div className={cn(RACE_TRACK_LANE_CLASS)}>
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full"
            aria-hidden
            style={{
              background:
                "repeating-linear-gradient(to top, rgba(250,204,21,0.35) 0 12px, rgba(39,39,42,0.9) 12px 24px)",
              boxShadow: "0 0 20px rgba(250,204,21,0.15)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 rounded-full border border-dashed border-zinc-700/40"
            aria-hidden
          />

          {/* Marcos de elo — Bronze em bottom: 0% (ponta da pista) */}
          {RACE_TIER_MARKERS.map((marker) => {
            const tier = tiers.find((x) => x.id === marker.tierId);
            if (!tier) return null;
            const iconSrc = getTokenAssetUrl(tier.token);
            const theme = TIER_ACHIEVEMENT_THEME[marker.tierId];
            const isBronzeStart = marker.tierId === "bronze";

            return (
              <div
                key={marker.tierId}
                className="pointer-events-none absolute left-0 right-0 z-20"
                style={{ bottom: `${marker.percent}%`, transform: "translateY(0)" }}
              >
                <div className="relative flex items-end pb-0">
                  <div
                    className={cn(
                      "flex w-[7.5rem] shrink-0 flex-col items-center rounded-2xl border border-aom-border/50 bg-zinc-950/90 px-2 py-2.5 shadow-lg sm:w-[8.25rem] sm:px-2.5",
                      theme.surfaceClass,
                    )}
                  >
                    {iconSrc ? (
                      <img src={iconSrc} alt="" className="h-9 w-9 object-contain sm:h-10 sm:w-10" width={40} height={40} />
                    ) : null}
                    <p className={cn("mt-1.5 text-center font-[family-name:var(--font-display)] text-[11px] font-semibold leading-tight sm:text-xs", tier.titleClass)}>
                      {tier.rankName}
                      <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-zinc-400">
                        {tier.eraName}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] text-zinc-500">{tier.rrBand}</p>
                  </div>

                  <div
                    className={cn(
                      "absolute bottom-0 flex items-center gap-2",
                      isBronzeStart ? "left-1/2" : "left-[7.5rem] sm:left-[8.25rem]",
                      "right-0",
                    )}
                  >
                    <div
                      className={cn(
                        "h-px min-w-0 flex-1 bg-gradient-to-r to-transparent",
                        isBronzeStart ? "from-amber-500/55" : "from-amber-500/40",
                      )}
                      aria-hidden
                    />
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-zinc-950 text-[10px] font-bold tabular-nums shadow-md sm:h-9 sm:w-9",
                        theme.stepRing,
                        theme.stepAccent,
                      )}
                      aria-hidden
                    >
                      {marker.rrStart}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Jogadores na linha vertical */}
          <div className="pointer-events-none absolute inset-0 z-30">
            {placed.map((player) => (
              <RaceAvatar
                key={player.id}
                player={player}
                hopping={hoppingIds.has(player.id)}
                selected={popover?.player.id === player.id}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>
        </div>

        {popover ? (
          <RacePlayerPopover
            player={popover.player}
            anchorEl={popover.anchor}
            onClose={() => setPopover(null)}
          />
        ) : null}
      </div>

      <p className="mt-2 text-center text-xs text-zinc-600">{t("pages.players.raceSnapshotHint")}</p>
    </div>
  );
}
