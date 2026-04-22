import { Link, useLocation, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import {
  construcaoBySlug,
  eraById,
  eraSlugById,
  panteaoById,
  panteaoSlugById,
  unidadeById,
  unidadeSlugById,
} from "@/data/catalog";
import { formatArmorPercent } from "@/lib/armorDisplay";
import { getConstrucaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { listIndexReturnTo } from "@/lib/listIndexReturnState";
import { hasTipoContent } from "@/lib/unidadeTipo";

export function ConstrucaoDetailPage() {
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/construcoes", navState);
  const { slug } = useParams();
  const c = slug ? construcaoBySlug.get(slug) : undefined;

  if (!c) {
    return (
      <div>
        <BackLink to={backToList}>Construções</BackLink>
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
        <Link
          key={uid}
          to={`/unidades/${unidadeSlugById.get(uid) ?? uid}`}
          className="text-amber-200 underline-offset-2 hover:underline"
        >
          {u.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div>
      <BackLink to={backToList}>Construções</BackLink>
      <PageHeader
        title={c.nome}
        description={c.ingles ? `Inglês: ${c.ingles}` : undefined}
        headerIconSrc={construcaoIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Classificação">
          <div className="space-y-0">
            {hasTipoContent(c.tipo) ? (
              <InfoRow label="Tipo">
                <UnidadeTipoLine tipo={c.tipo} colored />
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
            ) : c.panteao ? (
              <InfoRow label="Panteão">
                <NotionText text={c.panteao} />
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
            <InfoRow label="Madeira" icon="woodaom">
              {c.madeira ?? "—"}
            </InfoRow>
            <InfoRow label="Ouro" icon="goldaom">
              {c.ouro ?? "—"}
            </InfoRow>
            <InfoRow label="Tempo (s)" icon="aomr_time_icon">
              {c.tempo_construir_segundos ?? "—"}
            </InfoRow>
            <InfoRow label="Guarnição" icon="aom_garrison_icon">
              {c.guarnicao ?? "—"}
            </InfoRow>
          </div>
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Combate / defesa">
          <div className="space-y-0">
            <InfoRow label="Pontos de Vida" icon="aomr_hit_points_icon">
              {c.pontos_de_vida ?? "—"}
            </InfoRow>
            <InfoRow label="Dano perfurante" icon="piercedamage">
              {c.dano_perfurante ?? "—"}
            </InfoRow>
            <InfoRow label="Velocidade de ataque (seg)" icon="aomr_rate_of_fire_icon">
              {c.velocidade_de_ataque_atk_s ?? "—"}
            </InfoRow>
            <InfoRow label="DPS" icon="attack_cur">
              {c.dps ?? "—"}
            </InfoRow>
            <InfoRow label="Alcance" icon="rangeicon">
              {c.alcance ?? "—"}
            </InfoRow>
            <InfoRow label="Projéteis" icon="piercedamage">
              {c.no_projeteis ?? "—"}
            </InfoRow>
            <InfoRow label="Armadura de corte" icon="hackarmor">
              {formatArmorPercent(c.armadura_anticorte)}
            </InfoRow>
            <InfoRow label="Armadura de perfuração" icon="piercearmor">
              {formatArmorPercent(c.armadura_antiperfurante)}
            </InfoRow>
            <InfoRow label="Armadura de contusão" icon="crusharmor">
              {formatArmorPercent(c.armadura_anticontucao)}
            </InfoRow>
          </div>
        </Section>

        {c.tecnologias ? (
          <Section title="Tecnologias">
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
        <Section title="Unidades" className="mt-6">
          <NotionText text={c.unidades} />
        </Section>
      ) : null}
    </div>
  );
}
