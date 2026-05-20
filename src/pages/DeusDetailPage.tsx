import { Link, useLocation, useParams } from "react-router-dom";

import { DeusBuildAvaliacaoCards } from "@/components/deus/DeusBuildAvaliacaoCards";
import { DeusExplicacaoMaiorSection } from "@/components/deus/DeusExplicacaoMaiorSection";
import { GodMajorDecisionTree } from "@/components/deus/GodMajorDecisionTree";
import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { Section } from "@/components/ui/Section";
import {
  deusById,
  deusBySlug,
  deusSlugById,
  eraById,
  eraSlugById,
  godpowerById,
  godpowerSlugById,
  panteaoById,
  panteaoSlugById,
  startById,
  tecnologias,
  tecnologiaSlugByIndex,
  type DeusExplicacaoBloco,
  unidadeById,
  unidadeSlugById,
} from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { firstNome, firstNumId, joinRefNomes } from "@/lib/entityRefs";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";
import { bucketMinorsByEra } from "@/lib/godMajorTree";
import { listIndexLinkStateFromLocation, listIndexReturnTo } from "@/lib/listIndexReturnState";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

/** Texto do link "← …" conforme a origem (lista de deuses, start ou poder divino). */
function deusBackLinkLabel(backTo: string): string {
  const pathOnly = backTo.split("?")[0];
  if (pathOnly === "/deuses" || backTo.startsWith("/deuses?")) return "Deuses";
  if (backTo === "/astecas" || backTo.startsWith("/astecas?")) return "Astecas";
  if (backTo === "/starts" || backTo.startsWith("/starts?")) return "Starts & build orders";
  if (backTo.startsWith("/starts/")) return "Voltar ao start";
  if (backTo.startsWith("/poderes/compare")) return "Comparar poderes";
  if (backTo.startsWith("/poderes/")) return "Voltar ao poder divino";
  if (backTo === "/poderes" || backTo.startsWith("/poderes?")) return "Poderes divinos";
  return "Voltar";
}

