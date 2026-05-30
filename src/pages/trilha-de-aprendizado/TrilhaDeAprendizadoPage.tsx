import type { ReactNode } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { trilhaShared } from "./trilhaAssets";

const YT_APRENDENDO_AGE = "https://www.youtube.com/embed/fT66Hc4XcRo";
const BATTLE_SIM = "https://www.aom-battlesimulator.net/#/";

export function TrilhaDeAprendizadoPage() {
  const { t } = useTranslation();
  const archaic = getTokenAssetUrl("aomr_archaic_age_icon");
  const wonder = getTokenAssetUrl("aomr_wonder_age_icon");

  return (
    <div>
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="text-zinc-500">{t("pages.trilha.index.trilhaLabel")}</span>
            <span>
              {t("pages.trilha.index.titlePrefix")}{" "}
              <span className="text-amber-200/95">{t("pages.trilha.index.titleNoob")}</span>{" "}
              {archaic ? <img src={archaic} alt="" className="inline-block h-7 w-7 align-[-0.2em] object-contain" /> : null}{" "}
              {t("pages.trilha.index.titleJoin")}{" "}
              <span className="text-sky-300/95">{t("pages.trilha.index.titlePro")}</span>{" "}
              {wonder ? <img src={wonder} alt="" className="inline-block h-7 w-7 align-[-0.2em] object-contain" /> : null}!
            </span>
          </span>
        }
        description={t("pages.trilha.index.pageDescription")}
      />

      <TrilhaCallout
        variant="teal"
        icon={<img src={trilhaShared("ScoobyManiaco_Perfil.png")} alt="" className="h-12 w-12 rounded-full object-cover" />}
      >
        <p>
          <span className="font-semibold text-teal-300">Scooby: </span>
          {t("pages.trilha.index.callout")}
        </p>
      </TrilhaCallout>

      <ol className="mt-10 space-y-10">
        <TrilhaStep
          n={1}
          title={t("pages.trilha.index.step1")}
          emoji="💪"
          body={
            <>
              <p>{t("pages.trilha.index.step1Body")}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/trilha-de-aprendizado/tipos-unidades-multiplicadores"
                    title={t("pages.trilha.index.step1CardTitle")}
                    subtitle={t("pages.trilha.index.step1CardSubtitle")}
                    watermarkSrc={getTokenAssetUrl("aomr_type_myth_unit_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={2}
          title={t("pages.trilha.index.step2")}
          emoji="⏳"
          body={
            <>
              <p>{t("pages.trilha.index.step2Body")}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/eras"
                    title={t("nav.eras")}
                    subtitle={t("pages.trilha.index.step2CardSubtitle")}
                    watermarkSrc={getTokenAssetUrl("aomr_wonder_age_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={3}
          title={t("pages.trilha.index.step3")}
          emoji="📊"
          body={
            <>
              <p>{t("pages.trilha.index.step3Body")}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/unidades"
                    title={t("pages.trilha.index.step3CardTitle")}
                    subtitle={t("pages.trilha.index.step3CardSubtitle")}
                    watermarkSrc={getTokenAssetUrl("aomr_type_human_soldier_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={4}
          title={t("pages.trilha.index.step4")}
          emoji="⏭"
          body={
            <>
              <p>{t("pages.trilha.index.step4Body")}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/trilha-de-aprendizado/atalhos-importantes"
                    title={t("pages.trilha.index.step4CardTitle")}
                    subtitle={t("pages.trilha.index.step4CardSubtitle")}
                    watermarkSrc={getTokenAssetUrl("AoMR_Rate_of_Fire_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={5}
          title={t("pages.trilha.index.step5")}
          emoji="📋"
          body={
            <>
              <p>{t("pages.trilha.index.step5Body")}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/starts"
                    title={t("nav.starts")}
                    subtitle={t("pages.trilha.index.step5CardSubtitle")}
                    watermarkSrc={getTokenAssetUrl("aomr_time_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={6}
          title={t("pages.trilha.index.step6")}
          emoji="🎯"
          body={
            <>
              <p>{t("pages.trilha.index.step6Body")}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/trilha-de-aprendizado/rush-turtle-boom"
                    title={t("pages.trilha.index.step6CardTitle")}
                    subtitle={t("pages.trilha.index.step6CardSubtitle")}
                    watermarkSrc={getTokenAssetUrl("aomr_classical_age_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={7}
          title={t("pages.trilha.index.step7")}
          emoji="📺"
          body={
            <>
              <p className="mb-4">{t("pages.trilha.index.step7Body")}</p>
              <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40 shadow-lg shadow-black/40">
                <iframe
                  title={t("pages.trilha.index.step7VideoTitle")}
                  src={YT_APRENDENDO_AGE}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-zinc-400">
                <li>{t("pages.trilha.index.step7Chapter1")}</li>
                <li>{t("pages.trilha.index.step7Chapter2")}</li>
                <li>{t("pages.trilha.index.step7Chapter3")}</li>
                <li>{t("pages.trilha.index.step7Chapter4")}</li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={8}
          title={t("pages.trilha.index.step8")}
          emoji="⚔"
          body={
            <>
              <p className="text-zinc-400">
                <em>{t("pages.trilha.index.step8Credits")}</em> {t("pages.trilha.index.step8Desc")}
              </p>
              <p className="pt-3">
                <a
                  href={BATTLE_SIM}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-amber-200 underline decoration-amber-500/50 underline-offset-4 hover:text-amber-50"
                >
                  {BATTLE_SIM} ↗
                </a>
              </p>
            </>
          }
        />
      </ol>
    </div>
  );
}

function TrilhaStep({
  n,
  title,
  emoji,
  body,
}: {
  n: number;
  title: string;
  emoji: string;
  body: ReactNode;
}) {
  return (
    <li className="list-none">
      <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/40 p-5 shadow-sm shadow-black/20">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-100">
          <span className="text-zinc-500">{n}. </span>
          {emoji} {title}
        </h2>
        <div className="mt-3 space-y-2 text-sm text-zinc-300">{body}</div>
      </div>
    </li>
  );
}
