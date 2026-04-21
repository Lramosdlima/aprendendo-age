import { Link } from "react-router-dom";

import { deusSlugById } from "@/data/catalog";
import tokenAssetMap from "@/data/token_asset_map.json";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { cn } from "@/lib/cn";
import type { Deus, GodMajorTreeTiers } from "@/lib/godMajorTree";
import { isBinaryMajorTree } from "@/lib/godMajorTree";

function PortraitLink({
  deus,
  size = "md",
  className,
}: {
  deus: Deus;
  size?: "md" | "lg";
  className?: string;
}) {
  const src = getDeusAssetUrl(deus.nome);
  const slug = deusSlugById.get(deus.id) ?? String(deus.id);
  const box =
    size === "lg"
      ? "size-[4.5rem] sm:size-20 border-amber-400/35"
      : "size-14 sm:size-16 border-zinc-600/50";

  return (
    <Link
      to={`/deuses/${slug}`}
      className={cn(
        "group flex max-w-[110px] flex-col items-center gap-1.5 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-900/80 shadow-inner shadow-black/40 transition-[border-color,box-shadow] group-hover:border-amber-300/60 group-hover:shadow-amber-900/20",
          box,
        )}
      >
        {src ? (
          <img src={src} alt="" className="size-full object-cover object-top" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center px-1 text-[10px] leading-tight text-zinc-500">
            {deus.nome}
          </div>
        )}
      </div>
      <span className="line-clamp-2 text-xs font-medium leading-snug text-zinc-200 group-hover:text-amber-100 group-hover:underline group-hover:underline-offset-2">
        {deus.nome}
      </span>
    </Link>
  );
}

const TIER_ERA_ICON_KEY: Record<string, keyof typeof tokenAssetMap> = {
  Clássica: "aomr_classical_age_icon",
  Heróica: "aomr_heroic_age_icon",
  Mítica: "aomr_mythic_age_icon",
};

function TierHeading({ label }: { label: string }) {
  const iconPath = TIER_ERA_ICON_KEY[label];
  const iconSrc = iconPath ? tokenAssetMap[iconPath] : undefined;

  return (
    <div className="mb-2 flex flex-col items-center gap-1.5">
      <p className="text-center font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      {typeof iconSrc === "string" ? (
        <img
          src={iconSrc}
          alt=""
          className="size-9 object-contain opacity-95 drop-shadow-sm sm:size-10"
          loading="lazy"
        />
      ) : null}
    </div>
  );
}

function VBar({ className }: { className?: string }) {
  return <div className={cn("h-5 w-px shrink-0 bg-zinc-600/75", className)} />;
}

/** Duas escolhas lado a lado + tronco vertical centrado abaixo (entre este nível e o próximo). */
function TwoChoiceRow({ left, right }: { left: Deus; right: Deus }) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center sm:max-w-sm">
      <div className="flex w-full items-start justify-between gap-3 sm:gap-8">
        <PortraitLink deus={left} className="min-w-0 flex-1" />
        <PortraitLink deus={right} className="min-w-0 flex-1" />
      </div>
      <VBar className="mt-3" />
    </div>
  );
}

/** Árvore 2+2+2: deus maior → clássica → heróica → mítica. */
function BinaryTreeLayout({ major, tiers }: { major: Deus; tiers: GodMajorTreeTiers }) {
  const [c1, c2] = tiers.classical;
  const [h1, h2] = tiers.heroic;
  const [m1, m2] = tiers.mythic;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <PortraitLink deus={major} size="lg" />
      <VBar className="mt-2" />

      <TierHeading label="Clássica" />
      <TwoChoiceRow left={c1} right={c2} />

      <TierHeading label="Heróica" />
      <TwoChoiceRow left={h1} right={h2} />

      <TierHeading label="Mítica" />
      <div className="flex w-full max-w-xs justify-between gap-3 sm:max-w-sm sm:gap-8">
        <PortraitLink deus={m1} className="min-w-0 flex-1" />
        <PortraitLink deus={m2} className="min-w-0 flex-1" />
      </div>
    </div>
  );
}

/** Linhas por era quando não é 2+2+2 (ex.: 3 clássicos nórdicos ou Frey com 2 míticos). */
function FlexibleTierLayout({ major, tiers }: { major: Deus; tiers: GodMajorTreeTiers }) {
  const rows: { label: string; items: Deus[] }[] = [
    { label: "Clássica", items: tiers.classical },
    { label: "Heróica", items: tiers.heroic },
    { label: "Mítica", items: tiers.mythic },
  ].filter((r) => r.items.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <PortraitLink deus={major} size="lg" />
      <VBar className="mt-2" />
      {rows.map((row, index) => (
        <div key={row.label} className="w-full">
          <TierHeading label={row.label} />
          <div
            className={cn(
              "flex flex-wrap items-start justify-center gap-x-4 gap-y-3",
              row.items.length <= 3 ? "sm:gap-x-8" : "gap-x-3",
            )}
          >
            {row.items.map((d) => (
              <PortraitLink key={d.id} deus={d} />
            ))}
          </div>
          {index < rows.length - 1 ? (
            <div className="mt-3 flex justify-center">
              <VBar />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function GodMajorDecisionTree({ major, tiers }: { major: Deus; tiers: GodMajorTreeTiers }) {
  if (isBinaryMajorTree(tiers)) {
    return <BinaryTreeLayout major={major} tiers={tiers} />;
  }
  return <FlexibleTierLayout major={major} tiers={tiers} />;
}
