import { BattlePantheonCard } from "@/components/battle/BattlePantheonCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";

export function BattlePantheonPage() {
  const { t } = useTranslation();
  const { panteoes, panteaoSlugById } = useCatalog();

  return (
    <div>
      <PageHeader
        title={t("pages.battle.pantheonTitle")}
        description={t("pages.battle.pantheonDescription")}
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {panteoes.map((p) => {
          const slug = panteaoSlugById.get(p.id) ?? String(p.id);
          return (
            <li key={p.id}>
              <BattlePantheonCard
                to={`/battle/random/${slug}`}
                title={p.nome}
                subtitle={p.description}
                pantheonId={p.id}
                pantheonName={p.nome}
                heroBackground={p.hero_background}
                icon={p.icon}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
