import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";

import { DeusPortraitHeaderActions } from "@/components/deus/DeusPortraitHeaderActions";
import { StartAuthorsMeta } from "@/components/start/StartAuthorsMeta";
import { StartStructuredContent } from "@/components/starts/StartStructuredContent";
import { StartVideosSection } from "@/components/starts/StartVideosSection";
import { BackLink } from "@/components/ui/BackLink";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { deuses, deusSlugById, startBySlug } from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { listIndexBackLinkLabel, listIndexLinkStateFromLocation, listIndexReturnTo } from "@/lib/listIndexReturnState";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";

/** Nomes em `starts_build_order.json` que não coincidem com `deuses_aom.json`. */
const START_GOD_NAME_ALIASES: Record<string, string> = {
  Isis: "Ísis",
  Ra: "Rá",
  Freyr: "Frey",
};

const deusByNome = new Map(deuses.map((d) => [d.nome, d] as const));

function startGodHeaderPortraits(labels: string[], deusLinkState: ListIndexLinkState): ReactNode {
  const resolved = labels
    .map((label, index) => {
      const nome = START_GOD_NAME_ALIASES[label] ?? label;
      const d = deusByNome.get(nome);
      const slug = d ? deusSlugById.get(d.id) : undefined;
      if (!d || !slug) return null;
      const src = getDeusAssetUrl(d);
      return { key: `${d.id}-${index}`, slug, nome: d.nome, src };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (resolved.length === 0) return null;

  return <DeusPortraitHeaderActions items={resolved} linkState={deusLinkState} />;
}

export function StartDetailPage() {
  const { pathname, search: locSearch, state: navState } = useLocation();
  const backToList = listIndexReturnTo("/starts", navState);
  const backLabel = listIndexBackLinkLabel(backToList, "Starts & build orders");
  const backLabelNotFound = listIndexBackLinkLabel(backToList, "Starts");
  const deusLinkFromStartState = listIndexLinkStateFromLocation(pathname, locSearch);
  const { slug } = useParams();
  const s = slug ? startBySlug.get(slug) : undefined;

  if (!s) {
    return (
      <div>
        <BackLink to={backToList}>{backLabelNotFound}</BackLink>
        <p className="text-zinc-400">Página não encontrada.</p>
      </div>
    );
  }

  const hasStructured = s.structured?.segments?.some(
    (seg) => (seg.lead?.length ?? 0) > 0 || (seg.table?.length ?? 0) > 0 || (seg.footer?.length ?? 0) > 0,
  );

  return (
    <div>
      <BackLink to={backToList}>{backLabel}</BackLink>
      <PageHeader
        title={<NotionText text={s.titulo} />}
        description={
          s.author.length ? (
            <StartAuthorsMeta authors={s.author} className="text-sm text-zinc-300" />
          ) : undefined
        }
        actions={startGodHeaderPortraits(s.god, deusLinkFromStartState)}
      />

      {hasStructured ? <StartStructuredContent segments={s.structured.segments} /> : null}

      <StartVideosSection title={s.titulo} urls={s.youtube} />

      {!hasStructured && s.youtube.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Sem conteúdo nem vídeos nesta entrada.</p>
      ) : null}
    </div>
  );
}
