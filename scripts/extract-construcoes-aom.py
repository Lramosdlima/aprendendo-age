#!/usr/bin/env python3
"""
Extrai dados de construções do Age of Mythology: Retold a partir do proto.xml.

Exemplos:
  python scripts/extract-construcoes-aom.py --building TownCenter
  python scripts/extract-construcoes-aom.py --compare "Town Center"
  python scripts/extract-construcoes-aom.py --output tools/aom-construcoes.json
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR / "lib"))

from aom_building_extractor import (
    ensure_bar_extracted,
    extract_buildings,
    resolve_building_icon,
)
from aom_building_merge import decode_catalog_name, resolve_proto_name
from aom_game_paths import DEFAULT_CACHE_DIR, DEFAULT_CRYBAR, DEFAULT_GAME_DIR, resolve_game_dir


def load_existing_building(locale_dir: Path, building_name: str) -> dict | None:
    path = locale_dir / "construcoes.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    wanted = decode_catalog_name(building_name).lower()
    for row in data:
        for field in ("ingles", "nome"):
            value = decode_catalog_name(str(row.get(field, ""))).lower()
            if value == wanted:
                return row
    return None


def compare_records(existing: dict, extracted: dict) -> list[str]:
    lines: list[str] = []
    mapping = {
        "pontos_de_vida": "pontos_de_vida",
        "dano_perfurante": "dano_perfurante",
        "dano_cortante": "dano_cortante",
        "alcance": "alcance",
        "dps": "dps",
        "madeira": "madeira",
        "ouro": "ouro",
        "custo": "custo",
        "guarnicao": "guarnicao",
        "tempo_construir_segundos": "tempo_construir_segundos",
        "no_projeteis": "no_projeteis",
    }
    icon = resolve_building_icon(extracted, existing.get("panteao_id"))
    for label, key in mapping.items():
        old = existing.get(key)
        new = extracted.get(key)
        if old is None and new is None:
            continue
        status = "OK" if old == new else "DIFF"
        lines.append(f"  [{status}] {label}: json={old!r} jogo={new!r}")
    old_icon = existing.get("icon")
    status = "OK" if old_icon == icon else "DIFF"
    lines.append(f"  [{status}] icon: json={old_icon!r} jogo={icon!r}")
    return lines


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument("--building", help="Proto name (ex.: TownCenter, Storehouse)")
    parser.add_argument(
        "--compare",
        metavar="BUILDING",
        help="Compara construção extraída com src/data/locale/pt/construcoes.json",
    )
    parser.add_argument("--output", "-o", help="Salvar JSON com construções extraídas")
    parser.add_argument("--force-extract", action="store_true")
    parser.add_argument("--pretty", action="store_true")
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
    except FileNotFoundError as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print(f"Falha ao executar crybar: {exc}", file=sys.stderr)
        return 1

    compare_name = args.compare or args.building
    only_building = None
    if compare_name:
        all_extracted = extract_buildings(cache_dir)
        extracted_index = {row["proto_name"]: row for row in all_extracted}
        only_building = resolve_proto_name(decode_catalog_name(compare_name), extracted_index)
        only_building = only_building or compare_name

    records = extract_buildings(cache_dir, only_building=only_building)

    if args.compare:
        if not records:
            print(f"Construção '{args.compare}' não encontrada.", file=sys.stderr)
            return 1
        extracted = records[0]
        existing = load_existing_building(ROOT / "src" / "data" / "locale" / "pt", args.compare)
        print(f"Comparação: {args.compare} -> {extracted.get('proto_name')}")
        print(json.dumps(extracted, ensure_ascii=False, indent=2))
        if existing:
            print(f"\nCampos vs construcoes.json (id={existing.get('id')}):")
            for line in compare_records(existing, extracted):
                print(line)
        else:
            print("\n(construcoes.json não contém esta construção)")
        return 0

    if args.building:
        if not records:
            print(f"Construção '{args.building}' não encontrada.", file=sys.stderr)
            return 1
        print(json.dumps(records[0], ensure_ascii=False, indent=2))
        return 0

    if args.output:
        all_records = extract_buildings(cache_dir)
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(all_records, ensure_ascii=False, indent=2 if args.pretty else None),
            encoding="utf-8",
        )
        print(f"Exportadas {len(all_records)} construções -> {out_path}")
        return 0

    preview = extract_buildings(cache_dir)
    print(json.dumps(preview[:3], ensure_ascii=False, indent=2))
    print(f"\n... total {len(preview)} construções (use --output para salvar tudo)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
