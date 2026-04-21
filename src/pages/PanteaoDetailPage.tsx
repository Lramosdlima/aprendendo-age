import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { deusById, deusSlugById, panteaoBySlug } from "@/data/catalog";

export function PanteaoDetailPage() {
  const { slug } = useParams();
  const p = slug ? panteaoBySlug.get(slug) : undefined;

  if (!p) {
    return (
      <div>
        <BackLink to="/panteoes">Panteões</BackLink>
        <p className="text-zinc-400">Panteão não encontrado.</p>
      </div>
    );
  }

  const deusLinks = (p.deuses_ids ?? [])
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
      <BackLink to="/panteoes">Panteões</BackLink>
      <PageHeader title={p.nome} />
      {p.description ? (
        <Section title="Descrição">
          <NotionText text={p.description} />
        </Section>
      ) : null}
      {"dois_tipos_de_trabalhadores_alimentam_esse_crescimento" in p && p.dois_tipos_de_trabalhadores_alimentam_esse_crescimento ? (
        <Section title="Trabalhadores" className="mt-6">
          <NotionText text={p.dois_tipos_de_trabalhadores_alimentam_esse_crescimento} />
        </Section>
      ) : null}

      <div className="mt-6 space-y-0 rounded-2xl border border-aom-border bg-aom-card/60 p-5">
        {"vill" in p && p.vill ? (
          <InfoRow label="Trabalhadores">
            <NotionText text={String(p.vill)} />
          </InfoRow>
        ) : null}
        {p.starts ? (
          <InfoRow label="Starts (referências)">
            <NotionText text={p.starts} />
          </InfoRow>
        ) : null}
        {p.deuses ? (
          <InfoRow label="Deuses (texto)">
            <NotionText text={p.deuses} />
          </InfoRow>
        ) : null}
        {deusLinks.length > 0 ? (
          <InfoRow label="Deuses (links)">
            <span className="flex flex-wrap gap-x-2 gap-y-1">
              {deusLinks.map((el, i) => (
                <span key={i}>
                  {el}
                  {i < deusLinks.length - 1 ? "," : ""}
                </span>
              ))}
            </span>
          </InfoRow>
        ) : null}
      </div>
    </div>
  );
}
