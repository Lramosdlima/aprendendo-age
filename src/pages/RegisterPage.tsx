import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { localeAuthPath } from "@/lib/localeRoutes";

export function RegisterPage() {
  const { t, locale } = useTranslation();
  const { signUp, status } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const unconfigured = status === "unconfigured";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (unconfigured) return;

    const form = new FormData(e.currentTarget);
    const nickname = String(form.get("nickname") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    const res = await signUp(nickname, email, password);
    setPending(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    navigate(localeAuthPath(locale, "profile"), { replace: true });
  }

  return (
    <AuthPageLayout>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-amber-200">
          {t("auth.registerTitle")}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{t("auth.registerSubtitle")}</p>
      </div>

      {unconfigured ? (
        <AuthError message={t("auth.unconfigured")} />
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3">
        <AuthField label={t("auth.nickname")}>
          <AuthInput
            name="nickname"
            type="text"
            autoComplete="nickname"
            required
            placeholder={t("auth.nicknamePlaceholder")}
            disabled={unconfigured || pending}
          />
        </AuthField>

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
              autoComplete="new-password"
              required
              minLength={6}
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
          {pending ? t("common.loading") : t("auth.submitRegister")}
        </AuthSubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-400">
        {t("auth.hasAccount")}{" "}
        <AuthLink to={localeAuthPath(locale, "login")}>{t("auth.goLogin")}</AuthLink>
      </p>
    </AuthPageLayout>
  );
}
