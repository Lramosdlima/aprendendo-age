#!/usr/bin/env python3
"""
Atualiza tecnologias.json com dados extraídos do jogo.

Campos preservados (não sobrescritos):
  beneficia, campo, tipo, panteoes, god_especifico, god_dono

Exemplos:
  python scripts/merge-tecnologias-aom.py --tech "Hand Axe" --dry-run
  python scripts/merge-tecnologias-aom.py --tech HandAxe,CopperWeapons --write
  python scripts/merge-tecnologias-aom.py --index 0-9 --dry-run
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

from aom_game_paths import (  # noqa: E402
    DEFAULT_CACHE_DIR,
    DEFAULT_CRYBAR,
    DEFAULT_GAME_DIR,
    resolve_game_dir,
)
from aom_tech_extractor import ensure_bar_extracted, extract_techs  # noqa: E402
from aom_tech_merge import (  # noqa: E402
    index_extracted_by_proto,
    merge_catalog_file,
    parse_index_range,
    parse_tech_filter,
    supplement_extracted_index,
)


def locale_paths(locale: str) -> tuple[Path, Path]:
    locale_key = locale.lower()
    if locale_key == "en":
        return (
            ROOT / "src" / "data" / "locale" / "en" / "tecnologias.json",
            ROOT / "src" / "data" / "locale" / "en" / "construcoes.json",
        )
    return (
        ROOT / "src" / "data" / "locale" / "pt" / "tecnologias.json",
        ROOT / "src" / "data" / "locale" / "pt" / "construcoes.json",
    )


def print_report(result: dict[str, Any]) -> None:
    print(f"\n{result['path']}")
    print(f"  atualizadas: {result['updated']}")
    if result["missing"]:
        print(f"  sem match no techtree: {', '.join(result['missing'])}")
    for item in result["report"]:
        label = item.get("catalog_name") or item["proto"]
        print(
            f"  - index={item['index']} proto={item['proto']} "
            f"({item['nome']}, catálogo={label})"
        )
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
        "--tech",
        help='Nome(s) em inglês ou proto separados por vírgula (ex.: "Hand Axe" ou HandAxe)',
    )
    parser.add_argument(
        "--index",
        help="Índice(s) no array JSON: 0,2,5 ou intervalo 0-10",
    )
    parser.add_argument(
        "--locale",
        choices=("pt", "en", "both"),
        default="both",
        help="Qual tecnologias.json atualizar (padrão: both)",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
        return 1

    tech_filter = parse_tech_filter(args.tech)
    index_filter = parse_index_range(args.index)
    if tech_filter is None and index_filter is None:
        print("Informe --tech ou --index para limitar o merge.", file=sys.stderr)
        return 1

    game_dir = resolve_game_dir(args.game_dir)
    cache_dir = Path(args.cache_dir).resolve()
    crybar_exe = Path(args.crybar).resolve()
    catalog_pt, construcoes_pt = locale_paths("pt")

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

    extracted_rows = extract_techs(cache_dir, construcoes_path=construcoes_pt)
    extracted_index = index_extracted_by_proto(extracted_rows)
    added = supplement_extracted_index(
        extracted_index,
        catalog_path=catalog_pt,
        cache_dir=cache_dir,
        construcoes_path=construcoes_pt,
        tech_filter=tech_filter,
        index_filter=index_filter,
    )

    locales = ["pt", "en"] if args.locale == "both" else [args.locale]
    print(
        f"Modo: {'DRY-RUN' if args.dry_run else 'WRITE'} | "
        f"tecnologias no techtree: {len(extracted_index)}"
        f"{f' (+{added} sob demanda)' if added else ''} | "
        f"filtro: tech={args.tech or '-'} index={args.index or '-'}"
    )

    for locale in locales:
        catalog_path, construcoes_path = locale_paths(locale)
        result = merge_catalog_file(
            catalog_path,
            extracted_index,
            locale=locale,
            construcoes_path=construcoes_path,
            cache_dir=cache_dir,
            tech_filter=tech_filter,
            index_filter=index_filter,
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
