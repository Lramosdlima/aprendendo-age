import { useParams } from "react-router-dom";

import { StartStructuredContent } from "@/components/starts/StartStructuredContent";
import { StartVideosSection } from "@/components/starts/StartVideosSection";
import { BackLink } from "@/components/ui/BackLink";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { startBySlug } from "@/data/catalog";

export function StartDetailPage() {
  const { slug } = useParams();
  const s = slug ? startBySlug.get(slug) : undefined;

  if (!s) {
    return (
      <div>
        <BackLink to="/starts">Starts</BackLink>
        <p className="text-zinc-400">Página não encontrada.</p>
      </div>
    );
  }

  const hasStructured = s.structured?.segments?.some(
    (seg) => (seg.lead?.length ?? 0) > 0 || (seg.table?.length ?? 0) > 0 || (seg.footer?.length ?? 0) > 0,
  );

  return (
    <div>
      <BackLink to="/starts">Starts & build orders</BackLink>
      <PageHeader title={<NotionText text={s.titulo} />} description={s.descricao_curta} />

      {hasStructured ? <StartStructuredContent segments={s.structured.segments} /> : null}

      <StartVideosSection title={s.titulo} urls={s.youtube} />

      {!hasStructured && s.youtube.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Sem conteúdo nem vídeos nesta entrada.</p>
      ) : null}
    </div>
  );
}
