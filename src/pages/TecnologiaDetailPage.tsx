import { useLocation, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitCluster } from "@/components/ui/InfoRowPortraitCluster";
import { TecnologiaTipoBadges } from "@/components/tecnologia/TecnologiaTipoBadges";
import { NotionText } from "@/components/ui/NotionText";
import { hasTecnologiaTipo } from "@/lib/tecnologiaTipo";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortraitHeaderActions, type PortraitHeaderItem } from "@/components/ui/PortraitHeaderActions";
import { Section } from "@/components/ui/Section";
import {
  construcaoById,
  construcaoSlugById,
  deusById,
  deusSlugById,
  eraById,
  eraSlugById,
  panteaoById,
  panteaoSlugById,
  tecnologiaBySlug,
  tecnologias,
} from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";
import {
  listIndexLinkStateFromLocation,
  listIndexReturnTo,
  listOrDetailBackLinkLabel,
} from "@/lib/listIndexReturnState";
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";

export function TecnologiaDetailPage() {
  const { pathname, search: locSearch, state: navState } = useLocation();
  const tecLinkState = listIndexLinkStateFromLocation(pathname, locSearch);
  const backToList = listIndexReturnTo("/tecnologias", navState);
  const backLabel = listOrDetailBackLinkLabel(backToList, "/tecnologias", "Tecnologias");
  const { slug } = useParams();
  const t = slug ? tecnologiaBySlug.get(slug) : undefined;

  if (!t) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">Registro não encontrado.</p>
      </div>
    );
  }

  const tecIndex = tecnologias.indexOf(t);

  const eraRefs = t.eras;
  const panteoesField = t.panteoes;
  const construcaoOrigemField = t.construcao_origem;
  const godEspecificoField = t.god_especifico;

  const deusPortraitItems: PortraitHeaderItem[] =
    Array.isArray(godEspecificoField) && godEspecificoField.length
      ? godEspecificoField.map((r, i) => {
          const d = deusById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/deuses/${deusSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: d ? getDeusAssetUrl(d) : undefined,
          };
        })
      : [];

  const panteoesPortraitItems =
    Array.isArray(panteoesField) && panteoesField.length
      ? panteoesField.map((r, i) => {
          const p = panteaoById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/panteoes/${panteaoSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: p ? getPantheonWatermarkUrl(p) : undefined,
          };
        })
      : [];

  const eraPortraitItems =
    Array.isArray(eraRefs) && eraRefs.length
      ? eraRefs.map((r, i) => {
          const e = eraById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/eras/${eraSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: e ? getEraAssetUrl(e) : undefined,
          };
        })
      : [];

  const construcaoPortraitItems =
    Array.isArray(construcaoOrigemField) && construcaoOrigemField.length
      ? construcaoOrigemField.map((r, i) => {
          const c = construcaoById.get(r.id);
          return {
            key: `${r.id}-${i}`,
            to: `/construcoes/${construcaoSlugById.get(r.id) ?? r.id}`,
            nome: r.nome,
            src: c ? getConstrucaoAssetUrl(c) : undefined,
          };
        })
      : [];

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader
        title={t.nome || `Sem título (#${tecIndex >= 0 ? tecIndex : "?"})`}
        headerIconSrc={getTecnologiaAssetUrl(t)}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Resumo">
          <div className="space-y-0">
            {t.beneficia ? (
              <InfoRow label="Beneficia">
                <NotionText text={t.beneficia} />
              </InfoRow>
            ) : null}
            {hasTecnologiaTipo(t.tipo) || t.tipo?.trim() ? (
              <InfoRow label="Tipo">
                <TecnologiaTipoBadges tipo={t.tipo} />
              </InfoRow>
            ) : null}
            {panteoesPortraitItems.length > 0 ? (
              <InfoRow label="Panteão">
                <InfoRowPortraitCluster>
                  <PortraitHeaderActions
                    items={panteoesPortraitItems}
                    linkState={tecLinkState}
                    size="sm"
                    justify="start"
                  />
                </InfoRowPortraitCluster>
              </InfoRow>
            ) : typeof t.panteoes === "string" && t.panteoes.trim() ? (
              <InfoRow label="Panteão">
                <NotionText text={t.panteoes} />
              </InfoRow>
            ) : null}
            {eraPortraitItems.length > 0 ? (
              <InfoRow label="Era">
                <InfoRowPortraitCluster>
                  <PortraitHeaderActions
                    items={eraPortraitItems}
                    linkState={tecLinkState}
                    size="sm"
                    justify="start"
                  />
                </InfoRowPortraitCluster>
              </InfoRow>
            ) : null}
            {construcaoPortraitItems.length > 0 ? (
              <InfoRow label="Construção de origem">
                <InfoRowPortraitCluster>
                  <PortraitHeaderActions
                    items={construcaoPortraitItems}
                    linkState={tecLinkState}
                    size="sm"
                    justify="start"
                  />
                </InfoRowPortraitCluster>
              </InfoRow>
            ) : typeof construcaoOrigemField === "string" && construcaoOrigemField.trim() ? (
              <InfoRow label="Construção de origem">
                <NotionText text={construcaoOrigemField} />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Deuses">
          {deusPortraitItems.length > 0 ? (
            <InfoRowPortraitCluster>
              <PortraitHeaderActions
                items={deusPortraitItems}
                linkState={tecLinkState}
                size="sm"
                justify="start"
              />
            </InfoRowPortraitCluster>
          ) : typeof godEspecificoField === "string" && godEspecificoField.trim() ? (
            <NotionText text={godEspecificoField} />
          ) : (
            <p className="text-zinc-500">—</p>
          )}
        </Section>
      </div>

      {t.campo && t.campo.length > 0 ? (
        <Section title="Campo / efeito" className="mt-6">
          <ul className="space-y-3">
            {t.campo.map((line, i) => (
              <li key={i} className="text-sm text-zinc-300">
                <NotionText text={line} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
