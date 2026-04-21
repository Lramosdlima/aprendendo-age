import { StartMiniMarkup } from "@/lib/startMiniMarkup";
import type { StartBuildSegment, StartFooterBlock, StartLeadBlock, StartTableRow } from "@/data/catalog";

function rowTypeClass(type: string | null): string | undefined {
  if (!type) return undefined;
  const map: Record<string, string> = {
    hint: "start-row-hint",
    blue: "start-row-blue",
    pink: "start-row-pink",
    teal: "start-row-teal",
    orange: "start-row-orange",
    red: "start-row-red",
    gray: "start-row-hint",
  };
  return map[type];
}

function StartTable({ rows }: { rows: StartTableRow[] }) {
  const showFavor = rows.some((r) => r.favor != null && r.favor !== "");

  return (
    <div className="start-table-wrap mt-4 overflow-x-auto">
      <table className="start-structured-table simple-table w-full table-fixed border-collapse text-[0.8125rem]">
        <thead>
          <tr>
            <th className="start-col-desc">Descrição</th>
            <th className="start-col-res">Comida</th>
            <th className="start-col-res">Madeira</th>
            <th className="start-col-res">Ouro</th>
            {showFavor ? <th className="start-col-res">Favor</th> : null}
            <th className="start-col-pop">População</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={rowTypeClass(r.type ?? null)}>
              <td className="start-col-desc">
                <StartMiniMarkup text={r.description} />
              </td>
              <td className="start-col-res">
                {r.food != null && r.food !== "" ? <StartMiniMarkup text={r.food} /> : null}
              </td>
              <td className="start-col-res">
                {r.wood != null && r.wood !== "" ? <StartMiniMarkup text={r.wood} /> : null}
              </td>
              <td className="start-col-res">
                {r.gold != null && r.gold !== "" ? <StartMiniMarkup text={r.gold} /> : null}
              </td>
              {showFavor ? (
                <td className="start-col-res">
                  {r.favor != null && r.favor !== "" ? <StartMiniMarkup text={r.favor} /> : null}
                </td>
              ) : null}
              <td className="start-col-pop">
                {r.pop != null && r.pop !== "" ? <StartMiniMarkup text={r.pop} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutBlock({ children }: { children: React.ReactNode }) {
  return (
    <figure className="callout block-color-gray_background mt-4 flex gap-3 rounded-xl border border-aom-border p-4 first:mt-0">
      <div className="text-xl leading-none text-zinc-500" aria-hidden>
        ●
      </div>
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-200">{children}</div>
    </figure>
  );
}

function LeadBlocks({ blocks }: { blocks: StartLeadBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "callout") {
          return (
            <CalloutBlock key={i}>
              <StartMiniMarkup text={b.text} />
            </CalloutBlock>
          );
        }
        const Tag = b.level <= 2 ? "h2" : "h3";
        return (
          <Tag
            key={i}
            className="mt-6 font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100/95 first:mt-0"
          >
            <StartMiniMarkup text={b.text} />
          </Tag>
        );
      })}
    </>
  );
}

function FooterBlocks({ blocks }: { blocks: StartFooterBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "paragraph") {
          return (
            <p key={i} className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              <StartMiniMarkup text={b.text} />
            </p>
          );
        }
        if (b.kind === "callout") {
          return (
            <CalloutBlock key={i}>
              <StartMiniMarkup text={b.text} />
            </CalloutBlock>
          );
        }
        const Tag = b.level <= 2 ? "h2" : "h3";
        return (
          <Tag
            key={i}
            className="mt-6 font-[family-name:var(--font-display)] text-lg font-semibold text-amber-100/95"
          >
            <StartMiniMarkup text={b.text} />
          </Tag>
        );
      })}
    </>
  );
}

export function StartStructuredContent({ segments }: { segments: StartBuildSegment[] }) {
  return (
    <div className="start-notion-content start-structured mt-8">
      {segments.map((seg, si) => (
        <section key={si} className={si > 0 ? "mt-10 border-t border-aom-border/60 pt-10" : undefined}>
          {seg.lead?.length ? <LeadBlocks blocks={seg.lead} /> : null}
          {seg.table?.length ? <StartTable rows={seg.table} /> : null}
          {seg.footer?.length ? <FooterBlocks blocks={seg.footer} /> : null}
        </section>
      ))}
    </div>
  );
}
