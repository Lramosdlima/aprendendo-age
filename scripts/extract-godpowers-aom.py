#!/usr/bin/env python3
"""
Extrai dados de god powers do Age of Mythology: Retold a partir do Data.bar.

Exemplos:
  python scripts/extract-godpowers-aom.py --power Bolt
  python scripts/extract-godpowers-aom.py --compare Bolt
  python scripts/extract-godpowers-aom.py --output tools/aom-godpowers.json
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
from aom_godpower_extractor import ensure_bar_extracted, extract_godpowers
from aom_godpower_merge import decode_catalog_name, resolve_proto_name


def load_existing_power(locale_dir: Path, power_name: str) -> dict | None:
    path = locale_dir / "godpowers.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    wanted = decode_catalog_name(power_name).lower()
    for row in data:
        for field in ("ingles", "nome"):
            value = decode_catalog_name(str(row.get(field, ""))).lower()
            if value == wanted:
                return row
    return None


def compare_records(existing: dict, extracted: dict, *, locale: str) -> list[str]:
    lines: list[str] = []
    mapping = {
        "cooldown_seg": "cooldown_seg",
        "duracao_no_mapa_seg": "duracao_no_mapa_seg",
        "custo_repetir": "custo_repetir",
        "incremento_por_uso": "incremento_por_uso",
        "icon": "icon",
    }
    for label, key in mapping.items():
        old = existing.get(key)
        new = extracted.get(key)
        if old is None and new is None:
            continue
        status = "OK" if old == new else "DIFF"
        lines.append(f"  [{status}] {label}: json={old!r} jogo={new!r}")

    desc_key = "descricao_resumida_en" if locale == "en" else "descricao_resumida_pt"
    lines.append(f"  [INFO] descricao_resumida json={existing.get('descricao_resumida')!r}")
    lines.append(f"  [INFO] descricao_resumida jogo={extracted.get(desc_key)!r}")
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
    parser.add_argument("--power", help="Proto name ou nome em inglês (ex.: Bolt)")
    parser.add_argument(
        "--compare",
        metavar="POWER",
        help="Compara god power extraído com src/data/locale/pt/godpowers.json",
    )
    parser.add_argument("--output", "-o", help="Salvar JSON com todos os god powers")
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

    compare_name = args.compare or args.power
    only_power = None
    if compare_name:
        all_extracted = extract_godpowers(cache_dir)
        extracted_index = {row["proto_name"]: row for row in all_extracted}
        only_power = resolve_proto_name(decode_catalog_name(compare_name), extracted_index)
        if not only_power:
            key = decode_catalog_name(compare_name).lower().replace(" ", "")
            compact = {name.lower().replace(" ", ""): name for name in extracted_index}
            only_power = compact.get(key)
        only_power = only_power or compare_name

    records = extract_godpowers(cache_dir, only_power=only_power)

    if args.compare:
        if not records:
            print(f"God power '{args.compare}' não encontrado.", file=sys.stderr)
            return 1
        extracted = records[0]
        existing = load_existing_power(ROOT / "src" / "data" / "locale" / "pt", args.compare)
        print(f"Comparação: {args.compare} -> {extracted.get('proto_name')}")
        print(json.dumps(extracted, ensure_ascii=False, indent=2))
        if existing:
            print("\nCampos vs godpowers.json:")
            for line in compare_records(existing, extracted, locale="pt"):
                print(line)
        else:
            print("\n(godpowers.json não contém este god power)")
        return 0

    if args.power:
        if not records:
            print(f"God power '{args.power}' não encontrado.", file=sys.stderr)
            return 1
        print(json.dumps(records[0], ensure_ascii=False, indent=2))
        return 0

    if args.output:
        all_records = extract_godpowers(cache_dir)
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(all_records, ensure_ascii=False, indent=2 if args.pretty else None),
            encoding="utf-8",
        )
        print(f"Exportados {len(all_records)} god powers -> {out_path}")
        return 0

    preview = extract_godpowers(cache_dir)
    print(json.dumps(preview[:3], ensure_ascii=False, indent=2))
    print(f"\n... total {len(preview)} god powers (use --output para salvar tudo)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
