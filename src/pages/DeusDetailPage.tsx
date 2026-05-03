import { Link, useLocation, useParams } from "react-router-dom";

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

/** Nota 1–5 da avaliação de build (Rush / Turtle / Eco). */
function buildAvaliacaoLabel(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  switch (n) {
    case 5:
      return "Excelente";
    case 4:
      return "Ótimo";
    case 3:
      return "Bom";
    case 2:
      return "Ruim";
    case 1:
      return "Péssimo";
    default:
      return String(n);
  }
}

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

/** Cor do texto conforme a nota (5 verde → 1 vermelho). */
function buildAvaliacaoScoreClassName(n: number | null | undefined): string {
  const base = "text-xs font-semibold leading-tight";
  if (n == null || Number.isNaN(n)) return `${base} text-zinc-500`;
  switch (n) {
    case 5:
      return `${base} text-emerald-400`;
    case 4:
      return `${base} text-lime-300`;
    case 3:
      return `${base} text-yellow-400`;
    case 2:
      return `${base} text-orange-400`;
    case 1:
      return `${base} text-red-400`;
    default:
      return `${base} text-zinc-400`;
  }
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
          <div className="flex flex-wrap items-start justify-start gap-3 sm:gap-4">
            <section className="flex size-24 min-h-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-pink-900/40 bg-pink-950/20 px-1.5 py-2 text-center sm:size-28">
              <h3 className="font-[family-name:var(--font-display)] text-[11px] font-semibold leading-tight text-pink-200 sm:text-xs">
                Rush
              </h3>
              <p className={`${buildAvaliacaoScoreClassName(d.rush)} max-w-full break-words`}>
                {buildAvaliacaoLabel(d.rush)}
              </p>
            </section>
            <section className="flex size-24 min-h-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-teal-900/40 bg-teal-950/20 px-1.5 py-2 text-center sm:size-28">
              <h3 className="font-[family-name:var(--font-display)] text-[11px] font-semibold leading-tight text-teal-200 sm:text-xs">
                Turtle
              </h3>
              <p className={`${buildAvaliacaoScoreClassName(d.turtle)} max-w-full break-words`}>
                {buildAvaliacaoLabel(d.turtle)}
              </p>
            </section>
            <section className="flex size-24 min-h-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-purple-900/40 bg-purple-950/25 px-1.5 py-2 text-center sm:size-28">
              <h3 className="font-[family-name:var(--font-display)] text-[11px] font-semibold leading-tight text-purple-200 sm:text-xs">
                Eco
              </h3>
              <p className={`${buildAvaliacaoScoreClassName(d.eco)} max-w-full break-words`}>
                {buildAvaliacaoLabel(d.eco)}
              </p>
            </section>
          </div>
          {d.foco ? (
            <p className="mt-4 text-sm">
              <span className="text-zinc-500">Foco: </span>
              <NotionText text={d.foco} />
            </p>
          ) : null}
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
