import type { ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { StartStructuredContent } from "@/components/starts/StartStructuredContent";
import { StartVideosSection } from "@/components/starts/StartVideosSection";
import { BackLink } from "@/components/ui/BackLink";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { deuses, deusSlugById, startBySlug } from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { listIndexReturnTo } from "@/lib/listIndexReturnState";

/** Nomes em `starts_build_order.json` que não coincidem com `deuses_aom.json`. */
const START_GOD_NAME_ALIASES: Record<string, string> = {
  Isis: "Ísis",
  Ra: "Rá",
  Freyr: "Frey",
};

const deusByNome = new Map(deuses.map((d) => [d.nome, d] as const));

function startGodHeaderPortraits(labels: string[]): ReactNode {
  const resolved = labels
    .map((label, index) => {
      const nome = START_GOD_NAME_ALIASES[label] ?? label;
      const d = deusByNome.get(nome);
      const slug = d ? deusSlugById.get(d.id) : undefined;
      if (!d || !slug) return null;
      const src = getDeusAssetUrl(d.nome);
      return { key: `${d.id}-${index}`, slug, nome: d.nome, src };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  if (resolved.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap items-center justify-end gap-2">
      {resolved.map((item) => (
        <Link
          key={item.key}
          to={`/deuses/${item.slug}`}
          title={item.nome}
          aria-label={`Ver página de ${item.nome}`}
          className="group shrink-0 rounded-xl border border-aom-border bg-zinc-900/60 shadow-sm shadow-black/30 transition hover:border-amber-400/50 hover:ring-1 hover:ring-amber-400/30"
        >
          {item.src ? (
            <img
              src={item.src}
              alt=""
              className="h-16 w-16 rounded-xl object-contain p-1.5 sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl p-1.5 text-center text-xs font-semibold leading-tight text-zinc-400 sm:h-20 sm:w-20">
              {item.nome.slice(0, 3)}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

export function StartDetailPage() {
  const { state: navState } = useLocation();
  const backToList = listIndexReturnTo("/starts", navState);
  const { slug } = useParams();
  const s = slug ? startBySlug.get(slug) : undefined;

  if (!s) {
    return (
      <div>
        <BackLink to={backToList}>Starts</BackLink>
        <p className="text-zinc-400">Página não encontrada.</p>
      </div>
    );
  }

  const hasStructured = s.structured?.segments?.some(
    (seg) => (seg.lead?.length ?? 0) > 0 || (seg.table?.length ?? 0) > 0 || (seg.footer?.length ?? 0) > 0,
  );

  return (
    <div>
      <BackLink to={backToList}>Starts & build orders</BackLink>
      <PageHeader
        title={<NotionText text={s.titulo} />}
        description={s.descricao_curta}
        actions={startGodHeaderPortraits(s.god)}
      />

      {hasStructured ? <StartStructuredContent segments={s.structured.segments} /> : null}

      <StartVideosSection title={s.titulo} urls={s.youtube} />

      {!hasStructured && s.youtube.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Sem conteúdo nem vídeos nesta entrada.</p>
      ) : null}
    </div>
  );
}
