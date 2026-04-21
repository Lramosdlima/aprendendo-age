import { useParams } from "react-router-dom";

import { AppPageDetail } from "@/components/layout/AppPageDetail";
import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { Section } from "@/components/ui/Section";
import { mapas } from "@/data/catalog";

function fmtSimNao(v: boolean | undefined): string {
  if (v === undefined) return "—";
  return v ? "Sim" : "Não";
}
import { getMapaAssetUrl, getMapaPreviewUrl } from "@/lib/entityWatermarkUrls";

export function MapaDetailPage() {
  const { index } = useParams();
  const i = Number(index);
  const m = Number.isFinite(i) && i >= 0 && i < mapas.length ? mapas[i] : undefined;

  if (!m) {
    return (
      <div>
        <BackLink to="/mapas">Mapas</BackLink>
        <p className="text-zinc-400">Mapa não encontrado.</p>
      </div>
    );
  }

  const mapaIcon = getMapaAssetUrl(m.ingles);
  const previewUrl = getMapaPreviewUrl(m.ingles);

  return (
    <AppPageDetail
      backTo="/mapas"
      backLabel="Mapas"
      title={m.nome}
      description={m.ingles ? `EN: ${m.ingles}` : undefined}
      headerIconSrc={mapaIcon}
      heroBackgroundSrc={previewUrl}
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
