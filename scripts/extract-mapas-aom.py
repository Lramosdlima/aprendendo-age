#!/usr/bin/env python3
"""
Extrai metadados dos mapas aleatórios do Age of Mythology: Retold.

Exemplos:
  python scripts/extract-mapas-aom.py
  python scripts/extract-mapas-aom.py --map tenochtitlans_heart
  python scripts/extract-mapas-aom.py --output tools/aom-mapas.json --pretty
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
from aom_map_extractor import extract_maps
from aom_unit_extractor import ensure_bar_extracted


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument("--map", dest="map_id", help="ID do arquivo do mapa")
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
        rows = extract_maps(
            game_dir=game_dir,
            cache_dir=cache_dir,
            crybar_exe=crybar_exe,
        )
    except (FileNotFoundError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    if args.map_id:
        rows = [row for row in rows if row["map_id"].casefold() == args.map_id.casefold()]
        if not rows:
            print(f"Mapa '{args.map_id}' não encontrado.", file=sys.stderr)
            return 1

    if args.output:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(
            json.dumps(rows, ensure_ascii=False, indent=2 if args.pretty else None) + "\n",
            encoding="utf-8",
        )
        print(f"Exportados {len(rows)} mapas -> {output}")
        return 0

    preview = rows if args.map_id else rows[:3]
    print(json.dumps(preview, ensure_ascii=False, indent=2))
    if not args.map_id:
        print(f"\n... total {len(rows)} mapas (use --output para salvar tudo)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
