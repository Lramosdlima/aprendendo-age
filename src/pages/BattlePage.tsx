import { Link } from "react-router-dom";

import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/hooks/useTranslation";

export function BattlePage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("pages.battle.title")} description={t("pages.battle.description")} />
      <div className="mx-auto grid max-w-2xl gap-4">
        <Link
          to="/battle/random"
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-zinc-950 to-zinc-900",
            "px-6 py-8 text-center shadow-lg shadow-amber-900/20 transition",
            "hover:border-amber-400/70 hover:shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/40",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_55%)] opacity-80 transition group-hover:opacity-100" />
          <p className="relative font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-amber-100">
            {t("pages.battle.randomBattle")}
          </p>
          <p className="relative mt-2 text-sm text-zinc-400">{t("pages.battle.randomBattleHint")}</p>
        </Link>

        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-2xl border border-zinc-800 bg-zinc-950/60 px-6 py-8 text-center opacity-55"
        >
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-zinc-500">
            {t("pages.battle.comingSoon")}
          </p>
          <p className="mt-2 text-sm text-zinc-600">{t("pages.battle.comingSoonHint")}</p>
        </button>
      </div>
    </div>
  );
}
