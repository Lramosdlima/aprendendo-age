"""
Migra starts_build_order.json de conteudo_html (Notion) para structured (mini-markup).
Requer: pip install beautifulsoup4
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "src" / "data" / "starts_build_order.json"

YOUTUBE_RE = re.compile(
    r"https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/live/)([a-zA-Z0-9_-]{11})",
    re.I,
)

ROW_TYPE_MAP = {
    "block-color-gray_background": "hint",
    "block-color-blue_background": "blue",
    "block-color-pink_background": "pink",
    "block-color-orange_background": "orange",
    "block-color-teal_background": "teal",
    "block-color-red_background": "red",
}


def norm_youtube(href: str) -> str | None:
    m = YOUTUBE_RE.search(href or "")
    if not m:
        return None
    return f"https://youtu.be/{m.group(1)}"


def merge_youtube_urls(soup: BeautifulSoup, existing: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for a in soup.select("a.bookmark, a[href*='youtu'], a[href*='youtube.com']"):
        href = a.get("href") or ""
        u = norm_youtube(href)
        if u and u not in seen:
            seen.add(u)
            out.append(u)
    for u in existing:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def _collapse_ws(s: str) -> str:
    return " ".join(s.split())


def polish_mini(s: str) -> str:
    """Espaço antes de tags inline e depois de fechamento quando falta no HTML."""
    if not s:
        return s
    s = re.sub(r"([a-zà-úA-ZÀ-Ú0-9])(<(?:highlight-|code|strong))", r"\1 \2", s)
    s = re.sub(r"(</(?:highlight-[a-z-]+|code|strong)>)([a-zà-úA-ZÀ-Ú0-9:])", r"\1 \2", s)
    return _collapse_ws(s)


def html_to_mini(node) -> str:
    if isinstance(node, NavigableString):
        t = str(node).replace("\xa0", " ")
        return _collapse_ws(t)
    if not isinstance(node, Tag):
        return ""
    if node.name == "img":
        alt = (node.get("alt") or "").strip().lower()
        return f" :{alt}: " if alt else ""
    if node.name == "mark":
        classes = node.get("class") or []
        for c in classes:
            if c.startswith("highlight-"):
                inner = "".join(html_to_mini(ch) for ch in node.children)
                inner = _collapse_ws(inner)
                return f"<{c}>{inner}</{c}>"
        return _collapse_ws("".join(html_to_mini(ch) for ch in node.children))
    if node.name == "strong":
        inner = _collapse_ws("".join(html_to_mini(ch) for ch in node.children))
        return f"<strong>{inner}</strong>"
    if node.name == "code":
        inner = _collapse_ws("".join(html_to_mini(ch) for ch in node.children))
        return f"<code>{inner}</code>"
    if node.name == "br":
        return " "
    if node.name in ("em", "span", "a"):
        return _collapse_ws("".join(html_to_mini(ch) for ch in node.children))
    if node.name == "p":
        return _collapse_ws("".join(html_to_mini(ch) for ch in node.children))
    return _collapse_ws("".join(html_to_mini(ch) for ch in node.children))


def row_type_from_td(td: Tag) -> str | None:
    classes = td.get("class") or []
    for c in classes:
        if c in ROW_TYPE_MAP:
            return ROW_TYPE_MAP[c]
    return None


def parse_table(table: Tag) -> list[dict]:
    header = table.select_one("thead tr")
    ncols = len(header.select("th")) if header else 0
    has_favor = ncols >= 6
    rows_out: list[dict] = []
    for tr in table.select("tbody tr"):
        tds = tr.select("td")
        if not tds:
            continue
        first = tds[0]
        rtype = row_type_from_td(first)

        def cell(i: int) -> str | None:
            if i >= len(tds):
                return None
            raw = polish_mini(_collapse_ws(html_to_mini(tds[i])).strip())
            return raw if raw else None

        desc = polish_mini(_collapse_ws(html_to_mini(first)).strip())
        if has_favor:
            food, wood, gold, favor, pop = cell(1), cell(2), cell(3), cell(4), cell(5)
        else:
            food, wood, gold, favor, pop = cell(1), cell(2), cell(3), None, cell(4)

        rows_out.append(
            {
                "description": desc,
                "food": food,
                "wood": wood,
                "gold": gold,
                "favor": favor,
                "pop": pop,
                "type": rtype,
            }
        )
    return rows_out


def is_bookmark_figure(fig: Tag) -> bool:
    return fig.name == "figure" and bool(fig.select_one("a.bookmark"))


def build_lead(chunk: list[Tag]) -> list[dict]:
    out: list[dict] = []
    for el in chunk:
        if is_bookmark_figure(el):
            continue
        if el.name == "figure" and "callout" in (el.get("class") or []):
            ps = el.select("p")
            if ps:
                for p in ps:
                    text = polish_mini(_collapse_ws(html_to_mini(p)).strip())
                    if text:
                        out.append({"kind": "callout", "text": text})
            else:
                text = polish_mini(_collapse_ws(html_to_mini(el)).strip())
                if text:
                    out.append({"kind": "callout", "text": text})
        elif el.name in ("h1", "h2", "h3"):
            out.append(
                {"kind": "heading", "level": int(el.name[1]), "text": polish_mini(_collapse_ws(html_to_mini(el)).strip())}
            )
        elif el.name == "p":
            t = polish_mini(_collapse_ws(html_to_mini(el)).strip())
            if t:
                out.append({"kind": "callout", "text": t})
        elif el.name in ("script", "link", "style", "pre"):
            continue
        else:
            t = polish_mini(_collapse_ws(html_to_mini(el)).strip())
            if t:
                out.append({"kind": "callout", "text": t})
    return out


def build_footer(chunk: list[Tag]) -> list[dict]:
    out: list[dict] = []
    for el in chunk:
        if is_bookmark_figure(el):
            continue
        if el.name == "figure" and "callout" in (el.get("class") or []):
            ps = el.select("p")
            if ps:
                for p in ps:
                    text = polish_mini(_collapse_ws(html_to_mini(p)).strip())
                    if text:
                        out.append({"kind": "callout", "text": text})
            else:
                text = polish_mini(_collapse_ws(html_to_mini(el)).strip())
                if text:
                    out.append({"kind": "callout", "text": text})
        elif el.name in ("h1", "h2", "h3"):
            out.append(
                {"kind": "heading", "level": int(el.name[1]), "text": polish_mini(_collapse_ws(html_to_mini(el)).strip())}
            )
        elif el.name == "p":
            t = polish_mini(_collapse_ws(html_to_mini(el)).strip())
            if t:
                out.append({"kind": "paragraph", "text": t})
        elif el.name == "ol":
            lines = []
            for li in el.find_all("li", recursive=False):
                lines.append(polish_mini(_collapse_ws(html_to_mini(li)).strip()))
            lines = [x for x in lines if x]
            if lines:
                txt = "\n".join(f"{i + 1}. {x}" for i, x in enumerate(lines))
                out.append({"kind": "paragraph", "text": txt})
        elif el.name == "ul":
            lines = [polish_mini(_collapse_ws(html_to_mini(li)).strip()) for li in el.find_all("li", recursive=False)]
            lines = [x for x in lines if x]
            if lines:
                txt = "\n".join(f"• {x}" for x in lines)
                out.append({"kind": "paragraph", "text": txt})
        elif el.name in ("script", "link", "style", "pre"):
            continue
        else:
            t = polish_mini(_collapse_ws(html_to_mini(el)).strip())
            if t:
                out.append({"kind": "paragraph", "text": t})
    return out


def extract_structured(conteudo_html: str, existing_youtube: list[str]) -> tuple[dict, list[str]]:
    soup = BeautifulSoup(conteudo_html, "html.parser")
    body = soup.select_one(".page-body") or soup
    children = [c for c in body.children if getattr(c, "name", None)]

    tables_idx = [
        i
        for i, c in enumerate(children)
        if c.name == "table" and c.get("class") and "simple-table" in c.get("class", [])
    ]

    if not tables_idx:
        return {"segments": [{"lead": [], "table": [], "footer": []}]}, merge_youtube_urls(
            soup, existing_youtube
        )

    segments: list[dict] = []
    for ti, tidx in enumerate(tables_idx):
        prev_end = tables_idx[ti - 1] if ti > 0 else -1
        chunk = children[prev_end + 1 : tidx]
        lead = build_lead(chunk)
        table = parse_table(children[tidx])
        segments.append({"lead": lead, "table": table})

    footer_chunk = children[tables_idx[-1] + 1 :]
    if footer_chunk:
        segments[-1]["footer"] = build_footer(footer_chunk)

    yt = merge_youtube_urls(soup, existing_youtube)
    return {"segments": segments}, yt


def main() -> None:
    raw = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    out: list[dict] = []
    for entry in raw:
        html = entry.get("conteudo_html") or ""
        existing_yt = entry.get("youtube") or []
        structured, youtube = extract_structured(html, existing_yt)
        new_entry = {k: v for k, v in entry.items() if k != "conteudo_html"}
        new_entry["structured"] = structured
        new_entry["youtube"] = youtube
        out.append(new_entry)

    JSON_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", JSON_PATH, "entries:", len(out))


if __name__ == "__main__":
    main()
