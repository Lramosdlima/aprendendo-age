import { ModalApp } from "@/components/ui/ModalApp";
import { useTranslation } from "@/hooks/useTranslation";
import { FAVOR_EFFECT_COSTS } from "@/lib/battleGame";
import { cn } from "@/lib/cn";
import { getIconFieldUrl } from "@/lib/notionTokenAssets";

type Props = {
  open: boolean;
  favor: number;
  defenderRevealed: boolean;
  deckUnitRevealPurchased: boolean;
  onClose: () => void;
  onRevealDefender: () => void;
  onRevealDeckUnit: () => void;
};

export function BattleFavorModal({
  open,
  favor,
  defenderRevealed,
  deckUnitRevealPurchased,
  onClose,
  onRevealDefender,
  onRevealDeckUnit,
}: Props) {
  const { t } = useTranslation();
  const favorIcon = getIconFieldUrl("favoraom");

  return (
    <ModalApp
      open={open}
      onClose={onClose}
      title={t("pages.battle.favorShopTitle")}
      description={t("pages.battle.favorShopDescription")}
      className="max-w-xl"
    >
      <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-400/25 bg-blue-950/30 px-4 py-3">
        {favorIcon ? (
          <img src={favorIcon} alt="" aria-hidden className="size-7 object-contain" />
        ) : null}
        <span className="text-lg font-bold tabular-nums text-blue-100">{favor}</span>
        <span className="text-sm text-blue-200/70">{t("pages.battle.favor")}</span>
      </div>

      <div className="grid gap-3">
        <EffectButton
          title={t("pages.battle.revealDefenderCategory")}
          description={t("pages.battle.revealDefenderCategoryHint")}
          cost={FAVOR_EFFECT_COSTS.revealDefenderCategory}
          disabled={
            defenderRevealed ||
            favor < FAVOR_EFFECT_COSTS.revealDefenderCategory
          }
          purchased={defenderRevealed}
          favorIcon={favorIcon}
          onClick={onRevealDefender}
        />
        <EffectButton
          title={t("pages.battle.revealDeckUnitCategory")}
          description={t("pages.battle.revealDeckUnitCategoryHint")}
          cost={FAVOR_EFFECT_COSTS.revealDeckUnitCategory}
          disabled={
            deckUnitRevealPurchased ||
            favor < FAVOR_EFFECT_COSTS.revealDeckUnitCategory
          }
          purchased={deckUnitRevealPurchased}
          favorIcon={favorIcon}
          onClick={onRevealDeckUnit}
        />
      </div>
    </ModalApp>
  );
}

function EffectButton({
  title,
  description,
  cost,
  disabled,
  purchased,
  favorIcon,
  onClick,
}: {
  title: string;
  description: string;
  cost: number;
  disabled: boolean;
  purchased: boolean;
  favorIcon?: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
        disabled
          ? "cursor-not-allowed border-zinc-800 bg-zinc-900/40 opacity-55"
          : "border-blue-400/30 bg-blue-950/20 hover:border-blue-300/55 hover:bg-blue-950/35 focus:outline-none focus:ring-2 focus:ring-blue-400/30",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-blue-50">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-400/25 bg-blue-950/50 px-2.5 py-1 text-sm font-bold tabular-nums text-blue-100">
        {purchased ? (
          t("pages.battle.effectActive")
        ) : (
          <>
            {favorIcon ? (
              <img src={favorIcon} alt="" aria-hidden className="size-4 object-contain" />
            ) : null}
            {cost}
          </>
        )}
      </span>
    </button>
  );
}
