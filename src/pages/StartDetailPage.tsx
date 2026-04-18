import { useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { startById } from "@/data/catalog";
import { toYouTubeEmbedUrl } from "@/lib/youtubeEmbed";

export function StartDetailPage() {
  const { id } = useParams();
  const s = startById.get(Number(id));

  if (!s) {
    return (
      <div>
        <BackLink to="/starts">Starts</BackLink>
        <p className="text-zinc-400">Página não encontrada.</p>
      </div>
    );
  }

  const fallbackVideoOnly = !s.conteudo_html?.trim();

  return (
    <div>
      <BackLink to="/starts">Starts & build orders</BackLink>
      <PageHeader title={s.titulo} description={s.descricao_curta} />
      <p className="text-xs text-zinc-500">
        Export Notion: <code className="text-zinc-400">{s.notion_file_id}</code>
      </p>

      {s.conteudo_html ? (
        <div
          className="start-notion-content mt-8"
          // HTML gerado localmente a partir do export Notion (paths /assets já resolvidos)
          dangerouslySetInnerHTML={{ __html: s.conteudo_html }}
        />
      ) : null}

      {fallbackVideoOnly && s.youtube.length > 0 ? (
        <div className="mt-8 space-y-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100/95">Vídeos</h2>
          {s.youtube.map((url) => {
            const embed = toYouTubeEmbedUrl(url);
            if (!embed) {
              return (
                <p key={url} className="text-sm text-zinc-400">
                  <a href={url} className="text-amber-200 underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </p>
              );
            }
            return (
              <div key={url} className="overflow-hidden rounded-xl border border-aom-border bg-black/40">
                <div className="aspect-video w-full">
                  <iframe
                    title={s.titulo}
                    src={embed}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {fallbackVideoOnly && s.youtube.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Sem conteúdo HTML nem vídeos nesta exportação.</p>
      ) : null}
    </div>
  );
}
