import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { CompareInfoRow } from "@/components/ui/InfoRow";
import { PageHeaderBlock } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { getGodPowerAssetUrl } from "@/lib/godPowerAssetUrl";
import { parseGameNumber } from "@/lib/numericCompare";
import { godpowerBySlug, godpowers } from "@/data/catalog";

const compareTitleClass =
  "text-xl leading-snug [overflow-wrap:anywhere] sm:text-2xl lg:text-3xl";

type G = (typeof godpowers)[number];

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

function GodpowerNumerosCompare({ g1, g2 }: { g1: G; g2: G }) {
  return (
    <div className="space-y-0">
      <CompareInfoRow
        label="Cooldown (s)"
        left={displayNum(g1.cooldown_seg)}
        right={displayNum(g2.cooldown_seg)}
        numericPair={numericPairFrom(g1.cooldown_seg, g2.cooldown_seg, true)}
      />
      <CompareInfoRow
        label="Duração no mapa (s)"
        left={displayNum(g1.duracao_no_mapa_seg)}
        right={displayNum(g2.duracao_no_mapa_seg)}
        numericPair={numericPairFrom(g1.duracao_no_mapa_seg, g2.duracao_no_mapa_seg)}
      />
      <CompareInfoRow
        label="Custo repetir"
        left={displayNum(g1.custo_repetir)}
        right={displayNum(g2.custo_repetir)}
        numericPair={numericPairFrom(g1.custo_repetir, g2.custo_repetir, true)}
      />
      <CompareInfoRow
        label="Incremento por uso"
        left={displayNum(g1.incremento_por_uso)}
        right={displayNum(g2.incremento_por_uso)}
        numericPair={numericPairFrom(g1.incremento_por_uso, g2.incremento_por_uso, true)}
      />
    </div>
  );
}

export function GodpowerComparePage() {
  const { slugA, slugB } = useParams();
  const g1 = slugA ? godpowerBySlug.get(slugA) : undefined;
  const g2 = slugB ? godpowerBySlug.get(slugB) : undefined;

  if (!g1 || !g2) {
    return (
      <div>
        <BackLink to="/poderes">Poderes divinos</BackLink>
        <p className="text-zinc-400">Um ou ambos os poderes não foram encontrados.</p>
      </div>
    );
  }

  const icon1 = getGodPowerAssetUrl(g1.ingles);
  const icon2 = getGodPowerAssetUrl(g2.ingles);

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
      <BackLink to="/poderes">Poderes divinos</BackLink>

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
            description={g1.ingles ? `Inglês: ${g1.ingles}` : undefined}
            headerIconSrc={icon1}
            descriptionTag
            titleClassName={compareTitleClass}
            className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
          />
          <PageHeaderBlock
            align="end"
            title={g2.nome}
            description={g2.ingles ? `Inglês: ${g2.ingles}` : undefined}
            headerIconSrc={icon2}
            descriptionTag
            titleClassName={compareTitleClass}
            className="w-full max-w-none lg:max-w-[min(100%,28rem)] lg:flex-1"
          />
        </header>
      </div>

      <Section title="Números" className="mt-0">
        <GodpowerNumerosCompare g1={g1} g2={g2} />
      </Section>
    </div>
  );
}
