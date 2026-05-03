import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { eras, eraSlugById } from "@/data/catalog";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";

export function ErasPage() {
  return (
    <div>
      <PageHeader title="Eras" description="No Age of Mythology, a Era é uma evolução importante na jogabilidade! Iniciamos na Era Arcaica, já com poder divíno e determinadas construções básicas. Conforme avançamos no jogo, é necessário ir avançar nas Eras. Saiba mais sobre elas!" />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {eras.map((e) => (
          <li key={e.id}>
            <EntityCard
              to={`/eras/${eraSlugById.get(e.id) ?? e.id}`}
              title={e.nome}
              subtitle={e.ingles ? `Inglês: ${e.ingles}` : undefined}
              meta={
                e.tempo_seg != null && e.tempo_seg > 0 ? `${Math.round(e.tempo_seg / 60)} min` : "Inicial"
              }
              watermarkSrc={getEraAssetUrl(e)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
