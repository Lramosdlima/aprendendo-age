import { Link } from "react-router-dom";

import { useTranslation } from "@/hooks/useTranslation";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">
        {t("common.notFound")}
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        <Link to="/" className="text-amber-200 underline-offset-2 hover:underline">
          {t("common.backToHome")}
        </Link>
      </p>
    </div>
  );
}
