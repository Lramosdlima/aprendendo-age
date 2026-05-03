import { useLocation, useParams } from "react-router-dom";

import { DeusPortraitHeaderActions } from "@/components/deus/DeusPortraitHeaderActions";
import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { Section } from "@/components/ui/Section";
import { deusById, deusSlugById, eraById, eraSlugById, godpowerBySlug, panteaoById, panteaoSlugById } from "@/data/catalog";
import { formatGodNameStringForMetaNotion, getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { firstNome, firstNumId } from "@/lib/entityRefs";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";
import { listIndexBackLinkLabel, listIndexLinkStateFromLocation, listIndexReturnTo } from "@/lib/listIndexReturnState";

export function GodpowerDetailPage() {
  const { pathname, search: locSearch, state: navState } = useLocation();
  const deusLinkFromPowerState = listIndexLinkStateFromLocation(pathname, locSearch);
  const backToList = listIndexReturnTo("/poderes", navState);
  const backLabel = listIndexBackLinkLabel(backToList, "Poderes divinos");
  const { slug } = useParams();
  const g = slug ? godpowerBySlug.get(slug) : undefined;

  if (!g) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">Poder não encontrado.</p>
      </div>
    );
  }

  const godId = firstNumId(g.god);
  const eraId = firstNumId(g.era);
  const panteaoId = firstNumId(g.panteao);
  const deus = godId != null ? deusById.get(godId) : undefined;
  const era = eraId != null ? eraById.get(eraId) : undefined;
  const panteao = panteaoId != null ? panteaoById.get(panteaoId) : undefined;
  const powerIcon = getGodPowerAssetUrl(g);

  const deusSlug = deus ? (deusSlugById.get(deus.id) ?? String(deus.id)) : undefined;
  const deusPortraitItems =
    deus && deusSlug
      ? [
          {
            key: String(deus.id),
            slug: deusSlug,
            nome: deus.nome,
            src: getDeusAssetUrl(deus),
          },
        ]
      : [];

  const eraPortraitItems =
    era != null
      ? [
          {
            key: `era-${era.id}`,
            to: `/eras/${eraSlugById.get(era.id) ?? era.id}`,
            nome: era.nome,
            src: getEraAssetUrl(era),
          },
        ]
      : [];

  const panteaoPortraitItems =
    panteao != null
      ? [
          {
            key: `panteao-${panteao.id}`,
            to: `/panteoes/${panteaoSlugById.get(panteao.id) ?? panteao.id}`,
            nome: panteao.nome,
            src: getPantheonWatermarkUrl(panteao),
          },
        ]
      : [];

  const godNomeRef = firstNome(g.god);
  const eraNomeRef = firstNome(g.era);
  const panteaoNomeRef = firstNome(g.panteao);

  const showDeusRow = !!(deusPortraitItems.length || godNomeRef);
  const showEraRow = !!(eraPortraitItems.length || eraNomeRef);
  const showPanteaoRow = !!(panteaoPortraitItems.length || panteaoNomeRef);

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader title={g.nome} description={g.ingles ? `Inglês: ${g.ingles}` : undefined} headerIconSrc={powerIcon} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Ligações">
          <div className="space-y-0">
            {showDeusRow ? (
              <InfoRow label="Deus">
                <InfoRowPortraitOrText
                  portraits={
                    deusPortraitItems.length > 0 ? (
                      <DeusPortraitHeaderActions
                        items={deusPortraitItems}
                        linkState={deusLinkFromPowerState}
                        size="sm"
                        justify="start"
                      />
                    ) : null
                  }
                  textFallback={
                    godNomeRef ? <NotionText text={formatGodNameStringForMetaNotion(godNomeRef, godId)} /> : null
                  }
                />
              </InfoRow>
            ) : null}
            {showEraRow ? (
              <InfoRow label="Era">
                <InfoRowPortraitOrText
                  portraits={
                    eraPortraitItems.length > 0 ? (
                      <PortraitHeaderActions
                        items={eraPortraitItems}
                        linkState={deusLinkFromPowerState}
                        size="sm"
                        justify="start"
                      />
                    ) : null
                  }
                  textFallback={eraNomeRef ? <NotionText text={eraNomeRef} /> : null}
                />
              </InfoRow>
            ) : null}
            {showPanteaoRow ? (
              <InfoRow label="Panteão">
                <InfoRowPortraitOrText
                  portraits={
                    panteaoPortraitItems.length > 0 ? (
                      <PortraitHeaderActions
                        items={panteaoPortraitItems}
                        linkState={deusLinkFromPowerState}
                        size="sm"
                        justify="start"
                      />
                    ) : null
                  }
                  textFallback={panteaoNomeRef ? <NotionText text={panteaoNomeRef} /> : null}
                />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Números">
          <div className="space-y-0">
            <InfoRow label="Cooldown (s)">{g.cooldown_seg ?? "—"}</InfoRow>
            <InfoRow label="Duração no mapa (s)">{g.duracao_no_mapa_seg ?? "—"}</InfoRow>
            <InfoRow label="Custo repetir">{g.custo_repetir ?? "—"}</InfoRow>
            <InfoRow label="Incremento por uso">{g.incremento_por_uso ?? "—"}</InfoRow>
          </div>
        </Section>
      </div>

      {g.descricao_resumida ? (
        <Section title="Resumo" className="mt-6">
          <NotionText text={g.descricao_resumida} />
        </Section>
      ) : null}

      {g.descricao_avancada ? (
        <Section title="Descrição avançada" className="mt-6">
          <NotionText text={g.descricao_avancada} />
        </Section>
      ) : null}
    </div>
  );
}
