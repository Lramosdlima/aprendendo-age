import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AldeaoBonusCompare, AldeaoColetaCompare, AldeaoGeralCompare } from "@/components/aldeao/AldeaoCompareSections";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeaderBlock } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { entityDisplayDescription } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { getAldeaoAssetUrl } from "@/lib/entityWatermarkUrls";
import { cn } from "@/lib/cn";

const compareTitleClass =
  "text-xl leading-snug [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl";

export function AldeaoComparePage() {
  const { t, locale } = useTranslation();
  const { aldeaoBySlug } = useCatalog();
  const { slugA, slugB } = useParams();
  const a1 = slugA ? aldeaoBySlug.get(slugA) : undefined;
  const a2 = slugB ? aldeaoBySlug.get(slugB) : undefined;

  if (!a1 || !a2) {
    return (
      <div>
        <BackLink to="/aldeoes">{t("nav.villagers")}</BackLink>
        <p className="text-zinc-400">{t("common.entityCompareNotFound.villager")}</p>
      </div>
    );
  }

  const icon1 = getAldeaoAssetUrl(a1);
  const icon2 = getAldeaoAssetUrl(a2);

  const [compareHeaderScrolled, setCompareHeaderScrolled] = useState(false);

  useEffect(() => {
    const threshold = 10;
    const onScroll = () => setCompareHeaderScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <BackLink to="/aldeoes">{t("nav.villagers")}</BackLink>

      <div
        className={cn(
          "sticky top-16 z-20 mb-8 -mx-4 px-4 py-2.5 md:top-0 md:-mx-10 md:px-10",
          "border-b border-transparent transition-[background-color,box-shadow,backdrop-filter,border-color] duration-200 ease-out",
          compareHeaderScrolled
            ? "border-zinc-800/90 bg-zinc-950/93 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.82)] backdrop-blur-md ring-1 ring-black/45"
            : "bg-transparent shadow-none ring-0",
        )}
      >
        <header className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8">
          <PageHeaderBlock
            title={a1.nome}
            description={entityDisplayDescription(a1, locale, t)}
            headerIconSrc={icon1}
            descriptionTag
            titleClassName={compareTitleClass}
            className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
          />
          <PageHeaderBlock
            align="end"
            title={a2.nome}
            description={entityDisplayDescription(a2, locale, t)}
            headerIconSrc={icon2}
            descriptionTag
            titleClassName={compareTitleClass}
            className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
          />
        </header>
      </div>

      <div className="space-y-6">
        <Section title={t("common.general")}>
          <AldeaoGeralCompare a1={a1} a2={a2} />
        </Section>

        <Section title={t("common.baseGatherRates")}>
          <AldeaoColetaCompare a1={a1} a2={a2} />
        </Section>

        <Section title={t("common.percentBonus")}>
          <AldeaoBonusCompare a1={a1} a2={a2} />
        </Section>
      </div>
    </div>
  );
}
