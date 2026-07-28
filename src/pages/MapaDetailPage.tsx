import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { AppPageDetail } from "@/components/layout/AppPageDetail";
import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { Section } from "@/components/ui/Section";
import { entityDisplayDescription } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { getMapa3dUrl, getMapaAssetUrl, getMapaPreviewUrl } from "@/lib/entityWatermarkUrls";
import { listIndexBackLinkLabel, listIndexReturnTo } from "@/lib/listIndexReturnState";
import { formatMapaOrigem, mapaOrigemTitleIcons } from "@/lib/mapaOrigemIcons";

function MapaImageSection({
  src,
  mapName,
  title,
  hideUntilLoaded = false,
}: {
  src: string;
  mapName: string;
  title: string;
  hideUntilLoaded?: boolean;
}) {
  const [loaded, setLoaded] = useState(!hideUntilLoaded);

  return (
    <Section title={title} className={loaded ? "mt-6" : "hidden"}>
      <img
        src={src}
        alt={`${mapName} — ${title}`}
        className="mx-auto h-auto w-full rounded-xl object-contain"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (hideUntilLoaded) setLoaded(false);
        }}
      />
    </Section>
  );
}

export function MapaDetailPage() {
  const { t, locale } = useTranslation();
  const { mapaBySlug } = useCatalog();
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/mapas", navState);
  const backLabel = listIndexBackLinkLabel(backToList, t("nav.maps"));
  const { slug } = useParams();
  const m = slug ? mapaBySlug.get(slug) : undefined;

  function fmtSimNao(v: boolean | undefined): string {
    if (v === undefined) return "—";
    return v ? "✅" : "❌";
  }

  if (!m) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">{t("common.entityNotFound.map")}</p>
      </div>
    );
  }

  const mapaIcon = getMapaAssetUrl(m);
  const previewUrl = getMapaPreviewUrl(m);
  const map3dUrl = getMapa3dUrl(m);
  const dlcIcons = mapaOrigemTitleIcons(m.origem);

  return (
    <AppPageDetail
      backTo="/mapas"
      backLabel={backLabel}
      title={m.nome}
      description={entityDisplayDescription(m, locale, t)}
      headerIconSrc={mapaIcon}
      heroBackgroundSrc={previewUrl}
      heroBackgroundFallbackSrc={mapaIcon}
      actions={
        dlcIcons.length ? (
          <div className="flex items-center gap-2">
            {dlcIcons.map((ti) => (
              <img
                key={ti.src}
                src={ti.src}
                alt=""
                title={ti.label}
                draggable={false}
                className="size-12 rounded-lg border border-aom-border/80 bg-zinc-900/50 object-contain p-1 shadow-sm shadow-black/25 sm:size-14"
              />
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t("common.metadata")} className="h-full">
          <div className="space-y-0">
            <InfoRow label={t("common.ranked")}>{fmtSimNao(m.mapas_da_ranqueada)}</InfoRow>
            <InfoRow label={t("common.leftRanked")}>{fmtSimNao(m.saiu_da_ranqueada)}</InfoRow>
            <InfoRow label={t("common.default")}>{fmtSimNao(m.padrao)}</InfoRow>
            <InfoRow label={t("common.quickMatches")}>{fmtSimNao(m.partidas_rapidas)}</InfoRow>
            <InfoRow label={t("common.type")}>{m.tipo ?? "—"}</InfoRow>
            <InfoRow label={t("common.origin")}>{formatMapaOrigem(m.origem) || "—"}</InfoRow>
          </div>
        </Section>
        {mapaIcon ? (
          <Section title={t("common.map2d")} className="h-full">
            <img
              src={mapaIcon}
              alt={`${m.nome} — ${t("common.map2d")}`}
              className="mx-auto h-auto w-full max-w-96 rounded-xl object-contain"
            />
          </Section>
        ) : null}
      </div>
      {previewUrl ? (
        <MapaImageSection
          key={previewUrl}
          src={previewUrl}
          mapName={m.nome}
          title={t("common.mapPreview")}
          hideUntilLoaded
        />
      ) : null}
      {map3dUrl ? (
        <MapaImageSection
          key={map3dUrl}
          src={map3dUrl}
          mapName={m.nome}
          title={t("common.map3d")}
          hideUntilLoaded
        />
      ) : null}
    </AppPageDetail>
  );
}
