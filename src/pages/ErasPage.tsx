import { EntityCard } from "@/components/ui/EntityCard";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { getEraAssetUrl } from "@/lib/eraAssetUrl";

export function ErasPage() {
  const { t } = useTranslation();
  const { eras, eraSlugById } = useCatalog();

  return (
    <div>
      <PageHeader title={t("pages.eras.title")} description={t("pages.eras.description")} />
      <ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-1">
        {eras.map((e) => (
          <li key={e.id}>
            <EntityCard
              to={`/eras/${eraSlugById.get(e.id) ?? e.id}`}
              title={e.nome}
              subtitle={e.hint}
              meta={<NotionText text={e.description} />}
              watermarkSrc={getEraAssetUrl(e)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
