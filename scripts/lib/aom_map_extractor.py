from __future__ import annotations

import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from aom_game_paths import RANDOM_MAPS_DIR
from aom_string_table import parse_string_table

SET_FILES = {
    "all": "randommaps.set",
    "land": "landmaps.set",
    "water": "watermaps.set",
    "standard": "standardmaps.set",
    "quick": "quickmatchmaps.set",
}

# "Origem" é metadado editorial e não existe nos XMLs do jogo. Estes valores
# cobrem mapas sem entrada anterior no catálogo; entradas existentes são preservadas.
ORIGIN_OVERRIDES = {
    "land_unknown": "AoM: Original (2002)",
    "the_unknown": "AoM: Original (2002)",
    "tenochtitlans_heart": "AoM: Obsidian Mirror (2026)",
}

# Alguns IDs internos diferem do nome usado pelas texturas e/ou string table.
MAP_ASSET_STEM_OVERRIDES = {
    "blood_river": "blood_river_crossing",
    "jaguar_moon": "temple_of_the_jaguar",
    "sun_serpent_valley": "valley_of_the_sun_serpent",
}
MAP_STRING_STEM_OVERRIDES = {
    "sun_serpent_valley": "sun_serpent",
}
MAP_TYPE_OVERRIDES = {
    "tenochtitlans_heart": "Naval 🌊",
}

SPECIAL_MAP_IDS = {"land_unknown", "the_unknown"}


def _parse_xml(
    source: Path,
    *,
    cache_dir: Path,
    crybar_exe: Path,
) -> ET.Element:
    try:
        return ET.parse(source).getroot()
    except ET.ParseError:
        if not crybar_exe.exists():
            raise FileNotFoundError(f"crybar.exe não encontrado em {crybar_exe}")

        with tempfile.TemporaryDirectory(prefix=".map-info-", dir=cache_dir) as temp:
            output_dir = Path(temp)
            decompressed = output_dir / f"{source.stem}.xmb"
            output_xml = output_dir / source.name
            result = subprocess.run(
                [
                    str(crybar_exe),
                    "decompress",
                    str(source),
                    "-o",
                    str(decompressed),
                    "--quiet",
                ],
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                detail = result.stderr.strip() or result.stdout.strip()
                raise RuntimeError(f"Falha ao descompactar {source}: {detail}")
            try:
                return ET.parse(decompressed).getroot()
            except ET.ParseError:
                convert = subprocess.run(
                    [
                        str(crybar_exe),
                        "convert",
                        "xmb-to-xml",
                        str(decompressed),
                        "-o",
                        str(output_xml),
                        "--quiet",
                    ],
                    capture_output=True,
                    text=True,
                )
                if convert.returncode != 0:
                    detail = convert.stderr.strip() or convert.stdout.strip()
                    raise RuntimeError(f"Falha ao converter XMB {source}: {detail}")
                return ET.parse(output_xml).getroot()


def _read_map_set(
    path: Path,
    *,
    cache_dir: Path,
    crybar_exe: Path,
) -> list[str]:
    root = _parse_xml(path, cache_dir=cache_dir, crybar_exe=crybar_exe)
    return [
        (node.text or "").strip()
        for node in root.findall("map")
        if (node.text or "").strip()
    ]


def _normalized_asset_path(value: str | None) -> str:
    return (value or "").replace("\\", "/")


def _asset_stem(value: str, fallback: str) -> str:
    return Path(value).stem if value else fallback


def _map_type(map_id: str, sets: dict[str, list[str]]) -> str:
    if map_id in MAP_TYPE_OVERRIDES:
        return MAP_TYPE_OVERRIDES[map_id]
    is_land = map_id in sets["land"]
    is_water = map_id in sets["water"]
    if is_land and not is_water:
        return "Terra 🌳"
    if is_water and not is_land:
        return "Naval 🌊"
    return "Naval 🌊, Terra 🌳"


def extract_maps(
    *,
    game_dir: Path,
    cache_dir: Path,
    crybar_exe: Path,
) -> list[dict[str, Any]]:
    random_maps_dir = game_dir / RANDOM_MAPS_DIR
    if not random_maps_dir.exists():
        raise FileNotFoundError(f"Pasta de mapas não encontrada em {random_maps_dir}")

    sets = {
        key: _read_map_set(
            random_maps_dir / filename,
            cache_dir=cache_dir,
            crybar_exe=crybar_exe,
        )
        for key, filename in SET_FILES.items()
    }

    strings_en = parse_string_table(cache_dir / "strings" / "English" / "string_table.txt")
    strings_pt = parse_string_table(
        cache_dir / "strings" / "PortugueseBrazil" / "string_table.txt"
    )

    rows: list[dict[str, Any]] = []
    for map_id in sets["all"]:
        source = random_maps_dir / f"{map_id}.xml"
        if not source.exists():
            continue
        try:
            attrs = _parse_xml(
                source,
                cache_dir=cache_dir,
                crybar_exe=crybar_exe,
            ).attrib
        except (ET.ParseError, RuntimeError):
            # DLCs recentes podem instalar mapinfo binário/empacotado com extensão
            # .xml que versões atuais do CryBar ainda não decodificam.
            string_stem = MAP_STRING_STEM_OVERRIDES.get(map_id, map_id).upper()
            asset_stem = MAP_ASSET_STEM_OVERRIDES.get(map_id, map_id)
            attrs = {
                "displayNameID": f"STR_MAP_{string_stem}_NAME",
                "details": f"STR_MAP_{string_stem}_DESC",
                "loadDetails": f"STR_MAP_{string_stem}_DESC_LOAD",
                "imagepath": f"resources/maps/map_picker/{asset_stem}.png",
                "loadBackground": f"resources/maps/previews/{asset_stem}.png",
            }
        name_id = attrs.get("displayNameID", "")
        description_id = attrs.get("details", "")
        load_description_id = attrs.get("loadDetails", "")
        icon_path = _normalized_asset_path(attrs.get("imagepath"))
        preview_path = _normalized_asset_path(attrs.get("loadBackground"))
        asset_stem = _asset_stem(icon_path, map_id)

        rows.append(
            {
                "map_id": map_id,
                "nome_en": strings_en.get(name_id, map_id.replace("_", " ").title()),
                "nome_pt": strings_pt.get(
                    name_id,
                    strings_en.get(name_id, map_id.replace("_", " ").title()),
                ),
                "descricao_en": strings_en.get(description_id, ""),
                "descricao_pt": strings_pt.get(
                    description_id, strings_en.get(description_id, "")
                ),
                "descricao_detalhada_en": strings_en.get(load_description_id, ""),
                "descricao_detalhada_pt": strings_pt.get(
                    load_description_id, strings_en.get(load_description_id, "")
                ),
                "image_path": icon_path,
                "preview_path": preview_path,
                "asset_stem": asset_stem,
                "icon": f"aomr_{asset_stem}_icon",
                "tipo": _map_type(map_id, sets),
                "padrao": map_id in sets["standard"],
                "partidas_rapidas": map_id in sets["quick"],
                # O jogo chama este mesmo pool de "Standard/Ranked Map Set".
                "mapas_da_ranqueada": map_id in sets["standard"],
                "origem_padrao": ORIGIN_OVERRIDES.get(map_id, ""),
            }
        )
    return rows
