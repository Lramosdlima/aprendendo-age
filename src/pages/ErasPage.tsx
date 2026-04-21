import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { eras } from "@/data/catalog";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";

export function ErasPage() {
  return (
    <div>
      <PageHeader title="Eras" description="Custos cumulativos e requisitos para avançar." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {eras.map((e) => (
          <li key={e.id}>
            <EntityCard
              to={`/eras/${e.id}`}
              title={e.nome}
              subtitle={e.ingles ? `Inglês: ${e.ingles}` : undefined}
              meta={
                e.tempo_seg != null && e.tempo_seg > 0 ? `${Math.round(e.tempo_seg / 60)} min` : "Inicial"
              }
              watermarkSrc={getEraAssetUrl(e.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
