import { Link } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { TrilhaTokenImg } from "./TrilhaTokenImg";
import { tiposImg, trilhaShared } from "./trilhaAssets";

const YT_MICRAGEM = "https://www.youtube.com/embed/zE27Ehwk3Cs";

function Tok({ name }: { name: string }) {
  const src = getTokenAssetUrl(name);
  return src ? (
    <img src={src} alt="" title={name} className="inline h-[1em] w-[1em] align-[-0.15em] object-contain" />
  ) : null;
}

export function TiposUnidadesMultiplicadoresPage() {
  const { t } = useTranslation();

  return (
    <div>
      <BackLink to="/trilha-de-aprendizado">{t("pages.trilha.backLink")}</BackLink>
      <PageHeader
        headerIconSrc={getTokenAssetUrl("aomr_type_myth_unit_icon")}
        title={t("pages.trilha.multipliers.title")}
        description={t("pages.trilha.multipliers.description")}
      />

      <article className="space-y-10 text-sm leading-relaxed text-zinc-300">
        <section className="space-y-3">
          <p>{t("pages.trilha.multipliers.introP1")}</p>
          <p>{t("pages.trilha.multipliers.introP2a")}</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <a href={tiposImg("image.webp")} target="_blank" rel="noreferrer" className="shrink-0">
              <img
                src={tiposImg("image.webp")}
                alt={t("pages.trilha.multipliers.hoplitePanelAlt")}
                className="max-w-md rounded-lg border border-aom-border"
              />
            </a>
            <p className="min-w-0 flex-1">{t("pages.trilha.multipliers.introP3")}</p>
          </div>
          <div className="flex justify-center">
            <a href={tiposImg("image 1.png")} target="_blank" rel="noreferrer">
              <img
                src={tiposImg("image 1.png")}
                alt={t("pages.trilha.multipliers.hippeusAlt")}
                className="max-w-sm rounded-lg border border-aom-border"
              />
            </a>
          </div>
        </section>

        <section>
          <p>
            {t("pages.trilha.multipliers.spreadsheetLinkBefore")}
            <Link to="/unidades" className="font-medium text-amber-200 underline hover:text-amber-50">
              {t("pages.trilha.index.step3CardTitle")}
            </Link>
            {t("pages.trilha.multipliers.spreadsheetLinkAfter")}
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.humanSoldiersTitle")}
          </h2>
          <p className="mb-4">{t("pages.trilha.multipliers.humanSoldiersIntro")}</p>
          <div className="space-y-3">
            <TrilhaCallout variant="teal" icon={<Tok name="aomr_type_infantry_icon" />}>
              <p>
                <span className="font-semibold text-red-300">{t("pages.trilha.multipliers.infantryLabel")}</span>{" "}
                {t("pages.trilha.multipliers.infantryDesc")}
              </p>
            </TrilhaCallout>
            <TrilhaCallout variant="teal" icon={<Tok name="aomr_type_cavalry_icon" />}>
              <p>
                <span className="font-semibold text-teal-300">{t("pages.trilha.multipliers.cavalryLabel")}</span>{" "}
                {t("pages.trilha.multipliers.cavalryDesc")}
              </p>
            </TrilhaCallout>
            <TrilhaCallout variant="teal" icon={<Tok name="aomr_type_archer_icon" />}>
              <p>
                <span className="font-semibold text-sky-300">{t("pages.trilha.multipliers.archersLabel")}</span>{" "}
                {t("pages.trilha.multipliers.archersDesc")}
              </p>
            </TrilhaCallout>
          </div>
          <blockquote className="mt-4 border-l-2 border-zinc-600 pl-4 text-zinc-300">
            <span className="text-red-300">{t("pages.trilha.multipliers.infantryLabel")}</span>{" "}
            <Tok name="aomr_type_infantry_icon" /> →{" "}
            <span className="text-teal-300">{t("pages.trilha.multipliers.cavalryLabel")}</span>{" "}
            <Tok name="aomr_type_cavalry_icon" /> →{" "}
            <span className="text-sky-300">{t("pages.trilha.multipliers.archersLabel")}</span>{" "}
            <Tok name="aomr_type_archer_icon" /> →{" "}
            <span className="text-red-300">{t("pages.trilha.multipliers.infantryLabel")}</span>{" "}
            <Tok name="aomr_type_infantry_icon" />
            <img
              src={tiposImg("Militares_Beneficios.png")}
              alt={t("pages.trilha.multipliers.triangleDiagramAlt")}
              className="mt-3 max-w-full rounded-lg border border-aom-border"
            />
          </blockquote>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.mythUnitsTitle")}
          </h2>
          <p>{t("pages.trilha.multipliers.mythUnitsDesc")}</p>
          <img src={tiposImg("image 2.png")} alt="" className="mt-3 max-w-xs rounded-lg border border-aom-border" />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.heroesTitle")}
          </h2>
          <p>{t("pages.trilha.multipliers.heroesDesc")}</p>
          <img src={tiposImg("image 3.png")} alt="" className="mt-3 max-w-xs rounded-lg border border-aom-border" />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.navalTitle")}
          </h2>
          <p>{t("pages.trilha.multipliers.navalDesc")}</p>
          <img
            src={tiposImg("Barcos_Beneficios.png")}
            alt={t("pages.trilha.multipliers.navalDiagramAlt")}
            className="mt-4 max-w-full rounded-lg border border-aom-border"
          />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.siegeTitle")}
          </h2>
          <p>{t("pages.trilha.multipliers.siegeDesc")}</p>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.categoriesTitle")}
          </h2>
          <img
            src={tiposImg("image 4.png")}
            alt={t("pages.trilha.multipliers.categoriesAlt")}
            className="max-w-full rounded-lg border border-aom-border"
          />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.videoTitle")}
          </h2>
          <div className="aspect-video max-w-2xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
            <iframe
              title={t("pages.trilha.multipliers.videoIframeTitle")}
              src={YT_MICRAGEM}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.rpsTitle")}
          </h2>
          <TrilhaCallout
            variant="teal"
            icon={<img src={trilhaShared("ScoobyManiaco_Perfil.png")} alt="" className="h-10 w-10 rounded-full object-cover" />}
          >
            <p>{t("pages.trilha.multipliers.scoobyCallout")}</p>
          </TrilhaCallout>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <img src={tiposImg("Contra_-Mitica.png")} alt="" className="rounded-lg border border-aom-border" />
            <img src={tiposImg("Elementos_Primarios.jpg")} alt="" className="rounded-lg border border-aom-border" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.damageTypesTitle")}
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-red-200">
                <TrilhaTokenImg token="hackdamage" className="h-6 w-6 object-contain" />{" "}
                {t("pages.trilha.multipliers.hackDamageTitle")}
              </h3>
              <p className="mt-2">{t("pages.trilha.multipliers.hackDamageDesc")}</p>
            </div>
            <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-sky-200">
                <TrilhaTokenImg token="piercedamage" className="h-6 w-6 object-contain" />{" "}
                {t("pages.trilha.multipliers.pierceDamageTitle")}
              </h3>
              <p className="mt-2">{t("pages.trilha.multipliers.pierceDamageDesc")}</p>
            </div>
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-amber-200">
                <TrilhaTokenImg token="crushdamage" className="h-6 w-6 object-contain" />{" "}
                {t("pages.trilha.multipliers.crushDamageTitle")}
              </h3>
              <p className="mt-2">{t("pages.trilha.multipliers.crushDamageDesc")}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">
            {t("pages.trilha.multipliers.defensesTitle")}
          </h2>
          <p>{t("pages.trilha.multipliers.defensesIntro")}</p>
          <blockquote className="mt-3 border-l-2 border-zinc-600 pl-4 text-zinc-400">
            {t("pages.trilha.multipliers.defensesExample")}
          </blockquote>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-red-900/35 bg-red-950/15 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-red-200">
                <TrilhaTokenImg token="hackarmor" className="h-6 w-6 object-contain" />{" "}
                {t("pages.trilha.multipliers.hackArmorTitle")}
              </h3>
              <p className="mt-2">{t("pages.trilha.multipliers.hackArmorDesc")}</p>
            </div>
            <div className="rounded-xl border border-sky-900/35 bg-sky-950/15 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-sky-200">
                <TrilhaTokenImg token="piercearmor" className="h-6 w-6 object-contain" />{" "}
                {t("pages.trilha.multipliers.pierceArmorTitle")}
              </h3>
              <p className="mt-2">{t("pages.trilha.multipliers.pierceArmorDesc")}</p>
            </div>
            <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-200">
                <TrilhaTokenImg token="crusharmor" className="h-6 w-6 object-contain" />{" "}
                {t("pages.trilha.multipliers.crushArmorTitle")}
              </h3>
              <p className="mt-2">{t("pages.trilha.multipliers.crushArmorDesc")}</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
