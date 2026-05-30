import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { type AomRacePlayer, playerDisplayLabel } from "@/lib/playersApi";
import {
  TIER_ACHIEVEMENT_THEME,
  getRankClassification,
  rankRomanMedallionClass,
  rankRomanStepFromRr,
} from "@/lib/rankClassification";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

const GRID_SCRIM =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M40 0L40 80M0 40L80 40'/%3E%3C/g%3E%3C/svg%3E\")";

function computePosition(anchor: HTMLElement, popover: HTMLElement | null): { top: number; left: number } {
  const pad = 10;
  const gap = 10;
  const rect = anchor.getBoundingClientRect();
  const width = popover?.offsetWidth ?? 268;
  const height = popover?.offsetHeight ?? 148;

  let left = rect.left + rect.width / 2 - width / 2;
  left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));

  const below = rect.bottom + gap;
  const above = rect.top - gap - height;
  const fitsBelow = below + height <= window.innerHeight - pad;
  const top = fitsBelow ? below : Math.max(pad, above);

  return { top, left };
}

type RacePlayerPopoverProps = {
  player: AomRacePlayer;
  anchorEl: HTMLElement;
  onClose: () => void;
};

export function RacePlayerPopover({ player, anchorEl, onClose }: RacePlayerPopoverProps) {
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const cls = getRankClassification(player.rr);
  const theme = TIER_ACHIEVEMENT_THEME[cls.tierId];
  const label = playerDisplayLabel(player);
  const tierIcon = getTokenAssetUrl(cls.ageToken);
  const roman = rankRomanStepFromRr(player.rr);

  useLayoutEffect(() => {
    const update = () => {
      setPosition(computePosition(anchorEl, popoverRef.current));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorEl, player.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorEl.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [anchorEl, onClose]);

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={label}
      className={cn(
        "fixed z-[300] w-[min(17rem,calc(100vw-1.25rem))]",
        "overflow-hidden rounded-2xl border border-aom-border/60 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]",
        theme.surfaceClass,
      )}
      style={{ top: position.top, left: position.left }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: GRID_SCRIM }}
        aria-hidden
      />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 bg-zinc-950 p-0.5 shadow-md",
              theme.stepRing,
            )}
          >
            {player.logoPath ? (
              <img src={player.logoPath} alt="" className="h-full w-full rounded-full object-cover" width={44} height={44} />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-sm text-zinc-500">
                ?
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-wide text-zinc-50">
              {label}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-400">{cls.categoryLabel}</p>
          </div>

          {tierIcon ? (
            <img src={tierIcon} alt="" className="h-9 w-9 shrink-0 object-contain opacity-90" width={36} height={36} />
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div
            className={cn(
              "rounded-xl border border-aom-border/45 bg-zinc-950/60 px-3 py-2.5 text-center ring-inset",
              theme.stepRing,
              "ring-1",
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {t("pages.players.racePopoverRr")}
            </p>
            <p className={cn("mt-1 font-semibold tabular-nums leading-none", theme.stepAccent, "text-xl")}>
              {player.rr}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-aom-border/45 bg-zinc-950/60 px-3 py-2.5 ring-inset",
              theme.stepRing,
              "ring-1",
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {t("pages.players.racePopoverRank")}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold shadow-inner",
                  rankRomanMedallionClass(cls.tierId),
                )}
                aria-hidden
              >
                {roman}
              </span>
              <span className={cn("text-sm font-semibold leading-tight", theme.titleRankClass)}>
                {cls.subcategoryLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
