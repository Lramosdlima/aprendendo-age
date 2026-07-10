#!/usr/bin/env python3
"""
Atualiza reliquias.json com dados extraídos do jogo.

Campos preservados (não sobrescritos):
  id

Também exporta ícones para public/assets/relics e atualiza token_asset_map.json.

Exemplos:
  python scripts/merge-relics-aom.py --relic "Ankh of Ra" --dry-run
  python scripts/merge-relics-aom.py --ids 1-10 --write
  python scripts/merge-relics-aom.py --bootstrap --write
  python scripts/merge-relics-aom.py --ids 1-114 --write
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
from aom_relic_extractor import extract_relics
from aom_relic_icons import sync_relic_icons
from aom_relic_merge import (
    index_extracted_by_proto,
    merge_catalog_file,
    parse_relic_filter,
)
from aom_unit_extractor import ensure_bar_extracted
from aom_unit_merge import parse_id_range


def locale_paths(locale: str) -> Path:
    locale_key = locale.lower()
    if locale_key == "en":
        return ROOT / "src" / "data" / "locale" / "en" / "reliquias.json"
    return ROOT / "src" / "data" / "locale" / "pt" / "reliquias.json"


def print_report(result: dict[str, Any]) -> None:
    print(f"\n{result['path']}")
    if result.get("bootstrapped"):
        print(f"  bootstrap: {result['updated']} entradas criadas")
        return
    print(f"  atualizadas: {result['updated']}")
    if result["missing"]:
        print(f"  sem match no jogo: {', '.join(result['missing'])}")
    for item in result["report"]:
        label = item.get("catalog_name") or item["proto"]
        print(f"  - id={item['id']} proto={item['proto']} ({item['nome']}, catálogo={label})")
        for field, change in item["changes"].items():
            print(f"      {field}:")
            print(f"        antes: {json.dumps(change['before'], ensure_ascii=False)}")
            print(f"        depois: {json.dumps(change['after'], ensure_ascii=False)}")


def print_icon_report(result: dict[str, Any]) -> None:
    print(f"\nÍcones -> {result['assets_dir']}")
    print(f"  tokens: {result['total_tokens']}")
    print(f"  exportados: {len(result['exported'])}")
    if result["skipped"]:
        print(f"  já existiam: {len(result['skipped'])}")
    if result["missing"]:
        print(f"  ausentes no jogo: {', '.join(result['missing'])}")
    if result["map_changes"]:
        print(f"  token_asset_map: {len(result['map_changes'])} entradas")


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
        "--relic",
        help='Nome(s) em inglês ou proto separados por vírgula (ex.: "Ankh of Ra")',
    )
    parser.add_argument("--ids", help="ID(s) do catálogo: 1,2,5 ou intervalo 1-10")
    parser.add_argument(
        "--locale",
        choices=("pt", "en", "both"),
        default="both",
        help="Qual reliquias.json atualizar (padrão: both)",
    )
    parser.add_argument("--bootstrap", action="store_true", help="Cria reliquias.json se ausente")
    parser.add_argument("--skip-icons", action="store_true", help="Não exporta ícones do jogo")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
        return 1

    relic_filter = parse_relic_filter(args.relic)
    id_filter = parse_id_range(args.ids)
    if not args.bootstrap and relic_filter is None and id_filter is None:
        print("Informe --relic, --ids ou --bootstrap para limitar o merge.", file=sys.stderr)
        return 1

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
    except FileNotFoundError as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print(f"Falha ao executar crybar: {exc}", file=sys.stderr)
        return 1

    extracted_rows = extract_relics(cache_dir)
    extracted_index = index_extracted_by_proto(extracted_rows)

    locales = ["pt", "en"] if args.locale == "both" else [args.locale]
    print(
        f"Modo: {'DRY-RUN' if args.dry_run else 'WRITE'} | "
        f"relíquias no jogo: {len(extracted_index)} | "
        f"filtro: relic={args.relic or '-'} ids={args.ids or '-'} "
        f"bootstrap={args.bootstrap}"
    )

    for locale in locales:
        catalog_path = locale_paths(locale)
        bootstrap = args.bootstrap or not catalog_path.exists()
        result = merge_catalog_file(
            catalog_path,
            extracted_index,
            locale=locale,
            relic_filter=relic_filter,
            id_filter=id_filter,
            dry_run=args.dry_run,
            bootstrap=bootstrap,
        )
        print_report(result)

    if not args.skip_icons:
        icon_result = sync_relic_icons(
            extracted_rows,
            game_dir=game_dir,
            crybar_exe=crybar_exe,
            dry_run=args.dry_run,
        )
        print_icon_report(icon_result)

    if args.dry_run:
        print("\nNenhum arquivo foi alterado (dry-run).")
    else:
        print("\nArquivos atualizados.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
