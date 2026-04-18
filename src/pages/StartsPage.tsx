import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { startsBuildOrder } from "@/data/catalog";

export function StartsPage() {
  return (
    <div>
      <PageHeader
        title="Starts & build orders"
        description="Sequências em tabela (comida, madeira, ouro, pop), callouts e links de vídeo — extraídos do export HTML do Notion. Ícones em /assets."
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {startsBuildOrder.map((s) => (
          <li key={s.id}>
            <EntityCard
              to={`/starts/${s.id}`}
              title={<NotionText text={s.titulo} />}
              subtitle={s.god}
              meta={s.youtube.length ? `${s.youtube.length} vídeo(s)` : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
