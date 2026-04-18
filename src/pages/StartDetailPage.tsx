import { useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
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

  return (
    <div>
      <BackLink to="/starts">Starts & build orders</BackLink>
      <PageHeader title={s.titulo} description={s.descricao_curta} />

      <Section title="Metadados">
        <p className="text-sm text-zinc-400">
          ID Notion (arquivo): <code className="text-zinc-300">{s.notion_file_id}</code>
        </p>
      </Section>

      {s.youtube.length > 0 ? (
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
      ) : (
        <p className="mt-6 text-sm text-zinc-500">Nenhum link de YouTube detectado nesta exportação.</p>
      )}
    </div>
  );
}
