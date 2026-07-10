#!/usr/bin/env python3
"""
Extrai dados de relíquias do Age of Mythology: Retold a partir do techtree.xml.

Exemplos:
  python scripts/extract-relics-aom.py --relic RelicAnkhofRa
  python scripts/extract-relics-aom.py --compare "Ankh of Ra"
  python scripts/extract-relics-aom.py --output tools/aom-relics.json
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

from aom_game_paths import DEFAULT_CACHE_DIR, DEFAULT_CRYBAR, DEFAULT_GAME_DIR, resolve_game_dir
from aom_relic_extractor import extract_relics
from aom_relic_merge import decode_catalog_name, resolve_proto_name
from aom_unit_extractor import ensure_bar_extracted


def load_existing_relic(locale_dir: Path, relic_name: str) -> dict | None:
    path = locale_dir / "reliquias.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    wanted = decode_catalog_name(relic_name).lower()
    for row in data:
        for field in ("ingles", "nome"):
            value = decode_catalog_name(str(row.get(field, ""))).lower()
            if value == wanted:
                return row
    return None


def index_by_proto(rows: list[dict]) -> dict[str, dict]:
    return {row["proto_name"]: row for row in rows if row.get("proto_name")}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-dir", default=str(DEFAULT_GAME_DIR))
    parser.add_argument("--cache-dir", default=str(DEFAULT_CACHE_DIR))
    parser.add_argument("--crybar", default=str(DEFAULT_CRYBAR))
    parser.add_argument("--relic", help="Proto name (ex.: RelicAnkhofRa)")
    parser.add_argument(
        "--compare",
        metavar="RELIC",
        help="Compara relíquia extraída com src/data/locale/pt/reliquias.json",
    )
    parser.add_argument("--output", "-o", help="Salvar JSON com relíquias extraídas")
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

    compare_name = args.compare or args.relic
    only_relic = None
    if compare_name:
        all_extracted = extract_relics(cache_dir)
        extracted_index = index_by_proto(all_extracted)
        only_relic = resolve_proto_name(decode_catalog_name(compare_name), extracted_index)
        only_relic = only_relic or compare_name

    records = extract_relics(cache_dir, only_relic=only_relic)

    if args.compare:
        if not records:
            print(f"Relíquia '{args.compare}' não encontrada.", file=sys.stderr)
            return 1
        extracted = records[0]
        existing = load_existing_relic(ROOT / "src" / "data" / "locale" / "pt", args.compare)
        print(f"Comparação: {args.compare} -> {extracted.get('proto_name')}")
        print(json.dumps(extracted, ensure_ascii=False, indent=2))
        if existing:
            print(f"\nCampos vs reliquias.json (id={existing.get('id')}):")
            for field in ("nome", "ingles", "descricao_resumida", "descricao_avancada", "icon"):
                old = existing.get(field)
                new_key = field
                if field == "descricao_resumida":
                    new = extracted.get("descricao_resumida_pt")
                elif field == "descricao_avancada":
                    new = extracted.get("descricao_avancada_pt")
                else:
                    new = extracted.get(field)
                status = "OK" if old == new else "DIFF"
                print(f"  [{status}] {field}: json={old!r} jogo={new!r}")
        else:
            print("\n(reliquias.json não contém esta relíquia)")
        return 0

    if args.relic:
        if not records:
            print(f"Relíquia '{args.relic}' não encontrada.", file=sys.stderr)
            return 1
        print(json.dumps(records[0], ensure_ascii=False, indent=2))
        return 0

    if args.output:
        all_records = extract_relics(cache_dir)
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(all_records, ensure_ascii=False, indent=2 if args.pretty else None),
            encoding="utf-8",
        )
        print(f"Exportadas {len(all_records)} relíquias -> {out_path}")
        return 0

    preview = extract_relics(cache_dir)
    print(json.dumps(preview[:3], ensure_ascii=False, indent=2))
    print(f"\n... total {len(preview)} relíquias (use --output para salvar tudo)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
