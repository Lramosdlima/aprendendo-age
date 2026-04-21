import { useParams } from "react-router-dom";

import { UnidadeCombateBody, UnidadeCustoBody, UnidadeVisaoGeralBody } from "@/components/unidade/UnidadeSectionBodies";
import { BackLink } from "@/components/ui/BackLink";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { hasTipoContent } from "@/lib/unidadeTipo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { unidadeBySlug } from "@/data/catalog";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";

export function UnidadeDetailPage() {
  const { slug } = useParams();
  const u = slug ? unidadeBySlug.get(slug) : undefined;

  if (!u) {
    return (
      <div>
        <BackLink to="/unidades">Unidades</BackLink>
        <p className="text-zinc-400">Unidade não encontrada.</p>
      </div>
    );
  }

  const unidadeIcon = getUnidadeAssetUrl(u.ingles);

  return (
    <div>
      <BackLink to="/unidades">Unidades</BackLink>
      <PageHeader
        title={u.nome}
        description={
          hasTipoContent(u.tipo) ? <UnidadeTipoLine tipo={u.tipo} colored /> : undefined
        }
        descriptionTag
        headerIconSrc={unidadeIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Visão geral">
          <UnidadeVisaoGeralBody u={u} />
        </Section>

        <Section title="Combate">
          <UnidadeCombateBody u={u} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Custo e treino">
          <UnidadeCustoBody u={u} />
        </Section>
      </div>
    </div>
  );
}
