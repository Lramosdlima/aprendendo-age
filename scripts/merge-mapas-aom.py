#!/usr/bin/env python3
"""
Atualiza mapas.json (PT + EN) e exporta ícones/previews dos mapas em WebP.

Campos editoriais preservados em entradas existentes:
  origem, histórico saiu_da_ranqueada e campos adicionais.

Pools sincronizados dos arquivos .set instalados:
  padrao/mapas_da_ranqueada, partidas_rapidas e tipo Land/Water.

Exemplos:
  python scripts/merge-mapas-aom.py --dry-run
  python scripts/merge-mapas-aom.py --write
  python scripts/merge-mapas-aom.py --map tenochtitlans_heart --write
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
from aom_map_assets import sync_map_assets
from aom_map_extractor import SPECIAL_MAP_IDS, extract_maps
from aom_map_merge import merge_catalog_file
from aom_unit_extractor import ensure_bar_extracted


def locale_path(locale: str) -> Path:
    return ROOT / "src" / "data" / "locale" / locale / "mapas.json"


def print_merge_report(result: dict[str, Any]) -> None:
    print(f"\n{result['path']}")
    print(f"  adicionados: {result['added']}")
    print(f"  atualizados: {result['updated']}")
    print(f"  total: {result['total']}")
    for item in result["report"]:
        print(f"  - {item['map_id']} ({item['nome']})")
        for field, change in item["changes"].items():
            if field == "__added__":
                print("      nova entrada")
                continue
            print(
                f"      {field}: "
                f"{json.dumps(change['before'], ensure_ascii=False)} -> "
                f"{json.dumps(change['after'], ensure_ascii=False)}"
            )


def print_asset_report(result: dict[str, Any]) -> None:
    print(f"\nAssets -> {result['assets_dir']}")
    print(f"  exportados: {len(result['exported'])}")
    print(f"  já existiam: {len(result['skipped'])}")
    print(f"  token_asset_map: {len(result['map_changes'])} alterações")
    if result["missing"]:
        print(f"  ausentes: {', '.join(result['missing'])}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument("--map", dest="map_ids", help="IDs separados por vírgula")
    parser.add_argument("--locale", choices=("pt", "en", "both"), default="both")
    parser.add_argument(
        "--include-special-maps",
        action="store_true",
        help="Inclui Land Unknown e The Unknown no catálogo",
    )
    parser.add_argument("--skip-assets", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
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
        rows = extract_maps(
            game_dir=game_dir,
            cache_dir=cache_dir,
            crybar_exe=crybar_exe,
        )
    except (FileNotFoundError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    if not args.include_special_maps:
        rows = [row for row in rows if row["map_id"] not in SPECIAL_MAP_IDS]

    if args.map_ids:
        wanted = {part.strip().casefold() for part in args.map_ids.split(",") if part.strip()}
        rows = [row for row in rows if row["map_id"].casefold() in wanted]
        found = {row["map_id"].casefold() for row in rows}
        missing = sorted(wanted - found)
        if missing:
            print(f"Mapa(s) não encontrado(s): {', '.join(missing)}", file=sys.stderr)
            return 1

    print(
        f"Modo: {'DRY-RUN' if args.dry_run else 'WRITE'} | "
        f"mapas no jogo: {len(rows)} | filtro: {args.map_ids or '-'}"
    )
    locales = ["pt", "en"] if args.locale == "both" else [args.locale]
    try:
        for locale in locales:
            result = merge_catalog_file(
                locale_path(locale),
                rows,
                locale=locale,
                dry_run=args.dry_run,
            )
            print_merge_report(result)
    except ValueError as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    if not args.skip_assets:
        try:
            asset_result = sync_map_assets(
                rows,
                game_dir=game_dir,
                crybar_exe=crybar_exe,
                dry_run=args.dry_run,
            )
        except (FileNotFoundError, RuntimeError) as exc:
            print(f"Erro ao exportar assets: {exc}", file=sys.stderr)
            return 1
        print_asset_report(asset_result)
        if asset_result["missing"]:
            return 1

    print("\nNenhum arquivo foi alterado (dry-run)." if args.dry_run else "\nArquivos atualizados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
