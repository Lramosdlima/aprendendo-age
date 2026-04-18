/** Converte URL youtu.be ou youtube.com/watch em URL de embed. */
export function toYouTubeEmbedUrl(url: string): string | null {
  const m =
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!m) return null;
  return `https://www.youtube.com/embed/${m[1]}`;
}
