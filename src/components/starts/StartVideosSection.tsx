import { toYouTubeEmbedUrl } from "@/lib/youtubeEmbed";

type Props = {
  title: string;
  urls: string[];
};

export function StartVideosSection({ title, urls }: Props) {
  if (!urls.length) return null;

  return (
    <div className="mt-10 space-y-6 border-t border-aom-border/60 pt-10">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100/95">Vídeos de referência</h2>
      {urls.map((url) => {
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
                title={title}
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
  );
}
