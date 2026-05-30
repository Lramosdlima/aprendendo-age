import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { CompareInfoRow } from "@/components/ui/InfoRow";
import { PageHeaderBlock } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { entityDisplayDescription } from "@/data/catalogLocale";
import { useCatalog } from "@/hooks/useCatalog";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";
import { parseGameNumber } from "@/lib/numericCompare";
import type { Godpower } from "@/data/catalog";

const compareTitleClass =
  "text-xl leading-snug [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl";

function displayNum(v: unknown): ReactNode {
  if (v == null || v === "") return "—";
  return v as ReactNode;
}

function numericPairFrom(a: unknown, b: unknown, lowerIsBetter?: boolean) {
  return {
    left: parseGameNumber(a),
    right: parseGameNumber(b),
    ...(lowerIsBetter ? { lowerIsBetter: true as const } : {}),
  };
}

function GodpowerNumerosCompare({
  g1,
  g2,
  t,
}: {
  g1: Godpower;
  g2: Godpower;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-0">
      <CompareInfoRow
        label={t("common.cooldownSec")}
        left={displayNum(g1.cooldown_seg)}
        right={displayNum(g2.cooldown_seg)}
        numericPair={numericPairFrom(g1.cooldown_seg, g2.cooldown_seg, true)}
      />
      <CompareInfoRow
        label={t("common.mapDurationSec")}
        left={displayNum(g1.duracao_no_mapa_seg)}
        right={displayNum(g2.duracao_no_mapa_seg)}
        numericPair={numericPairFrom(g1.duracao_no_mapa_seg, g2.duracao_no_mapa_seg)}
      />
      <CompareInfoRow
        label={t("common.repeatCost")}
        left={displayNum(g1.custo_repetir)}
        right={displayNum(g2.custo_repetir)}
        numericPair={{ ...numericPairFrom(g1.custo_repetir, g2.custo_repetir, true), lowerIsBetter: true }}
      />
      <CompareInfoRow
        label={t("common.incrementPerUse")}
        left={displayNum(g1.incremento_por_uso)}
        right={displayNum(g2.incremento_por_uso)}
        numericPair={numericPairFrom(g1.incremento_por_uso, g2.incremento_por_uso, true)}
      />
    </div>
  );
}

export function GodpowerComparePage() {
  const { t, locale } = useTranslation();
  const { godpowerBySlug } = useCatalog();
  const { slugA, slugB } = useParams();
  const g1 = slugA ? godpowerBySlug.get(slugA) : undefined;
  const g2 = slugB ? godpowerBySlug.get(slugB) : undefined;

  if (!g1 || !g2) {
    return (
      <div>
        <BackLink to="/poderes">{t("nav.godpowers")}</BackLink>
        <p className="text-zinc-400">{t("common.entityCompareNotFound.power")}</p>
      </div>
    );
  }

  const icon1 = getGodPowerAssetUrl(g1);
  const icon2 = getGodPowerAssetUrl(g2);

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
      <BackLink to="/poderes">{t("nav.godpowers")}</BackLink>

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
            title={g1.nome}
            description={entityDisplayDescription(g1, locale, t)}
            headerIconSrc={icon1}
            descriptionTag
            titleClassName={compareTitleClass}
            className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
          />
          <PageHeaderBlock
            align="end"
            title={g2.nome}
            description={entityDisplayDescription(g2, locale, t)}
            headerIconSrc={icon2}
            descriptionTag
            titleClassName={compareTitleClass}
            className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
          />
        </header>
      </div>

      <Section title={t("common.numbers")} className="mt-0">
        <GodpowerNumerosCompare g1={g1} g2={g2} t={t} />
      </Section>
    </div>
  );
}
