import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { aldeoes } from "@/data/catalog";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";

export function AldeoesPage() {
  return (
    <div>
      <PageHeader title="Aldeões e trabalhadores" description="Coleta base e variações por civilização." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {aldeoes.map((a) => (
          <li key={a.id}>
            <EntityCard
              to={`/aldeoes/${a.id}`}
              title={a.nome}
              subtitle={a.panteao}
              meta={a.ingles ? a.ingles : undefined}
              watermarkSrc={getAldeaoAssetUrl(a.ingles)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
