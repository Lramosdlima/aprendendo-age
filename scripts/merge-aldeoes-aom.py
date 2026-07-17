#!/usr/bin/env python3
"""
Atualiza aldeoes.json (PT + EN) com stats e taxas base extraídas do jogo.

Preserva IDs, panteões, histórico de patch, ícones existentes e campos extras.

Exemplos:
  python scripts/merge-aldeoes-aom.py --dry-run
  python scripts/merge-aldeoes-aom.py --write
  python scripts/merge-aldeoes-aom.py --ids 7-8 --write
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR / "lib"))

from aom_game_paths import DEFAULT_CACHE_DIR, DEFAULT_CRYBAR, DEFAULT_GAME_DIR, resolve_game_dir
from aom_unit_extractor import ensure_bar_extracted
from aom_unit_merge import parse_id_range
from aom_villager_extractor import extract_villagers
from aom_villager_merge import merge_catalog_file


def locale_path(locale: str) -> Path:
    return ROOT / "src" / "data" / "locale" / locale / "aldeoes.json"


def print_report(result: dict[str, Any]) -> None:
    print(f"\n{result['path']}")
    print(f"  atualizados: {result['updated']}")
    if result["missing"]:
        print(f"  IDs sem proto configurado: {', '.join(map(str, result['missing']))}")
    for item in result["report"]:
        print(f"  - id={item['id']} proto={item['proto']} ({item['nome']})")
        for field, change in item["changes"].items():
            print(
                f"      {field}: "
                f"{json.dumps(change['before'], ensure_ascii=False)} -> "
                f"{json.dumps(change['after'], ensure_ascii=False)}"
            )


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument("--ids", help="IDs: 1,2,5 ou intervalo 1-11")
    parser.add_argument("--locale", choices=("pt", "en", "both"), default="both")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
        return 1

    id_filter = parse_id_range(args.ids)
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

    print(
        f"Modo: {'DRY-RUN' if args.dry_run else 'WRITE'} | "
        f"aldeões configurados: {len(rows)} | ids={args.ids or 'todos'}"
    )
    locales = ["pt", "en"] if args.locale == "both" else [args.locale]
    has_missing = False
    for locale in locales:
        result = merge_catalog_file(
            locale_path(locale),
            rows,
            locale=locale,
            id_filter=id_filter,
            dry_run=args.dry_run,
        )
        print_report(result)
        has_missing = has_missing or bool(result["missing"])

    if has_missing:
        return 1
    print("\nNenhum arquivo foi alterado (dry-run)." if args.dry_run else "\nArquivos atualizados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
