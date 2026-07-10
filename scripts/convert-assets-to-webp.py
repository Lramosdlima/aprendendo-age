#!/usr/bin/env python3
"""
Converte imagens raster em public/assets (PNG/JPG) para WebP e atualiza referências no código.

WebP é o formato recomendado para este projeto:
  - Suporte universal nos browsers modernos (>97% global)
  - ~70–85% menor que PNG para ícones UI (qualidade 90, RGBA)
  - Já usado em ~250 assets do site (techs, abilities, etc.)
  - AVIF comprime um pouco mais, mas encode/decode mais lentos e suporte inferior

Dependência: pip install Pillow

Exemplos:
  python scripts/convert-assets-to-webp.py --dry-run
  python scripts/convert-assets-to-webp.py --write
  python scripts/convert-assets-to-webp.py --write --delete-originals
  python scripts/convert-assets-to-webp.py --write --include-trilha
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Erro: instale Pillow com  pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ASSETS_DIR = ROOT / "public" / "assets"
DEFAULT_TRILHA_DIR = ROOT / "public" / "trilha-de-aprendizado"

SOURCE_EXTENSIONS = {".png", ".jpg", ".jpeg"}
SKIP_EXTENSIONS = {".gif"}  # animados — manter formato original

REFERENCE_DIRS = [
    ROOT / "src",
    ROOT / "scripts",
]
REFERENCE_FILES = [
    ROOT / "index.html",
]

# Pastas ignoradas ao varrer referências
REFERENCE_IGNORE_PARTS = {
    "node_modules",
    "dist",
    "tools",
    ".git",
}


@dataclass
class ConversionResult:
    source: Path
    dest: Path
    source_bytes: int
    dest_bytes: int
    skipped_reason: str | None = None


@dataclass
class RunReport:
    converted: list[ConversionResult] = field(default_factory=list)
    skipped: list[ConversionResult] = field(default_factory=list)
    reference_files_updated: list[Path] = field(default_factory=list)
    reference_replacements: int = 0
    broken_refs: list[str] = field(default_factory=list)


def public_url_for(path: Path, public_root: Path) -> str:
    rel = path.relative_to(public_root).as_posix()
    return f"/{rel}"


def convert_image(
    source: Path,
    dest: Path,
    *,
    quality: int,
    dry_run: bool,
) -> ConversionResult:
    source_bytes = source.stat().st_size
    result = ConversionResult(source=source, dest=dest, source_bytes=source_bytes, dest_bytes=0)

    if dest.exists() and dest.stat().st_mtime >= source.stat().st_mtime:
        result.skipped_reason = "webp já existe e é mais recente"
        result.dest_bytes = dest.stat().st_size
        return result

    if dry_run:
        # Estimativa conservadora (~35% do PNG) só para o relatório
        result.dest_bytes = max(1, int(source_bytes * 0.35))
        return result

    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as img:
        save_kwargs: dict = {"method": 6}
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
            save_kwargs["quality"] = quality
        elif img.mode != "RGB":
            img = img.convert("RGB")
            save_kwargs["quality"] = quality
        else:
            save_kwargs["quality"] = quality
        img.save(dest, "WEBP", **save_kwargs)

    result.dest_bytes = dest.stat().st_size
    return result


def collect_conversions(
    assets_dirs: list[Path],
    *,
    quality: int,
    dry_run: bool,
) -> RunReport:
    report = RunReport()
    public_root = ROOT / "public"

    for assets_dir in assets_dirs:
        if not assets_dir.exists():
            print(f"Aviso: pasta não encontrada: {assets_dir}", file=sys.stderr)
            continue

        for source in sorted(assets_dir.rglob("*")):
            if not source.is_file():
                continue
            ext = source.suffix.lower()
            if ext in SKIP_EXTENSIONS or ext not in SOURCE_EXTENSIONS:
                continue

            dest = source.with_suffix(".webp")
            result = convert_image(source, dest, quality=quality, dry_run=dry_run)
            if result.skipped_reason:
                report.skipped.append(result)
            else:
                report.converted.append(result)

    return report


def build_replacement_map(report: RunReport, public_root: Path) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for item in report.converted:
        old_url = public_url_for(item.source, public_root)
        new_url = public_url_for(item.dest, public_root)
        mapping[old_url] = new_url
        # Também mapear só o nome do ficheiro (usado em trilhaAssets.ts etc.)
        mapping[item.source.name] = item.dest.name
    return mapping


def iter_reference_files() -> list[Path]:
    files: list[Path] = []
    for ref_dir in REFERENCE_DIRS:
        if not ref_dir.exists():
            continue
        for path in ref_dir.rglob("*"):
            if not path.is_file():
                continue
            if any(part in REFERENCE_IGNORE_PARTS for part in path.parts):
                continue
            if path.suffix.lower() in {".ts", ".tsx", ".json", ".css", ".html", ".md", ".py"}:
                files.append(path)
    for path in REFERENCE_FILES:
        if path.exists():
            files.append(path)
    return sorted(set(files))


def update_references(
    mapping: dict[str, str],
    *,
    dry_run: bool,
) -> tuple[list[Path], int]:
    if not mapping:
        return [], 0

    # Ordenar URLs completas antes de nomes de ficheiro (evita substituições parciais)
    full_urls = sorted((k, v) for k, v in mapping.items() if k.startswith("/"))
    filenames = sorted((k, v) for k, v in mapping.items() if not k.startswith("/"))

    updated_files: list[Path] = []
    total_replacements = 0

    for path in iter_reference_files():
        text = path.read_text(encoding="utf-8")
        original = text
        replacements = 0

        for old, new in full_urls:
            count = text.count(old)
            if count:
                text = text.replace(old, new)
                replacements += count

        for old, new in filenames:
            count = text.count(old)
            if count:
                text = text.replace(old, new)
                replacements += count

        if replacements and text != original:
            total_replacements += replacements
            updated_files.append(path)
            if not dry_run:
                path.write_text(text, encoding="utf-8")

    return updated_files, total_replacements


def delete_originals(report: RunReport, *, dry_run: bool) -> int:
    deleted = 0
    for item in report.converted:
        if item.skipped_reason:
            continue
        if not dry_run:
            item.source.unlink(missing_ok=True)
        deleted += 1
    return deleted


def verify_asset_references(public_root: Path) -> list[str]:
    """Referências /assets/... ou /trilha-de-aprendizado/... que apontam para ficheiros inexistentes."""
    broken: list[str] = []
    pattern = re.compile(r'["\'](/(?:assets|trilha-de-aprendizado)/[^"\']+)["\']')
    for path in iter_reference_files():
        text = path.read_text(encoding="utf-8")
        for match in pattern.finditer(text):
            url = match.group(1)
            rel = url.lstrip("/")
            file_path = public_root / rel.replace("/", "\\") if sys.platform == "win32" else public_root / rel
            if not file_path.exists():
                broken.append(f"{path.relative_to(ROOT)} -> {url}")
    return broken


def print_report(
    report: RunReport,
    *,
    dry_run: bool,
    deleted_count: int,
) -> None:
    converted_bytes_before = sum(r.source_bytes for r in report.converted)
    converted_bytes_after = sum(r.dest_bytes for r in report.converted)
    saved = converted_bytes_before - converted_bytes_after
    pct = (saved / converted_bytes_before * 100) if converted_bytes_before else 0

    mode = "DRY-RUN" if dry_run else "APLICADO"
    print(f"\n=== convert-assets-to-webp ({mode}) ===")
    print(f"Convertidos:  {len(report.converted)}")
    print(f"Ignorados:    {len(report.skipped)}")
    if report.converted:
        print(
            f"Tamanho:      {converted_bytes_before / 1024 / 1024:.2f} MB -> "
            f"{converted_bytes_after / 1024 / 1024:.2f} MB "
            f"({pct:.1f}% economia)"
        )
    print(f"Referências:  {report.reference_replacements} substituições em {len(report.reference_files_updated)} ficheiros")
    if not dry_run:
        print(f"Originais removidos: {deleted_count}")
    if report.broken_refs:
        print(f"\nAviso: {len(report.broken_refs)} referências quebradas (pré-existentes ou novas):")
        for line in report.broken_refs[:20]:
            print(f"  - {line}")
        if len(report.broken_refs) > 20:
            print(f"  ... e mais {len(report.broken_refs) - 20}")

    if report.converted and dry_run:
        print("\nAmostra (primeiros 5):")
        for item in report.converted[:5]:
            old_kb = item.source_bytes / 1024
            new_kb = item.dest_bytes / 1024
            rel = item.source.relative_to(ROOT)
            print(f"  {rel}  {old_kb:.1f} KB -> {new_kb:.1f} KB")


def main() -> int:
    parser = argparse.ArgumentParser(description="Converte PNG/JPG em public/assets para WebP.")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem escrever ficheiros")
    parser.add_argument("--write", action="store_true", help="Aplica conversão e atualiza referências")
    parser.add_argument(
        "--delete-originals",
        action="store_true",
        help="Remove PNG/JPG após conversão bem-sucedida (requer --write)",
    )
    parser.add_argument(
        "--include-trilha",
        action="store_true",
        help="Inclui public/trilha-de-aprendizado (screenshots Notion)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=90,
        help="Qualidade WebP para RGB/RGBA (default: 90)",
    )
    args = parser.parse_args()

    if not args.dry_run and not args.write:
        parser.error("Indique --dry-run ou --write")
    if args.delete_originals and not args.write:
        parser.error("--delete-originals requer --write")

    assets_dirs = [DEFAULT_ASSETS_DIR]
    if args.include_trilha:
        assets_dirs.append(DEFAULT_TRILHA_DIR)

    dry_run = args.dry_run
    report = collect_conversions(assets_dirs, quality=args.quality, dry_run=dry_run)

    mapping = build_replacement_map(report, ROOT / "public")
    updated_files, replacements = update_references(mapping, dry_run=dry_run)
    report.reference_files_updated = updated_files
    report.reference_replacements = replacements

    deleted = 0
    if args.delete_originals:
        deleted = delete_originals(report, dry_run=dry_run)

    if args.write and not dry_run:
        report.broken_refs = verify_asset_references(ROOT / "public")

    print_report(report, dry_run=dry_run, deleted_count=deleted)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
