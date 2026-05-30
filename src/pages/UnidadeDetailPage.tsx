import { useLocation, useParams } from "react-router-dom";

import { UnidadeCombateBody, UnidadeCustoBody, UnidadeVisaoGeralBody } from "@/components/unidade/UnidadeSectionBodies";
import { BackLink } from "@/components/ui/BackLink";
import { UnidadeTipoLine } from "@/components/unidade/UnidadeTipoLine";
import { hasTipoContent } from "@/lib/unidadeTipo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { getUnidadeAssetUrl } from "@/lib/entityWatermarkUrls";
import { listIndexReturnTo, listOrDetailBackLinkLabel } from "@/lib/listIndexReturnState";

export function UnidadeDetailPage() {
  const { t } = useTranslation();
  const { unidadeBySlug } = useCatalog();
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/unidades", navState);
  const backLabel = listOrDetailBackLinkLabel(backToList, "/unidades", t("nav.units"));
  const { slug } = useParams();
  const u = slug ? unidadeBySlug.get(slug) : undefined;

  if (!u) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">{t("common.entityNotFound.unit")}</p>
      </div>
    );
  }

  const unidadeIcon = getUnidadeAssetUrl(u);

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader
        title={u.nome}
        description={
          hasTipoContent(u.tipo) ? <UnidadeTipoLine tipo={u.tipo} colored /> : undefined
        }
        descriptionTag={false}
        headerIconSrc={unidadeIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t("common.overview")}>
          <UnidadeVisaoGeralBody u={u} />
        </Section>

        <Section title={t("common.combat")}>
          <UnidadeCombateBody u={u} />
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title={t("common.costAndTraining")}>
          <UnidadeCustoBody u={u} />
        </Section>
      </div>
    </div>
  );
}