export function DeusDetailPage() {
  const { pathname, search: locSearch, state: navState } = useLocation();
  const linkState = listIndexLinkStateFromLocation(pathname, locSearch);
  const backToList = listIndexReturnTo("/deuses", navState);
  const backLinkLabel = deusBackLinkLabel(backToList);
  const { slug } = useParams();
  const d = slug ? deusBySlug.get(slug) : undefined;

  if (!d) {
    return (
      <div>
        <BackLink to={backToList}>{backLinkLabel}</BackLink>
        <p className="text-zinc-400">Deus não encontrado.</p>
      </div>
    );
  }

  const deusIcon = getDeusAssetUrl(d);

  const panteaoId = firstNumId(d.panteao);
  const panteao = panteaoId != null ? panteaoById.get(panteaoId) : undefined;
  const eraId = firstNumId(d.era);
  const era = eraId != null ? eraById.get(eraId) : undefined;
  const gpId = firstNumId(d.godpower);
  const gp = gpId != null ? godpowerById.get(gpId) : undefined;

  const treeTiers = d.hierarquia === "Maior" ? bucketMinorsByEra(d, deusById) : null;

  const relacoes = (d.god_maior_relacao ?? [])
    .map((rel) => {
      const rid = rel.id;
      const x = deusById.get(rid);
      return x ? (
        <Link
          key={rid}
          to={`/deuses/${deusSlugById.get(rid) ?? rid}`}
          className="text-amber-200 underline-offset-2 hover:underline"
        >
          {rel.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  const unidadesEx = (d.unidades_exclusivas ?? [])
    .map((ref) => {
      const uid = ref.id;
      const u = unidadeById.get(uid);
      return u ? (
        <Link
          key={uid}
          to={`/unidades/${unidadeSlugById.get(uid) ?? uid}`}
          className="text-amber-200 underline-offset-2 hover:underline"
        >
          {ref.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div>
      <BackLink to={backToList}>{backLinkLabel}</BackLink>
      <PageHeader
        title={d.nome}
        description={
          [d.hierarquia, firstNome(d.panteao)].some(Boolean) ? (
            <MetaNotionLine parts={[d.hierarquia, firstNome(d.panteao)]} />
          ) : undefined
        }
        headerIconSrc={deusIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Visão geral">
          <div className="space-y-0">
          {d.hierarquia ? <InfoRow label="Hierarquia">{d.hierarquia}</InfoRow> : null}
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
            ) : firstNome(d.panteao) ? (
              <InfoRow label="Panteão">
                <InfoRowPortraitOrText portraits={null} textFallback={<NotionText text={firstNome(d.panteao)!} />} />
              </InfoRow>
            ) : null}
            {era ? (
              <InfoRow label="Era">
                <InfoRowPortraitOrText
                  portraits={
                    <PortraitHeaderActions
                      items={[
                        {
                          key: String(era.id),
                          to: `/eras/${eraSlugById.get(era.id) ?? era.id}`,
                          nome: era.nome,
                          src: getEraAssetUrl(era),
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
            ) : firstNome(d.era) ? (
              <InfoRow label="Era">
                <InfoRowPortraitOrText portraits={null} textFallback={<NotionText text={firstNome(d.era)!} />} />
              </InfoRow>
            ) : null}
            {gp ? (
              <InfoRow label="Poder divino">
                <InfoRowPortraitOrText
                  portraits={
                    <PortraitHeaderActions
                      items={[
                        {
                          key: String(gp.id),
                          to: `/poderes/${godpowerSlugById.get(gp.id) ?? gp.id}`,
                          nome: gp.nome,
                          src: getGodPowerAssetUrl(gp),
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
            ) : firstNome(d.godpower) ? (
              <InfoRow label="Poder divino">
                <InfoRowPortraitOrText portraits={null} textFallback={<NotionText text={firstNome(d.godpower)!} />} />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Avaliação (builds)">
          <DeusBuildAvaliacaoCards rush={d.rush} turtle={d.turtle} eco={d.eco} foco={d.foco} />
        </Section>
      </div>

      {d.hierarquia === "Maior" && d.explicacao_maior?.blocos?.length ? (
        <DeusExplicacaoMaiorSection blocos={d.explicacao_maior.blocos as DeusExplicacaoBloco[]} />
      ) : null}

      {treeTiers ? (
        <Section title="Árvore de deuses menores (por era)" className="mt-6">
          <GodMajorDecisionTree major={d} tiers={treeTiers} />
        </Section>
      ) : null}

      {d.starts?.length ? (
        <Section title="Starts (referências)" className="mt-6">
          <ul className="list-inside list-disc space-y-2 text-sm">
            {d.starts.map(({ id: sid, nome }) => {
              const s = startById.get(sid);
              return (
                <li key={sid}>
                  {s ? (
                    <Link to={`/starts/${s.slug}`} className="text-amber-200 underline-offset-2 hover:underline">
                      <NotionText text={nome} />
                    </Link>
                  ) : (
                    <NotionText text={nome} />
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {relacoes.length > 0 && !treeTiers ? (
        <Section title="Deuses Maiores" className="mt-6">
          <ul className="list-inside list-disc space-y-1">
            {relacoes.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </Section>
      ) : d.god_maior_relacao?.length && !treeTiers ? (
        <Section title="Deuses Menores" className="mt-6">
          <NotionText text={joinRefNomes(d.god_maior_relacao)} />
        </Section>
      ) : null}

      {d.tecnologias?.length ? (
        <Section title="Tecnologias" className="mt-6">
          <ul className="list-inside list-disc space-y-1.5 text-sm">
            {d.tecnologias.map((t, i) => {
              const ti = tecnologias.findIndex((x) => x.nome === t.nome);
              const slug = ti >= 0 ? tecnologiaSlugByIndex.get(ti) : undefined;
              return (
                <li key={`${t.id}-${i}`}>
                  {slug ? (
                    <Link to={`/tecnologias/${slug}`} className="text-amber-200 underline-offset-2 hover:underline">
                      <NotionText text={t.nome} />
                    </Link>
                  ) : (
                    <NotionText text={t.nome} />
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {unidadesEx.length > 0 ? (
        <Section title="Unidades exclusivas" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {unidadesEx.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </Section>
      ) : d.unidades_exclusivas?.length ? (
        <Section title="Unidades exclusivas" className="mt-6">
          <NotionText text={joinRefNomes(d.unidades_exclusivas)} />
        </Section>
      ) : null}
    </div>
  );
}
