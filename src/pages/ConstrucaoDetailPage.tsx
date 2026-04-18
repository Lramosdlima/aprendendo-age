import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { construcaoById, eraById, panteaoById, unidadeById } from "@/data/catalog";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";

export function ConstrucaoDetailPage() {
  const { id } = useParams();
  const c = construcaoById.get(Number(id));

  if (!c) {
    return (
      <div>
        <BackLink to="/construcoes">Construções</BackLink>
        <p className="text-zinc-400">Construção não encontrada.</p>
      </div>
    );
  }

  const era = c.era_id != null ? eraById.get(c.era_id) : undefined;
  const construcaoIcon = getConstrucaoAssetUrl(c.ingles);
  const panteao = c.panteao_id != null ? panteaoById.get(c.panteao_id) : undefined;

  const unidadeLinks = (c.unidades_ids ?? [])
    .map((uid) => {
      const u = unidadeById.get(uid);
      return u ? (
        <Link key={uid} to={`/unidades/${uid}`} className="text-amber-200 underline-offset-2 hover:underline">
          {u.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div>
      <BackLink to="/construcoes">Construções</BackLink>
      <PageHeader
        title={c.nome}
        description={c.ingles ? `EN: ${c.ingles}` : undefined}
        headerIconSrc={construcaoIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Classificação" watermarkSrc={construcaoIcon}>
          <div className="space-y-0">
            {c.tipo ? <InfoRow label="Tipo">{c.tipo}</InfoRow> : null}
            {panteao ? (
              <InfoRow label="Panteão">
                <Link to={`/panteoes/${panteao.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                  {panteao.nome}
                </Link>
              </InfoRow>
            ) : c.panteao ? (
              <InfoRow label="Panteão">
                <NotionText text={c.panteao} />
              </InfoRow>
            ) : null}
            {era ? (
              <InfoRow label="Era">
                <Link to={`/eras/${era.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                  {era.nome}
                </Link>
              </InfoRow>
            ) : c.era ? (
              <InfoRow label="Era">
                <NotionText text={c.era} />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Custo e tempo">
          <div className="space-y-0">
            <InfoRow label="Custo total">{c.custo ?? "—"}</InfoRow>
            <InfoRow label="Madeira">{c.madeira ?? "—"}</InfoRow>
            <InfoRow label="Ouro">{c.ouro ?? "—"}</InfoRow>
            <InfoRow label="Tempo (s)">{c.tempo_construir_segundos ?? "—"}</InfoRow>
            <InfoRow label="Guarnição">{c.guarnicao ?? "—"}</InfoRow>
          </div>
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Combate / defesa">
          <div className="space-y-0">
            <InfoRow label="PV">{c.pontos_de_vida ?? "—"}</InfoRow>
            <InfoRow label="DPS">{c.dps ?? "—"}</InfoRow>
            <InfoRow label="Alcance">{c.alcance ?? "—"}</InfoRow>
            <InfoRow label="Projéteis">{c.no_projeteis ?? "—"}</InfoRow>
            <InfoRow label="Dano perfurante">{c.dano_perfurante ?? "—"}</InfoRow>
            <InfoRow label="Vel. ataque (s)">{c.velocidade_de_ataque_atk_s ?? "—"}</InfoRow>
            <InfoRow label="Arm. corte">{c.armadura_anticorte ?? "—"}</InfoRow>
            <InfoRow label="Arm. perfuração">{c.armadura_antiperfurante ?? "—"}</InfoRow>
            <InfoRow label="Arm. contusão">{c.armadura_anticontucao ?? "—"}</InfoRow>
          </div>
        </Section>

        {c.tecnologias ? (
          <Section title="Tecnologias (texto)">
            <NotionText text={c.tecnologias} />
          </Section>
        ) : (
          <div />
        )}
      </div>

      {unidadeLinks.length > 0 ? (
        <Section title="Unidades relacionadas" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {unidadeLinks.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </Section>
      ) : c.unidades ? (
        <Section title="Unidades (texto)" className="mt-6">
          <NotionText text={c.unidades} />
        </Section>
      ) : null}
    </div>
  );
}
