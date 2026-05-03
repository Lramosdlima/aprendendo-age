import { useLocation, useParams } from "react-router-dom";

import { AldeaoBonusBody, AldeaoColetaBody, AldeaoGeralBody } from "@/components/aldeao/AldeaoSectionBodies";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { aldeaoBySlug } from "@/data/catalog";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";
import {
  listIndexLinkStateFromLocation,
  listIndexReturnTo,
  listOrDetailBackLinkLabel,
} from "@/lib/listIndexReturnState";

export function AldeaoDetailPage() {
  const { pathname, search: locSearch, state: navState } = useLocation();
  const linkState = listIndexLinkStateFromLocation(pathname, locSearch);
  const backToList = listIndexReturnTo("/aldeoes", navState);
  const backLabel = listOrDetailBackLinkLabel(backToList, "/aldeoes", "Aldeões");
  const { slug } = useParams();
  const a = slug ? aldeaoBySlug.get(slug) : undefined;

  if (!a) {
    return (
      <div>
        <BackLink to={backToList}>{backLabel}</BackLink>
        <p className="text-zinc-400">Registro não encontrado.</p>
      </div>
    );
  }

  const aldeaoIcon = getAldeaoAssetUrl(a);

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader title={a.nome} description={a.ingles ? `Inglês: ${a.ingles}` : undefined} headerIconSrc={aldeaoIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Geral">
          <AldeaoGeralBody a={a} linkState={linkState} />
        </Section>

        <Section title="Taxas de coleta (base)">
          <AldeaoColetaBody a={a} />
        </Section>
      </div>

      <Section title="Bônus percentuais" className="mt-6">
        <AldeaoBonusBody a={a} />
      </Section>
    </div>
  );
}
