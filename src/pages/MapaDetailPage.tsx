import { useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { mapas } from "@/data/catalog";
import { getMapaAssetUrl } from "@/lib/entityWatermarkUrls";

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

  return (
    <div>
      <BackLink to="/mapas">Mapas</BackLink>
      <PageHeader title={m.nome} description={m.ingles ? `EN: ${m.ingles}` : undefined} headerIconSrc={mapaIcon} />

      <Section title="Metadados">
        <div className="space-y-0">
          <InfoRow label="Índice no JSON">{i}</InfoRow>
          <InfoRow label="Ranqueada">{m.mapas_da_ranqueada ?? "—"}</InfoRow>
          <InfoRow label="Saiu da ranqueada">{m.saiu_da_ranqueada ?? "—"}</InfoRow>
          <InfoRow label="Padrão">{m.padrao ?? "—"}</InfoRow>
          <InfoRow label="Partidas rápidas">{m.partidas_rapidas ?? "—"}</InfoRow>
          <InfoRow label="Tipo">{m.tipo ?? "—"}</InfoRow>
          <InfoRow label="Origem">{m.origem ?? "—"}</InfoRow>
        </div>
      </Section>
    </div>
  );
}
