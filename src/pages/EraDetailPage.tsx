import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { construcaoById, eraById } from "@/data/catalog";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";

export function EraDetailPage() {
  const { id } = useParams();
  const e = eraById.get(Number(id));

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

  const eraIcon = getEraAssetUrl(e.id);

  const reqLinks = (reqIds ?? (reqSingle != null ? [reqSingle] : []))
    .map((cid) => {
      const c = construcaoById.get(cid);
      return c ? (
        <Link key={cid} to={`/construcoes/${cid}`} className="text-amber-200 underline-offset-2 hover:underline">
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
      <PageHeader title={e.nome} description={e.ingles ? `Inglês: ${e.ingles}` : undefined} headerIconSrc={eraIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Custos (avanço)" watermarkSrc={eraIcon}>
          <div className="space-y-0">
            <InfoRow label="Comida">{e.comida ?? 0}</InfoRow>
            <InfoRow label="Madeira">{e.madeira ?? 0}</InfoRow>
            <InfoRow label="Ouro">{e.ouro ?? 0}</InfoRow>
            <InfoRow label="Tempo base (s)">{e.tempo_seg ?? 0}</InfoRow>
          </div>
        </Section>

        {(e.requisitos_para_subir_de_era || reqLinks.length > 0) && (
          <Section title="Requisitos para subir de era" watermarkSrc={eraIcon}>
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
            {e.requisitos_para_subir_de_era ? (
              <p className={reqLinks.length > 0 ? "mt-4 text-sm" : "text-sm"}>
                <NotionText text={e.requisitos_para_subir_de_era} />
              </p>
            ) : null}
          </Section>
        )}
      </div>
    </div>
  );
}
