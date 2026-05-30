import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  AuthError,
  AuthField,
  AuthInput,
  AuthLink,
  AuthPageLayout,
  AuthSubmitButton,
} from "@/components/auth/AuthPageLayout";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { localeAuthPath } from "@/lib/localeRoutes";

export function LoginPage() {
  const { t, locale } = useTranslation();
  const { signIn, status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const unconfigured = status === "unconfigured";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (unconfigured) return;

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    const res = await signIn(email, password);
    setPending(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    const next = safeNextPath(searchParams.get("next"));
    navigate(next, { replace: true });
  }

  return (
    <AuthPageLayout>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-amber-200">
          {t("auth.loginTitle")}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{t("auth.loginSubtitle")}</p>
      </div>

      {unconfigured ? (
        <AuthError message={t("auth.unconfigured")} />
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3">
        <AuthField label={t("auth.email")}>
          <AuthInput
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={t("auth.emailPlaceholder")}
            disabled={unconfigured || pending}
          />
        </AuthField>

        <AuthField label={t("auth.password")}>
          <div className="relative">
            <AuthInput
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder={t("auth.passwordPlaceholder")}
              disabled={unconfigured || pending}
              className="w-full pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {showPassword ? "◉" : "○"}
            </button>
          </div>
        </AuthField>

        <AuthError message={error} />

        <AuthSubmitButton pending={pending} disabled={unconfigured}>
          {pending ? t("common.loading") : t("auth.submitLogin")}
        </AuthSubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-400">
        {t("auth.noAccount")}{" "}
        <AuthLink to={localeAuthPath(locale, "register")}>{t("auth.goRegister")}</AuthLink>
      </p>
    </AuthPageLayout>
  );
}
