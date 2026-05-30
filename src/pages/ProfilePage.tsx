import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { localeAuthPath } from "@/lib/localeRoutes";

function formatMemberSince(iso: string | null, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
      dateStyle: "long",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ProfilePage() {
  const { t, locale } = useTranslation();
  const { status, profile, profileLoadState, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || status === "unconfigured") {
      const next = encodeURIComponent(`${location.pathname}${location.search}`);
      navigate(`${localeAuthPath(locale, "login")}?next=${next}`, { replace: true });
    }
  }, [locale, location.pathname, location.search, navigate, status]);

  if (status === "loading" || status === "unauthenticated" || status === "unconfigured") {
    return (
      <AuthPageLayout>
        <p className="text-sm text-zinc-400">{t("auth.redirecting")}</p>
      </AuthPageLayout>
    );
  }

  const loadingProfile = profileLoadState !== "ready";
  const displayName = profile?.displayName?.trim() || "—";
  const email = profile?.email?.trim() || "—";
  const memberSince = formatMemberSince(profile?.createdAt ?? null, locale);

  return (
    <AuthPageLayout>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-amber-200">
          {t("auth.profileTitle")}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{t("auth.profileSubtitle")}</p>
      </div>

      {loadingProfile ? (
        <p className="mb-4 text-sm text-zinc-400">{t("auth.loadingProfile")}</p>
      ) : null}

      <dl className="flex flex-col gap-4 text-sm">
        <div>
          <dt className="text-zinc-500">{t("auth.nickname")}</dt>
          <dd className="mt-0.5 font-medium text-zinc-100">{displayName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("auth.email")}</dt>
          <dd className="mt-0.5 font-medium text-zinc-100">{email}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t("auth.memberSince")}</dt>
          <dd className="mt-0.5 font-medium text-zinc-100">{memberSince}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => void signOut().then(() => navigate("/"))}
        className={cn(
          "mt-6 w-full rounded-lg border border-aom-border bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-200",
          "transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-100",
          "focus:outline-none focus:ring-2 focus:ring-amber-500/35",
        )}
      >
        {t("auth.signOut")}
      </button>
    </AuthPageLayout>
  );
}
