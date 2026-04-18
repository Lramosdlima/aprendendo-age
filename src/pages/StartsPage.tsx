import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { startsBuildOrder } from "@/data/catalog";

export function StartsPage() {
  return (
    <div>
      <PageHeader
        title="Starts & build orders"
        description="Páginas exportadas da pasta «Starts Build Order» do Notion. Vídeos de referência foram extraídos automaticamente; tabelas completas ficam no HTML original."
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {startsBuildOrder.map((s) => (
          <li key={s.id}>
            <EntityCard
              to={`/starts/${s.id}`}
              title={s.titulo}
              subtitle={s.descricao_curta}
              meta={s.youtube.length ? `${s.youtube.length} vídeo(s)` : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
