#!/usr/bin/env python3
"""
Extrai aldeões jogáveis e suas taxas base do proto.xml do AoM Retold.

Exemplos:
  python scripts/extract-aldeoes-aom.py
  python scripts/extract-aldeoes-aom.py --villager VillagerGreek
  python scripts/extract-aldeoes-aom.py --output tools/aom-aldeoes.json --pretty
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR / "lib"))

from aom_game_paths import DEFAULT_CACHE_DIR, DEFAULT_CRYBAR, DEFAULT_GAME_DIR, resolve_game_dir
from aom_unit_extractor import ensure_bar_extracted
from aom_villager_extractor import extract_villagers


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument("--villager", help="ID, proto ou nome inglês")
    parser.add_argument("--output", "-o")
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    args = parser.parse_args()

    game_dir = resolve_game_dir(args.game_dir)
    cache_dir = Path(args.cache_dir).resolve()
    crybar_exe = Path(args.crybar).resolve()
    try:
        ensure_bar_extracted(
            game_dir=game_dir,
            cache_dir=cache_dir,
            crybar_exe=crybar_exe,
            force=args.force_extract,
        )
        rows = extract_villagers(cache_dir)
    except (FileNotFoundError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    if args.villager:
        wanted = args.villager.casefold()
        rows = [
            row
            for row in rows
            if wanted
            in {
                str(row["id"]).casefold(),
                row["proto_name"].casefold(),
                row["nome_en"].casefold(),
                row["nome_pt"].casefold(),
            }
        ]
        if not rows:
            print(f"Aldeão '{args.villager}' não encontrado.", file=sys.stderr)
            return 1

    if args.output:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(
            json.dumps(rows, ensure_ascii=False, indent=2 if args.pretty else None)
            + "\n",
            encoding="utf-8",
        )
        print(f"Exportados {len(rows)} aldeões -> {output}")
        return 0

    preview = rows if args.villager else rows[:3]
    print(json.dumps(preview, ensure_ascii=False, indent=2))
    if not args.villager:
        print(f"\n... total {len(rows)} aldeões (use --output para salvar tudo)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
