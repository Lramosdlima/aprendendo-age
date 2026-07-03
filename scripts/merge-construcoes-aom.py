#!/usr/bin/env python3
"""
Atualiza construcoes.json com dados extraídos do jogo.

Campos preservados (não sobrescritos):
  id, nome, tipo, panteao, panteao_id, era, era_id,
  tecnologias, tecnologias_ids, unidades, unidades_ids, ingles

Exemplos:
  python scripts/merge-construcoes-aom.py --building "Town Center" --dry-run
  python scripts/merge-construcoes-aom.py --ids 1-10 --write
  python scripts/merge-construcoes-aom.py --ids 1-80 --write
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

from aom_building_extractor import ensure_bar_extracted, extract_buildings
from aom_building_merge import (
    index_extracted_by_proto,
    merge_catalog_file,
    parse_building_filter,
    supplement_extracted_index,
)
from aom_game_paths import DEFAULT_CACHE_DIR, DEFAULT_CRYBAR, DEFAULT_GAME_DIR, resolve_game_dir
from aom_unit_merge import parse_id_range


def locale_paths(locale: str) -> Path:
    locale_key = locale.lower()
    if locale_key == "en":
        return ROOT / "src" / "data" / "locale" / "en" / "construcoes.json"
    return ROOT / "src" / "data" / "locale" / "pt" / "construcoes.json"


def print_report(result: dict[str, Any]) -> None:
    print(f"\n{result['path']}")
    print(f"  atualizadas: {result['updated']}")
    if result["missing"]:
        print(f"  sem match no proto: {', '.join(result['missing'])}")
    for item in result["report"]:
        label = item.get("catalog_name") or item["proto"]
        print(f"  - id={item['id']} proto={item['proto']} ({item['nome']}, catálogo={label})")
        for field, change in item["changes"].items():
            print(f"      {field}:")
            print(f"        antes: {json.dumps(change['before'], ensure_ascii=False)}")
            print(f"        depois: {json.dumps(change['after'], ensure_ascii=False)}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument(
        "--building",
        help='Nome(s) em inglês ou proto separados por vírgula (ex.: "Town Center")',
    )
    parser.add_argument("--ids", help="ID(s) do catálogo: 1,2,5 ou intervalo 1-10")
    parser.add_argument(
        "--locale",
        choices=("pt", "en", "both"),
        default="both",
        help="Qual construcoes.json atualizar (padrão: both)",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
        return 1

    building_filter = parse_building_filter(args.building)
    id_filter = parse_id_range(args.ids)
    if building_filter is None and id_filter is None:
        print("Informe --building ou --ids para limitar o merge.", file=sys.stderr)
        return 1

    game_dir = resolve_game_dir(args.game_dir)
    cache_dir = Path(args.cache_dir).resolve()
    crybar_exe = Path(args.crybar).resolve()
    catalog_pt = locale_paths("pt")

    try:
        ensure_bar_extracted(
            game_dir=game_dir,
            cache_dir=cache_dir,
            crybar_exe=crybar_exe,
            force=args.force_extract,
        )
    except FileNotFoundError as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print(f"Falha ao executar crybar: {exc}", file=sys.stderr)
        return 1

    extracted_rows = extract_buildings(cache_dir)
    extracted_index = index_extracted_by_proto(extracted_rows)
    added = supplement_extracted_index(
        extracted_index,
        catalog_path=catalog_pt,
        cache_dir=cache_dir,
        id_filter=id_filter,
        building_filter=building_filter,
    )

    locales = ["pt", "en"] if args.locale == "both" else [args.locale]
    print(
        f"Modo: {'DRY-RUN' if args.dry_run else 'WRITE'} | "
        f"construções no proto: {len(extracted_index)}"
        f"{f' (+{added} sob demanda)' if added else ''} | "
        f"filtro: building={args.building or '-'} ids={args.ids or '-'}"
    )

    for locale in locales:
        result = merge_catalog_file(
            locale_paths(locale),
            extracted_index,
            building_filter=building_filter,
            id_filter=id_filter,
            dry_run=args.dry_run,
        )
        print_report(result)

    if args.dry_run:
        print("\nNenhum arquivo foi alterado (dry-run).")
    else:
        print("\nArquivos atualizados.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
