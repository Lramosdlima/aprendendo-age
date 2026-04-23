import { useLocation, useParams } from "react-router-dom";

import { AppPageDetail } from "@/components/layout/AppPageDetail";
import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { Section } from "@/components/ui/Section";
import { mapaBySlug } from "@/data/catalog";
import { getMapaAssetUrl, getMapaPreviewUrl } from "@/lib/entityWatermarkUrls";
import { listIndexBackLinkLabel, listIndexReturnTo } from "@/lib/listIndexReturnState";

function fmtSimNao(v: boolean | undefined): string {
  if (v === undefined) return "—";
  return v ? "Sim" : "Não";
}

export function MapaDetailPage() {
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/mapas", navState);
  const backLabel = listIndexBackLinkLabel(backToList, "Mapas");
  const { slug } = useParams();
  const m = slug ? mapaBySlug.get(slug) : undefined;

  if (!m) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">Mapa não encontrado.</p>
      </div>
    );
  }

  const mapaIcon = getMapaAssetUrl(m);
  const previewUrl = getMapaPreviewUrl(m);

  return (
    <AppPageDetail
      backTo="/mapas"
      backLabel={backLabel}
      title={m.nome}
      description={m.ingles ? `Inglês: ${m.ingles}` : undefined}
      headerIconSrc={mapaIcon}
      heroBackgroundSrc={previewUrl}
      heroBackgroundFallbackSrc={mapaIcon}
    >
      <Section title="Metadados">
        <div className="space-y-0">
          <InfoRow label="Ranqueada">{fmtSimNao(m.mapas_da_ranqueada)}</InfoRow>
          <InfoRow label="Saiu da ranqueada">{fmtSimNao(m.saiu_da_ranqueada)}</InfoRow>
          <InfoRow label="Padrão">{fmtSimNao(m.padrao)}</InfoRow>
          <InfoRow label="Partidas rápidas">{fmtSimNao(m.partidas_rapidas)}</InfoRow>
          <InfoRow label="Tipo">{m.tipo ?? "—"}</InfoRow>
          <InfoRow label="Origem">{m.origem ?? "—"}</InfoRow>
        </div>
      </Section>
    </AppPageDetail>
  );
}
