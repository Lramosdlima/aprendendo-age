import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ClanLogo } from "@/components/clans/ClanLogo";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Clan } from "@/data/clans";
import { useTranslation } from "@/hooks/useTranslation";
import { getClanLogoUrl } from "@/lib/clanAssetUrl";
import { clanSlugFromTag } from "@/lib/clanSlug";
import { fetchClans } from "@/lib/clansApi";
import { cn } from "@/lib/cn";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function ClansTable({ clans, t }: { clans: Clan[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{t("pages.clans.tableCaption")}</caption>
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th scope="col" className="w-16 px-4 py-3 font-medium">
                {t("pages.clans.logo")}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {t("common.tag")}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {t("common.name")}
              </th>
            </tr>
          </thead>
          <tbody>
            {clans.map((c, i) => (
              <tr
                key={c.id}
                className={cn(
                  "border-b border-zinc-800/90 transition-colors hover:bg-zinc-900/50",
                  i % 2 === 0 ? "bg-zinc-950/25" : "bg-zinc-900/20",
                )}
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/clans/${clanSlugFromTag(c.tag)}`}
                    className="inline-flex rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  >
                    <ClanLogo
                      tag={c.tag}
                      logoSrc={getClanLogoUrl(c)}
                      logoComingSoonLabel={t("pages.clans.logoComingSoon", { name: c.name })}
                    />
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/clans/${clanSlugFromTag(c.tag)}`}
                    className="font-mono text-sm font-medium text-sky-400/95 transition hover:text-sky-300"
                  >
                    {c.tag}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <Link to={`/clans/${clanSlugFromTag(c.tag)}`} className="text-zinc-100 transition hover:text-white">
                    {c.name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-zinc-800/90 md:hidden" aria-label={t("pages.clans.listAria")}>
        {clans.map((c, i) => (
          <li key={c.id}>
            <Link
              to={`/clans/${clanSlugFromTag(c.tag)}`}
              className={cn(
                "flex items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-900/40",
                i % 2 === 0 ? "bg-zinc-950/30" : "bg-zinc-900/15",
              )}
            >
              <ClanLogo
                tag={c.tag}
                logoSrc={getClanLogoUrl(c)}
                logoComingSoonLabel={t("pages.clans.logoComingSoon", { name: c.name })}
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium text-sky-400/95">{c.tag}</p>
                <p className="truncate text-sm text-zinc-200">{c.name}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ClansPage() {
  const { t } = useTranslation();
  const supabaseConfigured = isSupabaseConfigured();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      setClans([]);
      setError(null);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setError(t("pages.clans.loadTimeout"));
        setLoading(false);
      }
    }, 20_000);

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchClans();
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setClans(list);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setError(err instanceof Error ? err.message : t("pages.clans.loadError"));
        setClans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [supabaseConfigured, t]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader title={t("pages.clans.title")} description={t("pages.clans.description")} />

      <div className="overflow-hidden rounded-2xl border border-aom-border/60 bg-[#141414] shadow-lg shadow-black/40">
        <div className="border-b border-zinc-800/90 px-4 py-3 sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{t("common.community")}</p>
          <p className="mt-1 text-sm text-zinc-400">{t("pages.clans.sectionDesc")}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <span
              className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-500"
              aria-hidden
            />
            <p className="mt-4 text-sm text-zinc-500">{t("pages.clans.loading")}</p>
          </div>
        ) : !supabaseConfigured ? (
          <p
            className="m-4 rounded-xl border border-amber-900/45 bg-amber-950/35 px-4 py-3 text-sm text-amber-100/90"
            role="status"
          >
            {t("pages.clans.unconfigured")}
          </p>
        ) : error ? (
          <p
            className="m-4 rounded-xl border border-red-900/45 bg-red-950/35 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : clans.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-zinc-500">{t("pages.clans.empty")}</p>
        ) : (
          <ClansTable clans={clans} t={t} />
        )}
      </div>
    </div>
  );
}
