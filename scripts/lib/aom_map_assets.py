from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any

from aom_game_paths import UI_TEXTURE_CACHE_BAR
from aom_relic_icons import png_to_webp

ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = ROOT / "public" / "assets" / "maps"
PREVIEWS_DIR = ASSETS_DIR / "previews"
TOKEN_MAP_PATH = ROOT / "src" / "data" / "token_asset_map.json"


def _dds_entry(path: str) -> str:
    normalized = path.replace("\\", "/")
    return str(Path(normalized).with_suffix(".dds")).replace("\\", "/")


def _update_token_asset_map(
    rows: list[dict[str, Any]],
    *,
    dry_run: bool,
) -> list[tuple[str, str]]:
    mapping: dict[str, str] = {}
    if TOKEN_MAP_PATH.exists():
        mapping = json.loads(TOKEN_MAP_PATH.read_text(encoding="utf-8"))

    changes: list[tuple[str, str]] = []
    for row in rows:
        token = row["icon"]
        url = f"/assets/maps/{row['asset_stem']}.webp"
        if mapping.get(token) != url:
            mapping[token] = url
            changes.append((token, url))

    if changes and not dry_run:
        TOKEN_MAP_PATH.write_text(
            json.dumps(mapping, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return changes


def _export_texture(
    *,
    texture_bar: Path,
    crybar_exe: Path,
    entry: str,
    destination: Path,
    temp_dir: Path,
) -> bool:
    shutil.rmtree(temp_dir, ignore_errors=True)
    temp_dir.mkdir(parents=True, exist_ok=True)

    export = subprocess.run(
        [
            str(crybar_exe),
            "bar",
            "export",
            str(texture_bar),
            entry,
            "-o",
            str(temp_dir),
            "--decompress",
        ],
        capture_output=True,
        text=True,
    )
    if export.returncode != 0:
        return False

    dds_files = list(temp_dir.rglob("*.dds"))
    if not dds_files:
        return False
    dds = dds_files[0]

    convert = subprocess.run(
        [str(crybar_exe), "convert", "dds-to-png", str(dds)],
        capture_output=True,
        text=True,
    )
    if convert.returncode != 0:
        return False

    png_files = list(dds.parent.glob("*.png"))
    if not png_files:
        return False
    destination.parent.mkdir(parents=True, exist_ok=True)
    png_to_webp(png_files[0], destination)
    return True


def sync_map_assets(
    rows: list[dict[str, Any]],
    *,
    game_dir: Path,
    crybar_exe: Path,
    dry_run: bool,
) -> dict[str, Any]:
    texture_bar = game_dir / UI_TEXTURE_CACHE_BAR
    if not texture_bar.exists():
        raise FileNotFoundError(f"UITextureCache.bar não encontrado em {texture_bar}")
    if not crybar_exe.exists():
        raise FileNotFoundError(f"crybar.exe não encontrado em {crybar_exe}")

    exported: list[str] = []
    skipped: list[str] = []
    missing: list[str] = []
    temp_dir = ROOT / "tools" / ".map-asset-export"

    for row in rows:
        sources = (
            (row.get("image_path"), ASSETS_DIR / f"{row['asset_stem']}.webp"),
            (
                row.get("preview_path"),
                PREVIEWS_DIR / f"{row['asset_stem']}.webp",
            ),
        )
        for source, destination in sources:
            relative = destination.relative_to(ROOT).as_posix()
            if destination.exists():
                skipped.append(relative)
                continue
            if not source:
                missing.append(f"{row['map_id']}: caminho ausente")
                continue
            if dry_run:
                exported.append(relative)
                continue
            if _export_texture(
                texture_bar=texture_bar,
                crybar_exe=crybar_exe,
                entry=_dds_entry(source),
                destination=destination,
                temp_dir=temp_dir,
            ):
                exported.append(relative)
            else:
                missing.append(_dds_entry(source))

    if not dry_run:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return {
        "assets_dir": str(ASSETS_DIR),
        "exported": exported,
        "skipped": skipped,
        "missing": missing,
        "map_changes": _update_token_asset_map(rows, dry_run=dry_run),
    }
