from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from aom_game_paths import DEFAULT_CRYBAR, DEFAULT_GAME_DIR, UI_TEXTURE_CACHE_BAR, resolve_game_dir
from aom_unit_extractor import icon_token_from_path

ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = ROOT / "public" / "assets" / "relics"
TOKEN_MAP_PATH = ROOT / "src" / "data" / "token_asset_map.json"


def token_to_asset_filename(token: str) -> str:
    stem = token.replace("aomr_", "").replace("_icon", "")
    parts = [part for part in stem.split("_") if part]
    return "AoMR_" + "_".join(part.capitalize() for part in parts) + "_icon.png"


def token_to_public_url(token: str) -> str:
    return f"/assets/relics/{token_to_asset_filename(token)}"


def icon_path_to_dds_entry(icon_path: str) -> str:
    normalized = icon_path.replace("\\", "/")
    if normalized.lower().endswith(".png"):
        normalized = normalized[:-4] + ".dds"
    elif not normalized.lower().endswith(".dds"):
        normalized = f"{normalized}.dds"
    return normalized


def collect_icon_tokens(extracted_rows: list[dict[str, Any]]) -> dict[str, str]:
    tokens: dict[str, str] = {}
    for row in extracted_rows:
        icon_path = row.get("icon_path")
        token = row.get("icon")
        if icon_path and token:
            tokens[token] = icon_path
    return tokens


def update_token_asset_map(
    tokens: dict[str, str],
    *,
    dry_run: bool = False,
) -> list[tuple[str, str]]:
    mapping: dict[str, str] = {}
    if TOKEN_MAP_PATH.exists():
        mapping = json.loads(TOKEN_MAP_PATH.read_text(encoding="utf-8"))

    changes: list[tuple[str, str]] = []
    for token in sorted(tokens):
        url = token_to_public_url(token)
        if mapping.get(token) != url:
            changes.append((token, url))
            mapping[token] = url

    if changes and not dry_run:
        TOKEN_MAP_PATH.write_text(
            json.dumps(mapping, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return changes


def sync_relic_icons(
    extracted_rows: list[dict[str, Any]],
    *,
    game_dir: Path,
    crybar_exe: Path,
    dry_run: bool = False,
) -> dict[str, Any]:
    tokens = collect_icon_tokens(extracted_rows)
    texture_bar = game_dir / UI_TEXTURE_CACHE_BAR
    if not texture_bar.exists():
        raise FileNotFoundError(f"UITextureCache.bar não encontrado em {texture_bar}")
    if not crybar_exe.exists():
        raise FileNotFoundError(f"crybar.exe não encontrado em {crybar_exe}")

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    exported: list[str] = []
    skipped: list[str] = []
    missing: list[str] = []

    for token, icon_path in sorted(tokens.items()):
        asset_name = token_to_asset_filename(token)
        dest_png = ASSETS_DIR / asset_name
        if dest_png.exists():
            skipped.append(asset_name)
            continue

        dds_entry = icon_path_to_dds_entry(icon_path)
        if dry_run:
            exported.append(asset_name)
            continue

        temp_dir = ROOT / "tools" / ".relic-icon-export"
        if temp_dir.exists():
            for child in temp_dir.rglob("*"):
                if child.is_file():
                    child.unlink()
        temp_dir.mkdir(parents=True, exist_ok=True)

        export_cmd = [
            str(crybar_exe),
            "bar",
            "export",
            str(texture_bar),
            dds_entry,
            "-o",
            str(temp_dir),
            "--decompress",
        ]
        result = subprocess.run(export_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            missing.append(dds_entry)
            continue

        dds_files = list(temp_dir.rglob("*.dds"))
        if not dds_files:
            missing.append(dds_entry)
            continue

        convert_cmd = [
            str(crybar_exe),
            "convert",
            "dds-to-png",
            str(dds_files[0]),
        ]
        convert_result = subprocess.run(convert_cmd, capture_output=True, text=True)
        if convert_result.returncode != 0:
            missing.append(dds_entry)
            continue

        png_files = list(dds_files[0].parent.glob("*.png"))
        if not png_files:
            missing.append(dds_entry)
            continue

        png_files[0].replace(dest_png)
        exported.append(asset_name)

    map_changes = update_token_asset_map(tokens, dry_run=dry_run)
    return {
        "assets_dir": str(ASSETS_DIR),
        "total_tokens": len(tokens),
        "exported": exported,
        "skipped": skipped,
        "missing": missing,
        "map_changes": map_changes,
    }


def icon_token_from_game_path(icon_path: str) -> str:
    return icon_token_from_path(icon_path)
