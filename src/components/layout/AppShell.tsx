import { useLayoutEffect, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { SettingsMenu } from "@/components/ui/SettingsMenu";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/hooks/useTranslation";
import { localeSectionPath, sectionFromPathSegment, type LocaleSection } from "@/lib/localeRoutes";
import { startNovoTagClassNav } from "@/pages/StartsPage";

const LIST_INDEX_SECTIONS = new Set<LocaleSection>([
  "construcoes",
  "deuses",
  "poderes",
  "mapas",
  "reliquias",
  "starts",
  "tecnologias",
  "unidades",
]);

function isCatalogListIndex(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return false;
  const section = sectionFromPathSegment(segment);
  return section != null && LIST_INDEX_SECTIONS.has(section);
}

type NavItem =
  | { to: string; labelKey: string; end?: boolean; navNovo?: boolean }
  | { to: string; labelKey: string; match: (pathname: string) => boolean; navNovo?: boolean };

function buildNavItems(locale: import("@/i18n/types").Locale): NavItem[] {
  return [
    { to: "/", labelKey: "nav.home", end: true },
    { to: localeSectionPath(locale, "starts"), labelKey: "nav.starts", navNovo: true },
    {
      to: "/trilha-de-aprendizado",
      labelKey: "nav.trilha",
      match: (p: string) => p === "/trilha-de-aprendizado" || p.startsWith("/trilha-de-aprendizado/"),
    },
    {
      to: "/videos-comunidade",
      labelKey: "nav.communityVideos",
      navNovo: true,
      match: (p: string) => p === "/videos-comunidade" || p.startsWith("/videos-comunidade/"),
    },
    { to: localeSectionPath(locale, "panteoes"), labelKey: "nav.pantheons" },
    { to: "/astecas", labelKey: "nav.astecas" },
    { to: localeSectionPath(locale, "deuses"), labelKey: "nav.gods" },
    { to: localeSectionPath(locale, "eras"), labelKey: "nav.eras" },
    { to: localeSectionPath(locale, "poderes"), labelKey: "nav.godpowers" },
    { to: localeSectionPath(locale, "construcoes"), labelKey: "nav.buildings" },
    { to: localeSectionPath(locale, "unidades"), labelKey: "nav.units" },
    { to: localeSectionPath(locale, "aldeoes"), labelKey: "nav.villagers" },
    { to: localeSectionPath(locale, "mapas"), labelKey: "nav.maps" },
    { to: localeSectionPath(locale, "reliquias"), labelKey: "nav.reliquias" },
    { to: localeSectionPath(locale, "tecnologias"), labelKey: "nav.technologies" },
    {
      to: "/rank",
      labelKey: "nav.rank",
      match: (p: string) => p === "/rank" || p.startsWith("/rank/"),
    },
    {
      to: "/jogadores-aom",
      labelKey: "nav.players",
      navNovo: true,
      match: (p: string) => p === "/jogadores-aom" || p === "/aom-players",
    },
    {
      to: "/clans",
      labelKey: "nav.clans",
      match: (p: string) => p === "/clans" || p.startsWith("/clans/"),
    },
    {
      to: "/links-streamers",
      labelKey: "nav.streamerLinks",
      navNovo: true,
      match: (p: string) => p === "/links-streamers" || p === "/streamer-links",
    },
  ];
}

function navClass(active: boolean) {
  return cn(
    "flex min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35"
      : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white",
  );
}

function ShellNavLinks({
  pathname,
  onItemClick,
  t,
  locale,
}: {
  pathname: string;
  onItemClick?: () => void;
  t: (key: string) => string;
  locale: import("@/i18n/types").Locale;
}) {
  const navItems = buildNavItems(locale);
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          onClick={onItemClick}
          className={({ isActive }) =>
            navClass("match" in item ? item.match(pathname) : isActive)
          }
        >
          <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
          {item.navNovo ? (
            <span className={startNovoTagClassNav} title={t("common.newTooltip")}>
              {t("common.new")}
            </span>
          ) : null}
        </NavLink>
      ))}
    </>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-amber-200/95"
      aria-hidden
    >
      {open ? (
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function AppShell() {
  const { pathname, key } = useLocation();
  const { t, locale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    if (isCatalogListIndex(pathname)) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, key]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const appTitle = useMemo(() => t("common.appTitle"), [t]);
  const appByline = useMemo(() => t("common.appByline"), [t]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SettingsMenu />

      <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center gap-3 border-b border-aom-border bg-zinc-950/95 px-3 py-3 backdrop-blur-sm md:hidden">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-aom-border bg-zinc-900/80 text-amber-200 transition-colors hover:bg-zinc-800/90 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
          aria-expanded={mobileMenuOpen}
          aria-controls="app-mobile-nav"
          aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          <MenuGlyph open={mobileMenuOpen} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-wide text-amber-200">
            {appTitle}
          </div>
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </header>

      <aside
        className={cn(
          "hidden shrink-0 border-b border-aom-border bg-zinc-950/95 backdrop-blur-sm md:flex md:flex-col md:w-56 md:border-r md:border-b-0 md:py-6",
          "md:sticky md:top-0 md:z-20 md:self-start md:h-[100dvh] md:min-h-[100dvh] md:overflow-hidden",
        )}
      >
        <div className="shrink-0 px-4 pb-3 pt-4 md:px-5 md:pb-6 md:pt-0">
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide text-amber-200">
            {appTitle}
          </div>
          <p className="mt-1 text-xs text-zinc-500">{appByline}</p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3 md:px-3 md:pb-6">
          <ShellNavLinks pathname={pathname} t={t} locale={locale} />
        </nav>
      </aside>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 md:hidden"
            aria-label={t("common.closeMenu")}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="app-mobile-nav"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col border-r border-aom-border bg-zinc-950 shadow-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("common.navigation")}
          >
            <div className="flex items-start justify-between gap-3 border-b border-aom-border px-4 py-4">
              <div className="min-w-0">
                <div className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide text-amber-200">
                  {appTitle}
                </div>
                <p className="mt-1 text-xs text-zinc-500">{appByline}</p>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-aom-border bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
                aria-label={t("common.closeMenu")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              <ShellNavLinks pathname={pathname} onItemClick={() => setMobileMenuOpen(false)} t={t} locale={locale} />
            </nav>
          </div>
        </>
      ) : null}

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
