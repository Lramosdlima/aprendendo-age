#!/usr/bin/env python3
"""
Extrai dados de unidades do Age of Mythology: Retold a partir do Data.bar.

Requisitos:
  - Instalação do jogo (Steam)
  - crybar.exe em aprendendo-age/tools/crybar/cli/ (CryBar.Cli do CryBarEditor)

Exemplos:
  python scripts/extract-unidades-aom.py --unit Hoplite
  python scripts/extract-unidades-aom.py --compare Hoplite
  python scripts/extract-unidades-aom.py --output tools/aom-unidades.json
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR / "lib"))

from aom_game_paths import (  # noqa: E402
    DEFAULT_CACHE_DIR,
    DEFAULT_CRYBAR,
    DEFAULT_GAME_DIR,
    resolve_game_dir,
)
from aom_unit_extractor import ensure_bar_extracted, extract_units  # noqa: E402

NUMERIC_FIELDS = {
    "pontos_de_vida",
    "dano_cortante",
    "dano_perfurante",
    "dano_contusao",
    "velocidade_de_ataque_atk_s",
    "dps",
    "armadura_anticorte",
    "armadura_antiperfurante",
    "armadura_anticontusao",
    "comida",
    "madeira",
    "ouro",
    "populacao",
    "tempo_treinamento",
    "velocidade_movimento",
}


def load_existing_hoplite(locale_dir: Path, proto_name: str) -> dict | None:
    path = locale_dir / "unidades_aom.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    for row in data:
        if row.get("ingles", "").lower() == proto_name.lower():
            return row
        if row.get("nome", "").lower() == proto_name.lower():
            return row
    return None


def compare_records(existing: dict, extracted: dict) -> list[str]:
    lines: list[str] = []
    mapping = {
        "pontos_de_vida": "pontos_de_vida",
        "dano_cortante": "dano_cortante",
        "velocidade_de_ataque_atk_s": "velocidade_de_ataque_atk_s",
        "dps": "dps",
        "armadura_anticorte": "armadura_anticorte",
        "armadura_antiperfurante": "armadura_antiperfurante",
        "comida": "comida",
        "madeira": "madeira",
        "ouro": "ouro",
        "populacao": "populacao",
        "tempo_treinamento": "tempo_treinamento",
        "velocidade_movimento": "velocidade_movimento",
    }
    for label, key in mapping.items():
        old = existing.get(key)
        new = extracted.get(key)
        if old is None and new is None:
            continue
        match = old == new
        if isinstance(old, (int, float)) and isinstance(new, (int, float)):
            match = abs(float(old) - float(new)) < 0.001
        status = "OK" if match else "DIFF"
        lines.append(f"  [{status}] {label}: json={old!r} jogo={new!r}")

    old_bonus = existing.get("multiplicador") or []
    new_bonus = extracted.get("multiplicador") or []
    lines.append(f"  [INFO] multiplicador json={old_bonus}")
    lines.append(f"  [INFO] multiplicador jogo={new_bonus}")
    lines.append(f"  [INFO] construcao json={existing.get('construcao')}")
    lines.append(f"  [INFO] construcao jogo={extracted.get('construcao')}")
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--game-dir",
        default=str(DEFAULT_GAME_DIR),
        help="Diretório raiz do AoM Retold (ou AOM_GAME_DIR)",
    )
    parser.add_argument(
        "--cache-dir",
        default=str(DEFAULT_CACHE_DIR),
        help="Pasta cache para proto/techtree/strings extraídos",
    )
    parser.add_argument(
        "--crybar",
        default=str(DEFAULT_CRYBAR),
        help="Caminho para crybar.exe",
    )
    parser.add_argument(
        "--unit",
        help="Extrair apenas uma unidade pelo proto name (ex.: Hoplite)",
    )
    parser.add_argument(
        "--compare",
        metavar="UNIT",
        help="Compara unidade extraída com src/data/locale/pt/unidades_aom.json",
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Salvar JSON com todas as unidades extraídas",
    )
    parser.add_argument(
        "--force-extract",
        action="store_true",
        help="Reextrai Data.bar mesmo se cache existir",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="JSON indentado",
    )
    args = parser.parse_args()

    game_dir = resolve_game_dir(args.game_dir)
    cache_dir = Path(args.cache_dir).resolve()
    crybar_exe = Path(args.crybar).resolve()
    construcoes_path = SCRIPT_DIR.parent / "src" / "data" / "locale" / "pt" / "construcoes.json"

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

    only_unit = args.unit or args.compare
    records = extract_units(
        cache_dir,
        only_unit=only_unit,
        construcoes_path=construcoes_path,
    )

    if args.compare:
        if not records:
            print(f"Unidade '{args.compare}' não encontrada no proto.xml", file=sys.stderr)
            return 1
        extracted = records[0]
        existing = load_existing_hoplite(
            SCRIPT_DIR.parent / "src" / "data" / "locale" / "pt",
            args.compare,
        )
        print(f"Comparação: {args.compare}")
        print(json.dumps(extracted, ensure_ascii=False, indent=2))
        if existing:
            print("\nCampos numéricos vs unidades_aom.json:")
            for line in compare_records(existing, extracted):
                print(line)
        else:
            print("\n(unidades_aom.json não contém esta unidade)")
        return 0

    if args.unit:
        if not records:
            print(f"Unidade '{args.unit}' não encontrada.", file=sys.stderr)
            return 1
        print(json.dumps(records[0], ensure_ascii=False, indent=2))
        return 0

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(records, ensure_ascii=False, indent=2 if args.pretty else None),
            encoding="utf-8",
        )
        print(f"Exportadas {len(records)} unidades -> {out_path}")
        return 0

    print(json.dumps(records[:3], ensure_ascii=False, indent=2))
    print(f"\n... total {len(records)} unidades (use --output para salvar tudo)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
