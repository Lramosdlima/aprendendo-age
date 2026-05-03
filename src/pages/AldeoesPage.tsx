import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { aldeoes, aldeaoSlugById, panteaoById } from "@/data/catalog";
import { firstNome, firstNumId } from "@/lib/entityRefs";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { pantheonCardTint } from "@/lib/pantheonCardTint";

export function AldeoesPage() {
  return (
    <div>
      <PageHeader title="Aldeões e trabalhadores" description="Coleta base e variações por civilização." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {aldeoes.map((a) => {
          const panteaoId = firstNumId(a.panteao);
          const tintNome = panteaoId != null ? (panteaoById.get(panteaoId)?.nome ?? "") : "";
          return (
            <li key={a.id}>
              <EntityCard
                to={`/aldeoes/${aldeaoSlugById.get(a.id) ?? a.id}`}
                title={a.nome}
                cardTint={pantheonCardTint(tintNome)}
                subtitle={firstNome(a.panteao) ? <NotionText text={firstNome(a.panteao)!} /> : undefined}
                meta={a.ingles ? a.ingles : undefined}
                watermarkSrc={getAldeaoAssetUrl(a)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
