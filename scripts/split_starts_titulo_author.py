"""
Separa titulo em titulo + author[] usando ' - por ' (e variantes).
Uso: python scripts/split_starts_titulo_author.py

Chaves na ordem: id, titulo, author, god, notion_file_id, youtube, descricao_curta, structured
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "src" / "data" / "starts_build_order.json"

KEY_ORDER = [
    "id",
    "titulo",
    "author",
    "god",
    "notion_file_id",
    "youtube",
    "descricao_curta",
    "structured",
]


def split_titulo_author(raw: str) -> tuple[str, list[str]]:
    s = raw.strip()
    parts = re.split(r"\s*-\s*por\s+", s, maxsplit=1)
    if len(parts) == 2:
        authors = [p.strip() for p in parts[1].split("|") if p.strip()]
        return parts[0].strip(), authors
    if " por " in s:
        left, right = s.rsplit(" por ", 1)
        authors = [p.strip() for p in right.split("|") if p.strip()]
        return left.strip(), authors
    if " - " in s:
        left, right = s.rsplit(" - ", 1)
        right = right.strip()
        if right and len(right) < 200:
            return left.strip(), [right]
    return s, []


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    out: list[dict] = []
    for entry in data:
        titulo, author = split_titulo_author(entry["titulo"])
        merged = {**entry, "titulo": titulo, "author": author}
        out.append({k: merged[k] for k in KEY_ORDER if k in merged})
    JSON_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", JSON_PATH, "entries:", len(out))


if __name__ == "__main__":
    main()
