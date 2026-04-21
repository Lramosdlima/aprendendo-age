import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import {
  deusById,
  deusSlugById,
  eraById,
  eraSlugById,
  godpowerBySlug,
  panteaoById,
  panteaoSlugById,
} from "@/data/catalog";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";

export function GodpowerDetailPage() {
  const { slug } = useParams();
  const g = slug ? godpowerBySlug.get(slug) : undefined;

  if (!g) {
    return (
      <div>
        <BackLink to="/poderes">Poderes divinos</BackLink>
        <p className="text-zinc-400">Poder não encontrado.</p>
      </div>
    );
  }

  const deus = g.god_id != null ? deusById.get(g.god_id) : undefined;
  const era = g.era_id != null ? eraById.get(g.era_id) : undefined;
  const panteao = g.panteao_id != null ? panteaoById.get(g.panteao_id) : undefined;
  const powerIcon = getGodPowerAssetUrl(g.ingles);

  return (
    <div>
      <BackLink to="/poderes">Poderes divinos</BackLink>
      <PageHeader title={g.nome} description={g.ingles ? `Inglês: ${g.ingles}` : undefined} headerIconSrc={powerIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Ligações">
          <div className="space-y-0">
            {deus ? (
              <InfoRow label="Deus">
                <Link
                  to={`/deuses/${deusSlugById.get(deus.id) ?? deus.id}`}
                  className="text-amber-200 underline-offset-2 hover:underline"
                >
                  {deus.nome}
                </Link>
              </InfoRow>
            ) : g.god ? (
              <InfoRow label="Deus">
                <NotionText text={g.god} />
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
            ) : g.era ? (
              <InfoRow label="Era">
                <NotionText text={g.era} />
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
            ) : g.panteao ? (
              <InfoRow label="Panteão">
                <NotionText text={g.panteao} />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Números">
          <div className="space-y-0">
            <InfoRow label="Cooldown (s)">{g.cooldown_seg ?? "—"}</InfoRow>
            <InfoRow label="Duração no mapa (s)">{g.duracao_no_mapa_seg ?? "—"}</InfoRow>
            <InfoRow label="Custo repetir">{g.custo_repetir ?? "—"}</InfoRow>
            <InfoRow label="Incremento por uso">{g.incremento_por_uso ?? "—"}</InfoRow>
          </div>
        </Section>
      </div>

      {g.descricao_resumida ? (
        <Section title="Resumo" className="mt-6">
          <NotionText text={g.descricao_resumida} />
        </Section>
      ) : null}

      {g.descricao_avancada ? (
        <Section title="Descrição avançada" className="mt-6">
          <NotionText text={g.descricao_avancada} />
        </Section>
      ) : null}
    </div>
  );
}
