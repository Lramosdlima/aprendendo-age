import { useLocation, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { Section } from "@/components/ui/Section";
import { aldeaoBySlug, panteaoById, panteaoSlugById } from "@/data/catalog";
import { firstNome, firstNumId } from "@/lib/entityRefs";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";
import {
  listIndexLinkStateFromLocation,
  listIndexReturnTo,
  listOrDetailBackLinkLabel,
} from "@/lib/listIndexReturnState";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

export function AldeaoDetailPage() {
  const { pathname, search: locSearch, state: navState } = useLocation();
  const linkState = listIndexLinkStateFromLocation(pathname, locSearch);
  const backToList = listIndexReturnTo("/aldeoes", navState);
  const backLabel = listOrDetailBackLinkLabel(backToList, "/aldeoes", "Aldeões");
  const { slug } = useParams();
  const a = slug ? aldeaoBySlug.get(slug) : undefined;

  if (!a) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">Registro não encontrado.</p>
      </div>
    );
  }

  const panteaoId = firstNumId(a.panteao);
  const panteao = panteaoId != null ? panteaoById.get(panteaoId) : undefined;
  const aldeaoIcon = getAldeaoAssetUrl(a);

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader title={a.nome} description={a.ingles ? `Inglês: ${a.ingles}` : undefined} headerIconSrc={aldeaoIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Geral">
          <div className="space-y-0">
            {panteao ? (
              <InfoRow label="Panteão">
                <InfoRowPortraitOrText
                  portraits={
                    <PortraitHeaderActions
                      items={[
                        {
                          key: String(panteao.id),
                          to: `/panteoes/${panteaoSlugById.get(panteao.id) ?? panteao.id}`,
                          nome: panteao.nome,
                          src: getPantheonWatermarkUrl(panteao),
                        },
                      ]}
                      linkState={linkState}
                      size="sm"
                      justify="start"
                    />
                  }
                  textFallback={null}
                />
              </InfoRow>
            ) : firstNome(a.panteao) ? (
              <InfoRow label="Panteão">
                <InfoRowPortraitOrText portraits={null} textFallback={<NotionText text={firstNome(a.panteao)!} />} />
              </InfoRow>
            ) : null}
            <InfoRow label="Vida" icon="aomr_hit_points_icon">
              {a.vida ?? "—"}
            </InfoRow>
            <InfoRow label="População" icon="aomr_population_provision_icon">
              {a.populacao ?? "—"}
            </InfoRow>
            <InfoRow label="Recursos (carry)">{a.recursos ?? "—"}</InfoRow>
            {"ouro" in a && a.ouro != null ? <InfoRow label="Ouro (carry)">{a.ouro}</InfoRow> : null}
            <InfoRow label="Treino (s)" icon="aomr_time_icon">
              {a.tempo_de_treinamento ?? "—"}
            </InfoRow>
            <InfoRow label="Treino patch (s)" icon="aomr_time_icon">
              {a.tempo_de_treinamento_patch_18_65484 ?? "—"}
            </InfoRow>
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
