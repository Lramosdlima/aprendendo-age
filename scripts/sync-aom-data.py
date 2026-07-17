#!/usr/bin/env python3
"""
Executa a extração e merge de todos os catálogos AoM Retold.

Atualiza, conforme seleção:
  - unidades_aom.json (PT + EN)
  - tecnologias.json (PT + EN)
  - godpowers.json (PT + EN)
  - construcoes.json (PT + EN)
  - reliquias.json (PT + EN)
  - mapas.json (PT + EN) + ícones/previews WebP

Exemplos:
  python scripts/sync-aom-data.py --dry-run
  python scripts/sync-aom-data.py --write
  python scripts/sync-aom-data.py --only unidades,godpowers --write
  python scripts/sync-aom-data.py --only tecnologias --dry-run --force-extract
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent

DEFAULTS = {
    "unidades": {
        "script": "merge-unidades-aom.py",
        "args": ["--ids", "1-171"],
    },
    "tecnologias": {
        "script": "merge-tecnologias-aom.py",
        "args": ["--index", "0-309"],
    },
    "godpowers": {
        "script": "merge-godpowers-aom.py",
        "args": ["--ids", "1-93"],
    },
    "construcoes": {
        "script": "merge-construcoes-aom.py",
        "args": ["--ids", "1-80"],
    },
    "reliquias": {
        "script": "merge-relics-aom.py",
        "args": ["--ids", "1-114"],
    },
    "mapas": {
        "script": "merge-mapas-aom.py",
        "args": [],
    },
}


def run_step(
    name: str,
    *,
    dry_run: bool,
    write: bool,
    locale: str,
    force_extract: bool,
    game_dir: str | None,
    cache_dir: str | None,
    crybar: str | None,
) -> int:
    config = DEFAULTS[name]
    script_path = SCRIPT_DIR / config["script"]
    cmd = [sys.executable, str(script_path), *config["args"], f"--locale={locale}"]

    if dry_run:
        cmd.append("--dry-run")
    if write:
        cmd.append("--write")
    if force_extract:
        cmd.append("--force-extract")
    if game_dir:
        cmd.extend(["--game-dir", game_dir])
    if cache_dir:
        cmd.extend(["--cache-dir", cache_dir])
    if crybar:
        cmd.extend(["--crybar", crybar])

    print(f"\n{'=' * 60}")
    print(f"▶ {name}")
    print(f"{'=' * 60}")
    result = subprocess.run(cmd, cwd=ROOT)
    return result.returncode


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--only",
        help=(
            "Catálogos separados por vírgula: "
            "unidades,tecnologias,godpowers,construcoes,reliquias,mapas"
        ),
    )
    parser.add_argument(
        "--locale",
        choices=("pt", "en", "both"),
        default="both",
        help="Locale(s) a atualizar (padrão: both)",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--force-extract", action="store_true")
    parser.add_argument("--game-dir")
    parser.add_argument("--cache-dir")
    parser.add_argument("--crybar")
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        print("Use --dry-run para simular ou --write para gravar.", file=sys.stderr)
        return 1

    if args.only:
        selected = [part.strip().lower() for part in args.only.split(",") if part.strip()]
        invalid = [name for name in selected if name not in DEFAULTS]
        if invalid:
            print(
                f"Catálogo(s) inválido(s): {', '.join(invalid)}. "
                f"Use: {', '.join(DEFAULTS)}",
                file=sys.stderr,
            )
            return 1
    else:
        selected = list(DEFAULTS)

    mode = "DRY-RUN" if args.dry_run else "WRITE"
    print(f"Sync AoM Retold | {mode} | locale={args.locale} | passos={', '.join(selected)}")

    exit_code = 0
    for name in selected:
        code = run_step(
            name,
            dry_run=args.dry_run,
            write=args.write,
            locale=args.locale,
            force_extract=args.force_extract,
            game_dir=args.game_dir,
            cache_dir=args.cache_dir,
            crybar=args.crybar,
        )
        if code != 0:
            exit_code = code
            print(f"\n✗ Falha em {name} (exit {code})", file=sys.stderr)

    if exit_code == 0:
        if args.dry_run:
            print("\nNenhum arquivo foi alterado (dry-run).")
        else:
            print("\nTodos os catálogos selecionados foram atualizados.")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
