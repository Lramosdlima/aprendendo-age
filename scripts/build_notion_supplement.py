"""
Gera starts_build_order.json a partir da exportação HTML do Notion (pasta Starts Build Order).
Execute a partir da raiz do projeto: python scripts/build_notion_supplement.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
NOTION = WORKSPACE / "Notion Aprendendo Age" / "Aprendendo Age"
DATA = ROOT / "src" / "data"

YOUTUBE_RE = re.compile(
    r"https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})",
    re.I,
)


def strip_html_title(html: str) -> str:
    m = re.search(r"<title>([^<]+)</title>", html, re.I)
    return (m.group(1).strip() if m else "").replace("  ", " ")


def extract_youtube(html: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for m in YOUTUBE_RE.finditer(html):
        vid = m.group(1)
        url = f"https://youtu.be/{vid}"
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def build_starts() -> list[dict]:
    starts_dir = NOTION / "Starts Build Order" / "Starts"
    if not starts_dir.is_dir():
        return []
    rows: list[dict] = []
    files = sorted(starts_dir.glob("*.html"), key=lambda p: p.name)
    for i, fp in enumerate(files, start=1):
        text = fp.read_text(encoding="utf-8", errors="replace")
        title = strip_html_title(text)
        notion_id = fp.stem.split()[-1] if " " in fp.stem else fp.stem
        rows.append(
            {
                "id": i,
                "titulo": title,
                "notion_file_id": notion_id,
                "youtube": extract_youtube(text),
                "descricao_curta": "Conteúdo exportado do Notion (tabelas de comida/madeira/ouro/pop e vídeos embutidos). Use o HTML original para referência completa.",
            }
        )
    return rows


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)

    starts = build_starts()
    (DATA / "starts_build_order.json").write_text(
        json.dumps(starts, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("Wrote starts_build_order.json:", len(starts), "entries")


if __name__ == "__main__":
    main()
