import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/useTranslation";
import { localeFlag, nextLocale } from "@/lib/locale";
import { swapLocaleInPath } from "@/lib/localeRoutes";
import { cn } from "@/lib/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  return (
    <button
      type="button"
      onClick={() => {
        const next = nextLocale(locale);
        setLocale(next);
        const current = `${pathname}${search}`;
        const swapped = swapLocaleInPath(current, next);
        if (swapped !== current) navigate(swapped);
      }}
      className={cn(
        "fixed right-4 top-[max(1rem,env(safe-area-inset-top,0px)+0.5rem)] z-[60]",
        "flex h-10 w-10 items-center justify-center rounded-full border border-aom-border",
        "bg-zinc-950/90 text-xl shadow-lg shadow-black/30 backdrop-blur-sm",
        "transition hover:border-amber-500/45 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/35",
        className,
      )}
      aria-label={t("common.switchLanguage")}
      title={t("common.switchLanguage")}
    >
      <span aria-hidden>{localeFlag(locale)}</span>
    </button>
  );
}
