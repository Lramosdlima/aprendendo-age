import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { expandStartInlineKeywords } from "@/lib/startResourceKeywords";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";
import { getTokenLabel } from "@/lib/notionTokenLabels";

const KNOWN_TAGS = new Set([
  "food",
  "wood",
  "gold",
  "strong",
  "code",
  "highlight-red",
  "highlight-yellow",
  "highlight-brown",
  "highlight-blue",
  "highlight-teal",
  "highlight-orange",
  "highlight-pink",
  "highlight-purple",
]);

function highlightClass(tag: string): string {
  if (tag === "food") return "highlight-red";
  if (tag === "wood") return "highlight-brown";
  if (tag === "gold") return "highlight-yellow";
  return tag;
}

function wrapTag(tag: string, inner: ReactNode, key: string): ReactNode {
  if (!KNOWN_TAGS.has(tag)) {
    return (
      <span key={key}>
        {"<"}
        {tag}
        {">"}
        {inner}
        {"</"}
        {tag}
        {">"}
      </span>
    );
  }
  if (tag === "strong") {
    return (
      <strong key={key} className="font-semibold text-zinc-100">
        {inner}
      </strong>
    );
  }
  if (tag === "code") {
    return (
      <code key={key} className="rounded bg-black/35 px-1 py-0.5 text-[0.85em]">
        {inner}
      </code>
    );
  }
  const hc = highlightClass(tag);
  return (
    <span key={key} className={hc}>
      {inner}
    </span>
  );
}

function renderToken(name: string, key: string): ReactNode {
  const src = getTokenAssetUrl(name);
  if (src) {
    return (
      <img
        key={key}
        src={src}
        alt=""
        title={getTokenLabel(name)}
        className="notion-token-inline mx-0.5 inline-block h-[1em] max-h-[1.1em] w-auto align-[-0.12em] object-contain"
      />
    );
  }
  return (
    <span
      key={key}
      className="mx-0.5 inline rounded bg-zinc-800/90 px-1 py-0.5 align-baseline font-mono text-[0.65rem] text-amber-200/95"
      title={getTokenLabel(name)}
    >
      {`:${name}:`}
    </span>
  );
}

/**
 * Mini-markup dos starts: `:token:`, `<food>`, `<highlight-teal>`, `<strong>`, `<code>`, etc.
 */
export function parseStartMiniMarkup(text: string, baseKey = "m"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let pos = 0;
  let uid = 0;

  while (pos < text.length) {
    const nextColon = text.indexOf(":", pos);
    const nextLt = text.indexOf("<", pos);
    const nextSpecial =
      nextColon >= 0 && nextLt >= 0
        ? Math.min(nextColon, nextLt)
        : nextColon >= 0
          ? nextColon
          : nextLt >= 0
            ? nextLt
            : -1;

    if (nextSpecial < 0) {
      nodes.push(<span key={`${baseKey}-rest-${uid++}`}>{text.slice(pos)}</span>);
      break;
    }

    if (nextSpecial > pos) {
      nodes.push(<span key={`${baseKey}-txt-${uid++}`}>{text.slice(pos, nextSpecial)}</span>);
      pos = nextSpecial;
    }

    if (text[pos] === ":") {
      const m = /^:([a-z0-9_-]+):/.exec(text.slice(pos));
      if (m) {
        nodes.push(renderToken(m[1]!.toLowerCase(), `${baseKey}-tok-${uid++}`));
        pos += m[0].length;
        continue;
      }
      nodes.push(<span key={`${baseKey}-c-${uid++}`}>:</span>);
      pos++;
      continue;
    }

    const tagM = /^<([a-z0-9_-]+)>/.exec(text.slice(pos));
    if (!tagM) {
      nodes.push(<span key={`${baseKey}-lt-${uid++}`}>&lt;</span>);
      pos++;
      continue;
    }
    const tagName = tagM[1]!;
    const close = `</${tagName}>`;
    const startContent = pos + tagM[0].length;
    const closeIdx = text.indexOf(close, startContent);
    if (closeIdx < 0) {
      nodes.push(<span key={`${baseKey}-bad-${uid++}`}>{text.slice(pos, pos + tagM[0].length)}</span>);
      pos += tagM[0].length;
      continue;
    }
    const inner = text.slice(startContent, closeIdx);
    pos = closeIdx + close.length;
    const innerNodes = parseStartMiniMarkup(inner, `${baseKey}-${tagName}-${uid}`);
    nodes.push(wrapTag(tagName, <>{innerNodes}</>, `${baseKey}-wrap-${uid++}`));
  }

  return nodes;
}

export function StartMiniMarkup({
  text,
  className,
  expandResources,
}: {
  text: string;
  className?: string;
  /** Quando true (starts estruturados), recursos e trabalhadores viram texto formatado + :token:. */
  expandResources?: boolean;
}) {
  if (!text) return null;
  const processed = expandResources ? expandStartInlineKeywords(text) : text;
  return (
    <span className={cn(expandResources && "min-w-0 whitespace-pre-line", className)}>
      {parseStartMiniMarkup(processed)}
    </span>
  );
}
