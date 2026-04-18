import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { aldeaoById, panteaoById } from "@/data/catalog";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";

export function AldeaoDetailPage() {
  const { id } = useParams();
  const a = aldeaoById.get(Number(id));

  if (!a) {
    return (
      <div>
        <BackLink to="/aldeoes">Aldeões</BackLink>
        <p className="text-zinc-400">Registro não encontrado.</p>
      </div>
    );
  }

  const panteao = a.panteao_id != null ? panteaoById.get(a.panteao_id) : undefined;
  const aldeaoIcon = getAldeaoAssetUrl(a.ingles);

  return (
    <div>
      <BackLink to="/aldeoes">Aldeões</BackLink>
      <PageHeader title={a.nome} description={a.ingles ? `EN: ${a.ingles}` : undefined} headerIconSrc={aldeaoIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Geral">
          <div className="space-y-0">
            {panteao ? (
              <InfoRow label="Panteão">
                <Link to={`/panteoes/${panteao.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                  {panteao.nome}
                </Link>
              </InfoRow>
            ) : (
              <InfoRow label="Panteão">
                <NotionText text={a.panteao} />
              </InfoRow>
            )}
            <InfoRow label="Vida">{a.vida ?? "—"}</InfoRow>
            <InfoRow label="População">{a.populacao ?? "—"}</InfoRow>
            <InfoRow label="Recursos (carry)">{a.recursos ?? "—"}</InfoRow>
            {"ouro" in a && a.ouro != null ? <InfoRow label="Ouro (carry)">{a.ouro}</InfoRow> : null}
            <InfoRow label="Treino (s)">{a.tempo_de_treinamento ?? "—"}</InfoRow>
            <InfoRow label="Treino patch (s)">{a.tempo_de_treinamento_patch_18_65484 ?? "—"}</InfoRow>
          </div>
        </Section>

        <Section title="Taxas de coleta (base)">
          <div className="space-y-0">
            <InfoRow label="Caçar">{a.cacar ?? "—"}</InfoRow>
            <InfoRow label="Gado / galinhas">{a.gado_galinhas ?? "—"}</InfoRow>
            <InfoRow label="Frutinhas">{a.frutinhas ?? "—"}</InfoRow>
            <InfoRow label="Fazenda">{a.fazenda ?? "—"}</InfoRow>
            <InfoRow label="Árvore">{a.arvore ?? "—"}</InfoRow>
            <InfoRow label="Mina">{a.mina ?? "—"}</InfoRow>
            <InfoRow label="Velocidade construção">{a.velocidade_construcao ?? "—"}</InfoRow>
          </div>
        </Section>
      </div>

      <Section title="Bônus percentuais" className="mt-6">
        <div className="space-y-0">
          <InfoRow label="Caçar %">{a.cacar_porcento ?? 0}</InfoRow>
          <InfoRow label="Gado %">{a.gado_porcento ?? 0}</InfoRow>
          <InfoRow label="Frutinhas %">{a.frutinhas_porcento ?? 0}</InfoRow>
          <InfoRow label="Fazenda %">{a.fazenda_porcento ?? 0}</InfoRow>
          <InfoRow label="Árvore %">{a.arvore_porcento ?? 0}</InfoRow>
          <InfoRow label="Mina %">{a.mina_porcento ?? 0}</InfoRow>
          <InfoRow label="Construção %">{a.velocidade_construcao_porcento ?? 0}</InfoRow>
        </div>
      </Section>
    </div>
  );
}
