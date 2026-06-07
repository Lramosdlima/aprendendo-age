#!/usr/bin/env python3
"""
Atualiza unidades_aom.json com dados extraídos do jogo.

Campos preservados (não sobrescritos):
  id, counter_de, categoria, forte_contra, fraco_contra, forca_atributos

Exemplos:
  python scripts/merge-unidades-aom.py --unit Hoplite --dry-run
  python scripts/merge-unidades-aom.py --unit Hoplite --write
  python scripts/merge-unidades-aom.py --ids 1-5 --dry-run
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
from aom_unit_extractor import ensure_bar_extracted, extract_units  # noqa: E402
from aom_unit_merge import (  # noqa: E402
    index_extracted_by_proto,
    merge_catalog_file,
    parse_id_range,
    parse_unit_filter,
    supplement_extracted_index,
)


def locale_paths(locale: str) -> tuple[Path, Path]:
    locale_key = locale.lower()
    if locale_key == "en":
        return (
            ROOT / "src" / "data" / "locale" / "en" / "unidades_aom.json",
            ROOT / "src" / "data" / "locale" / "en" / "construcoes.json",
        )
    return (
        ROOT / "src" / "data" / "locale" / "pt" / "unidades_aom.json",
        ROOT / "src" / "data" / "locale" / "pt" / "construcoes.json",
    )


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
    parser.add_argument(
        "--game-dir",
        default=str(DEFAULT_GAME_DIR),
        help="Diretório raiz do AoM Retold",
    )
    parser.add_argument(
        "--cache-dir",
        default=str(DEFAULT_CACHE_DIR),
        help="Cache com proto/techtree/strings",
    )
    parser.add_argument(
        "--crybar",
        default=str(DEFAULT_CRYBAR),
        help="Caminho para crybar.exe",
    )
    parser.add_argument(
        "--unit",
        help="Proto name(s) separados por vírgula (ex.: Hoplite ou Hoplite,Hippeus)",
    )
    parser.add_argument(
        "--ids",
        help="ID(s) do catálogo: 1,2,5 ou intervalo 1-10",
    )
    parser.add_argument(
        "--locale",
        choices=("pt", "en", "both"),
        default="both",
        help="Qual unidades_aom.json atualizar (padrão: both)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Mostra diff sem gravar arquivos",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Grava as alterações nos JSONs",
    )
    parser.add_argument(
        "--force-extract",
        action="store_true",
        help="Reextrai Data.bar antes do merge",
    )
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
        return 1

    unit_filter = parse_unit_filter(args.unit)
    id_filter = parse_id_range(args.ids)
    if unit_filter is None and id_filter is None:
        print("Informe --unit ou --ids para limitar o merge.", file=sys.stderr)
        return 1

    game_dir = resolve_game_dir(args.game_dir)
    cache_dir = Path(args.cache_dir).resolve()
    crybar_exe = Path(args.crybar).resolve()
    construcoes_pt = ROOT / "src" / "data" / "locale" / "pt" / "construcoes.json"

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

    proto_names = list(unit_filter) if unit_filter else None
    extracted_rows = extract_units(
        cache_dir,
        only_unit=proto_names[0] if proto_names and len(proto_names) == 1 else None,
        construcoes_path=construcoes_pt,
    )
    if proto_names and len(proto_names) > 1:
        wanted = {name.lower() for name in proto_names}
        extracted_rows = [
            row for row in extracted_rows if row.get("proto_name", "").lower() in wanted
        ]
    elif id_filter is not None and unit_filter is None:
        extracted_rows = extract_units(
            cache_dir,
            construcoes_path=construcoes_pt,
        )

    extracted_index = index_extracted_by_proto(extracted_rows)
    catalog_pt, construcoes_pt_path = locale_paths("pt")
    added = supplement_extracted_index(
        extracted_index,
        catalog_path=catalog_pt,
        cache_dir=cache_dir,
        construcoes_path=construcoes_pt_path,
        id_filter=id_filter,
        unit_filter=unit_filter,
    )
    locales = ["pt", "en"] if args.locale == "both" else [args.locale]

    print(
        f"Modo: {'DRY-RUN' if args.dry_run else 'WRITE'} | "
        f"unidades no proto: {len(extracted_index)}"
        f"{f' (+{added} sob demanda)' if added else ''} | "
        f"filtro: unit={args.unit or '-'} ids={args.ids or '-'}"
    )

    for locale in locales:
        catalog_path, construcoes_path = locale_paths(locale)
        result = merge_catalog_file(
            catalog_path,
            extracted_index,
            locale=locale,
            construcoes_path=construcoes_path,
            unit_filter=unit_filter,
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
