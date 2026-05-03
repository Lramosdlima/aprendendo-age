import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { construcaoById, construcaoSlugById, eraBySlug } from "@/data/catalog";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";

export function EraDetailPage() {
  const { slug } = useParams();
  const e = slug ? eraBySlug.get(slug) : undefined;

  if (!e) {
    return (
      <div>
        <BackLink to="/eras">Eras</BackLink>
        <p className="text-zinc-400">Era não encontrada.</p>
      </div>
    );
  }

  const reqIds = (e as { requisitos_para_subir_de_era_ids?: number[] }).requisitos_para_subir_de_era_ids;
  const reqSingle = (e as { requisitos_para_subir_de_era_id?: number }).requisitos_para_subir_de_era_id;

  const eraIcon = getEraAssetUrl(e);

  const reqLinks = (reqIds ?? (reqSingle != null ? [reqSingle] : []))
    .map((cid) => {
      const c = construcaoById.get(cid);
      return c ? (
        <Link
          key={cid}
          to={`/construcoes/${construcaoSlugById.get(cid) ?? cid}`}
          className="text-amber-200 underline-offset-2 hover:underline"
        >
          {c.nome}
        </Link>
      ) : (
        <span key={cid}>#{cid}</span>
      );
    })
    .filter(Boolean);

  return (
    <div>
      <BackLink to="/eras">Eras</BackLink>
      <PageHeader title={e.nome} description={e.hint} headerIconSrc={eraIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Descrição">
          <NotionText text={e.description} />
        </Section>

        <Section title="Custos (avanço)">
          <div className="space-y-0">
            <InfoRow label="Comida" icon="foodaom">
              {e.comida === 0 ? "Não tem" : e.comida ?? 0 }
            </InfoRow>
            <InfoRow label="Madeira" icon="woodaom">
              {e.madeira === 0 ? "Não tem" : e.madeira  ?? 0 }
            </InfoRow>
            <InfoRow label="Ouro" icon="goldaom">
              {e.ouro === 0 ? "Não tem" : e.ouro ?? 0 }
            </InfoRow>
            <InfoRow label="Tempo base (s)" icon="aomr_time_icon">
              {e.tempo_seg === 0 ? "Inicial" : e.tempo_seg ?? 0 }
            </InfoRow>
          </div>
        </Section>

        {(e.requisitos_para_subir_de_era || reqLinks.length > 0) && (
          <Section title="Requisitos para subir de era">
            {reqLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {reqLinks.map((el, i) => (
                  <li key={i}>
                    {el}
                    {i < reqLinks.length - 1 ? <span className="text-zinc-600">,</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        )}
      </div>
    </div>
  );
}
