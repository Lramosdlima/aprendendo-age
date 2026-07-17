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

function Mapa3dSection({ src, mapName, title }: { src: string; mapName: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Section title={title} className={loaded ? "mt-6" : "hidden"}>
      <img
        src={src}
        alt={`${mapName} — ${title}`}
        className="mx-auto h-auto w-full rounded-xl object-contain"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
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
    return v ? t("common.yes") : t("common.no");
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

  return (
    <AppPageDetail
      backTo="/mapas"
      backLabel={backLabel}
      title={m.nome}
      description={entityDisplayDescription(m, locale, t)}
      headerIconSrc={mapaIcon}
      heroBackgroundSrc={previewUrl}
      heroBackgroundFallbackSrc={mapaIcon}
    >
      <Section title={t("common.metadata")}>
        <div className="space-y-0">
          <InfoRow label={t("common.ranked")}>{fmtSimNao(m.mapas_da_ranqueada)}</InfoRow>
          <InfoRow label={t("common.leftRanked")}>{fmtSimNao(m.saiu_da_ranqueada)}</InfoRow>
          <InfoRow label={t("common.default")}>{fmtSimNao(m.padrao)}</InfoRow>
          <InfoRow label={t("common.quickMatches")}>{fmtSimNao(m.partidas_rapidas)}</InfoRow>
          <InfoRow label={t("common.type")}>{m.tipo ?? "—"}</InfoRow>
          <InfoRow label={t("common.origin")}>{m.origem ?? "—"}</InfoRow>
        </div>
      </Section>
      {map3dUrl ? (
        <Mapa3dSection key={map3dUrl} src={map3dUrl} mapName={m.nome} title={t("common.map3d")} />
      ) : null}
    </AppPageDetail>
  );
}
