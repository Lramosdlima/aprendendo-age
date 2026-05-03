import { Fragment } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { construcaoSlugById, deusSlugById, eraSlugById, panteaoSlugById, tecnologiaBySlug, tecnologias } from "@/data/catalog";
import { listIndexReturnTo } from "@/lib/listIndexReturnState";
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";

export function TecnologiaDetailPage() {
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/tecnologias", navState);
  const { slug } = useParams();
  const t = slug ? tecnologiaBySlug.get(slug) : undefined;

  if (!t) {
    return (
      <div>
        <BackLink to={backToList}>Tecnologias</BackLink>
        <p className="text-zinc-400">Registro não encontrado.</p>
      </div>
    );
  }

  const tecIndex = tecnologias.indexOf(t);

  type NumRef = { id: number; nome: string };
  const eraRefs = t.eras as NumRef[] | undefined;
  const panteoesField = t.panteoes as string | NumRef[] | undefined;
  const construcaoOrigemField = t.construcao_origem as string | NumRef[] | undefined;
  const godEspecificoField = t.god_especifico as string | NumRef[] | undefined;

  const deusesLinks =
    Array.isArray(godEspecificoField) && godEspecificoField.length
      ? godEspecificoField.map((r, j) => (
          <Link
            key={`${r.id}-${j}`}
            to={`/deuses/${deusSlugById.get(r.id) ?? r.id}`}
            className="text-amber-200 underline-offset-2 hover:underline"
          >
            {r.nome}
          </Link>
        ))
      : [];

  return (
    <div>
      <BackLink to={backToList}>Tecnologias</BackLink>
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
            {Array.isArray(panteoesField) && panteoesField.length ? (
              <InfoRow label="Panteão">
                <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
                  {panteoesField.map((r, i) => (
                    <Fragment key={`${r.id}-${i}`}>
                      {i > 0 ? <span className="text-zinc-600">,</span> : null}
                      <Link
                        to={`/panteoes/${panteaoSlugById.get(r.id) ?? r.id}`}
                        className="text-amber-200 underline-offset-2 hover:underline"
                      >
                        <NotionText text={r.nome} />
                      </Link>
                    </Fragment>
                  ))}
                </span>
              </InfoRow>
            ) : typeof t.panteoes === "string" && t.panteoes.trim() ? (
              <InfoRow label="Panteão">
                <NotionText text={t.panteoes} />
              </InfoRow>
            ) : null}
            {Array.isArray(eraRefs) && eraRefs.length ? (
              <InfoRow label="Era">
                <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
                  {eraRefs.map((r, i) => (
                    <Fragment key={`${r.id}-${i}`}>
                      {i > 0 ? <span className="text-zinc-600">,</span> : null}
                      <Link
                        to={`/eras/${eraSlugById.get(r.id) ?? r.id}`}
                        className="text-amber-200 underline-offset-2 hover:underline"
                      >
                        <NotionText text={r.nome} />
                      </Link>
                    </Fragment>
                  ))}
                </span>
              </InfoRow>
            ) : null}
            {Array.isArray(construcaoOrigemField) && construcaoOrigemField.length ? (
              <InfoRow label="Construção de origem">
                <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
                  {construcaoOrigemField.map((r, i) => (
                    <Fragment key={`${r.id}-${i}`}>
                      {i > 0 ? <span className="text-zinc-600">,</span> : null}
                      <Link
                        to={`/construcoes/${construcaoSlugById.get(r.id) ?? r.id}`}
                        className="text-amber-200 underline-offset-2 hover:underline"
                      >
                        <NotionText text={r.nome} />
                      </Link>
                    </Fragment>
                  ))}
                </span>
              </InfoRow>
            ) : typeof construcaoOrigemField === "string" && construcaoOrigemField.trim() ? (
              <InfoRow label="Construção de origem">
                <NotionText text={construcaoOrigemField} />
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
          ) : typeof godEspecificoField === "string" && godEspecificoField.trim() ? (
            <NotionText text={godEspecificoField} />
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
