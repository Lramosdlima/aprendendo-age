import { useParams } from "react-router-dom";

import { UnidadeCombateBody, UnidadeCustoBody, UnidadeVisaoGeralBody } from "@/components/unidade/UnidadeSectionBodies";
import {
  UnidadeCombateCompare,
  UnidadeCustoCompare,
  UnidadeVisaoGeralCompare,
} from "@/components/unidade/UnidadeCompareSections";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeaderBlock } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { unidadeBySlug } from "@/data/catalog";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";

const compareTitleClass =
  "text-xl leading-snug [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl";

export function UnidadeComparePage() {
  const { slugA, slugB } = useParams();
  const u1 = slugA ? unidadeBySlug.get(slugA) : undefined;
  const u2 = slugB ? unidadeBySlug.get(slugB) : undefined;

  if (!u1 || !u2) {
    return (
      <div>
        <BackLink to="/unidades">Unidades</BackLink>
        <p className="text-zinc-400">Uma ou ambas as unidades não foram encontradas.</p>
      </div>
    );
  }

  const icon1 = getUnidadeAssetUrl(u1.ingles);
  const icon2 = getUnidadeAssetUrl(u2.ingles);

  return (
    <div>
      <BackLink to="/unidades">Unidades</BackLink>

      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8">
        <PageHeaderBlock
          title={u1.nome}
          description={u1.ingles ? `Inglês: ${u1.ingles}` : undefined}
          headerIconSrc={icon1}
          descriptionTag
          titleClassName={compareTitleClass}
          className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
        />
        <PageHeaderBlock
          align="end"
          title={u2.nome}
          description={u2.ingles ? `Inglês: ${u2.ingles}` : undefined}
          headerIconSrc={icon2}
          descriptionTag
          titleClassName={compareTitleClass}
          className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
        />
      </header>

      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        <Section title="Visão geral">
          <UnidadeVisaoGeralBody u={u1} />
        </Section>
        <Section title="Visão geral">
          <UnidadeVisaoGeralBody u={u2} />
        </Section>
      </div>

      <div className="hidden lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-6">
        <Section title="Combate">
          <UnidadeCombateBody u={u1} />
        </Section>
        <Section title="Combate">
          <UnidadeCombateBody u={u2} />
        </Section>
      </div>

      <div className="hidden lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-6">
        <Section title="Custo e treino">
          <UnidadeCustoBody u={u1} />
        </Section>
        <Section title="Custo e treino">
          <UnidadeCustoBody u={u2} />
        </Section>
      </div>

      <div className="space-y-6 lg:hidden">
        <Section title="Visão geral">
          <UnidadeVisaoGeralCompare u1={u1} u2={u2} />
        </Section>
        <Section title="Combate">
          <UnidadeCombateCompare u1={u1} u2={u2} />
        </Section>
        <Section title="Custo e treino">
          <UnidadeCustoCompare u1={u1} u2={u2} />
        </Section>
      </div>
    </div>
  );
}
