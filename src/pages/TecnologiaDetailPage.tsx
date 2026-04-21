import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
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
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";

export function TecnologiaDetailPage() {
  const { slug } = useParams();
  const t = slug ? tecnologiaBySlug.get(slug) : undefined;

  if (!t) {
    return (
      <div>
        <BackLink to="/tecnologias">Tecnologias</BackLink>
        <p className="text-zinc-400">Registro não encontrado.</p>
      </div>
    );
  }

  const tecIndex = tecnologias.indexOf(t);
  const era = t.eras_id != null ? eraById.get(t.eras_id) : undefined;
  const panteao = t.panteoes_id != null ? panteaoById.get(t.panteoes_id) : undefined;
  const constr = t.construcao_origem_id != null ? construcaoById.get(t.construcao_origem_id) : undefined;

  const deusesLinks = (t.god_especifico_ids ?? [])
    .map((did) => {
      const d = deusById.get(did);
      return d ? (
        <Link
          key={did}
          to={`/deuses/${deusSlugById.get(did) ?? did}`}
          className="text-amber-200 underline-offset-2 hover:underline"
        >
          {d.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div>
      <BackLink to="/tecnologias">Tecnologias</BackLink>
      <PageHeader
        title={t.nome || `Sem título (#${tecIndex >= 0 ? tecIndex : "?"})`}
        description={tecIndex >= 0 ? `Lista JSON: #${tecIndex}` : undefined}
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
            {panteao ? (
              <InfoRow label="Panteão">
                <Link
                  to={`/panteoes/${panteaoSlugById.get(panteao.id) ?? panteao.id}`}
                  className="text-amber-200 underline-offset-2 hover:underline"
                >
                  {panteao.nome}
                </Link>
              </InfoRow>
            ) : t.panteoes ? (
              <InfoRow label="Panteão">
                <NotionText text={t.panteoes} />
              </InfoRow>
            ) : null}
            {era ? (
              <InfoRow label="Era">
                <Link
                  to={`/eras/${eraSlugById.get(era.id) ?? era.id}`}
                  className="text-amber-200 underline-offset-2 hover:underline"
                >
                  {era.nome}
                </Link>
              </InfoRow>
            ) : t.eras ? (
              <InfoRow label="Era">
                <NotionText text={t.eras} />
              </InfoRow>
            ) : null}
            {constr ? (
              <InfoRow label="Construção de origem">
                <Link
                  to={`/construcoes/${construcaoSlugById.get(constr.id) ?? constr.id}`}
                  className="text-amber-200 underline-offset-2 hover:underline"
                >
                  {constr.nome}
                </Link>
              </InfoRow>
            ) : t.construcao_origem ? (
              <InfoRow label="Construção de origem">
                <NotionText text={t.construcao_origem} />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Deuses">
          {deusesLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {deusesLinks.map((el, j) => (
                <li key={j}>{el}</li>
              ))}
            </ul>
          ) : t.god_especifico ? (
            <NotionText text={t.god_especifico} />
          ) : (
            <p className="text-zinc-500">—</p>
          )}
        </Section>
      </div>

      {t.campo ? (
        <Section title="Campo / efeito" className="mt-6">
          <NotionText text={t.campo} />
        </Section>
      ) : null}
    </div>
  );
}
