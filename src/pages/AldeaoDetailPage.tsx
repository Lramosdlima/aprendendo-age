import { useLocation, useParams } from "react-router-dom";

import { AldeaoBonusBody, AldeaoColetaBody, AldeaoGeralBody } from "@/components/aldeao/AldeaoSectionBodies";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { entityDisplayDescription } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";
import {
  listIndexLinkStateFromLocation,
  listIndexReturnTo,
  listOrDetailBackLinkLabel,
} from "@/lib/listIndexReturnState";

export function AldeaoDetailPage() {
  const { t, locale } = useTranslation();
  const { aldeaoBySlug } = useCatalog();
  const { pathname, search: locSearch, state: navState } = useLocation();
  const linkState = listIndexLinkStateFromLocation(pathname, locSearch);
  const backToList = listIndexReturnTo("/aldeoes", navState);
  const backLabel = listOrDetailBackLinkLabel(backToList, "/aldeoes", t("nav.villagers"));
  const { slug } = useParams();
  const a = slug ? aldeaoBySlug.get(slug) : undefined;

  if (!a) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">{t("common.entityNotFound.villager")}</p>
      </div>
    );
  }

  const aldeaoIcon = getAldeaoAssetUrl(a);

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader
        title={a.nome}
        description={entityDisplayDescription(a, locale, t)}
        headerIconSrc={aldeaoIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t("common.general")}>
          <AldeaoGeralBody a={a} linkState={linkState} />
        </Section>

        <Section title={t("common.baseGatherRates")}>
          <AldeaoColetaBody a={a} />
        </Section>
      </div>

      <Section title={t("common.percentBonus")} className="mt-6">
        <AldeaoBonusBody a={a} />
      </Section>
    </div>
  );
}
