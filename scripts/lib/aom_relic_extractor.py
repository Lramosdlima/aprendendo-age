from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from aom_relic_effects import format_relic_effects_both
from aom_string_table import parse_string_table
from aom_unit_extractor import ensure_bar_extracted, icon_token_from_path

SKIP_PROTO_SUBSTRINGS = ("Respawn",)


def _text(node: ET.Element | None, tag: str, default: str = "") -> str:
    if node is None:
        return default
    child = node.find(tag)
    if child is None or child.text is None:
        return default
    return child.text.strip()


def is_exportable_relic(tech: ET.Element) -> bool:
    name = tech.get("name", "")
    if not name.startswith("Relic"):
        return False
    if tech.get("type") != "Normal":
        return False
    if any(part in name for part in SKIP_PROTO_SUBSTRINGS):
        return False
    return bool(_text(tech, "displaynameid"))


def parse_relic_techs(techtree_path: Path) -> dict[str, ET.Element]:
    tree = ET.parse(techtree_path)
    return {
        tech.get("name"): tech
        for tech in tree.getroot().findall("tech")
        if tech.get("name") and is_exportable_relic(tech)
    }


def lookup_relic_strings(
    tech: ET.Element,
    *,
    strings_en: dict[str, str],
    strings_pt: dict[str, str],
) -> tuple[str, str, str, str, str, str]:
    display_id = _text(tech, "displaynameid")
    rollover_id = _text(tech, "rollovertextid")
    self_id = display_id.replace("_NAME", "_SELF") if display_id.endswith("_NAME") else ""

    nome_pt = strings_pt.get(display_id, strings_en.get(display_id, ""))
    nome_en = strings_en.get(display_id, "")
    desc_pt = strings_pt.get(rollover_id, strings_en.get(rollover_id, ""))
    desc_en = strings_en.get(rollover_id, "")
    adv_pt = strings_pt.get(self_id, strings_en.get(self_id, "")) if self_id else ""
    adv_en = strings_en.get(self_id, "") if self_id else ""
    return nome_pt, nome_en, desc_pt, desc_en, adv_pt, adv_en


def parse_all_techs(techtree_path: Path) -> dict[str, ET.Element]:
    tree = ET.parse(techtree_path)
    return {
        tech.get("name"): tech
        for tech in tree.getroot().findall("tech")
        if tech.get("name")
    }


def extract_relic_record(
    proto_name: str,
    tech: ET.Element,
    *,
    strings_en: dict[str, str],
    strings_pt: dict[str, str],
    tech_index: dict[str, ET.Element] | None = None,
) -> dict[str, Any]:
    nome_pt, nome_en, desc_pt, desc_en, _adv_pt_flavor, _adv_en_flavor = lookup_relic_strings(
        tech,
        strings_en=strings_en,
        strings_pt=strings_pt,
    )
    adv_pt, adv_en = format_relic_effects_both(tech, tech_index=tech_index)
    icon_path = _text(tech, "icon")
    record: dict[str, Any] = {
        "proto_name": proto_name,
        "nome": nome_pt or nome_en or proto_name,
        "ingles": nome_en or nome_pt or proto_name,
        "descricao_resumida_pt": desc_pt,
        "descricao_resumida_en": desc_en,
        "descricao_avancada_pt": adv_pt,
        "descricao_avancada_en": adv_en,
    }
    if icon_path:
        record["icon"] = icon_token_from_path(icon_path)
        record["icon_path"] = icon_path.replace("\\", "/")
    return record


def extract_relics(
    cache_dir: Path,
    *,
    only_relic: str | None = None,
) -> list[dict[str, Any]]:
    strings_en_path = cache_dir / "strings" / "English" / "string_table.txt"
    strings_pt_path = cache_dir / "strings" / "PortugueseBrazil" / "string_table.txt"
    techtree_path = cache_dir / "gameplay" / "techtree.xml"

    for required in (strings_en_path, strings_pt_path, techtree_path):
        if not required.exists():
            raise FileNotFoundError(
                f"Arquivo ausente: {required}. Rode a extração do Data.bar primeiro."
            )

    strings_en = parse_string_table(strings_en_path)
    strings_pt = parse_string_table(strings_pt_path)
    relics = parse_relic_techs(techtree_path)
    tech_index = parse_all_techs(techtree_path)

    records: list[dict[str, Any]] = []
    for proto_name, tech in sorted(relics.items()):
        if only_relic and proto_name.lower() != only_relic.lower():
            continue
        records.append(
            extract_relic_record(
                proto_name,
                tech,
                strings_en=strings_en,
                strings_pt=strings_pt,
                tech_index=tech_index,
            )
        )
    return records
