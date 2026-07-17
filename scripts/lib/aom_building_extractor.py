from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from aom_proto_maps import ARMOR_TYPE_FIELD, DAMAGE_TYPE_FIELD, PANTHEON_FROM_PATH
from aom_string_table import parse_string_table
from aom_unit_extractor import (
    _float,
    _text,
    ensure_bar_extracted,
    icon_token_from_path,
    parse_armor,
    parse_attack,
    parse_costs,
)

PANTHEON_ID_TO_CULTURE = {
    1: "greek",
    2: "egyptian",
    3: "norse",
    4: "atlantean",
    5: "chinese",
    6: "japanese",
    7: "aztec",
}

CULTURE_TO_PANTHEON_ID = {culture: pid for pid, culture in PANTHEON_ID_TO_CULTURE.items()}

BUILDING_ICON_TOKEN_OVERRIDES = {
    # Alguns caminhos internos do jogo não correspondem aos nomes dos assets públicos.
    "aomr_town_center_chinese_icon": "aomr_town_center_chinese",
    "aomr_silo_icon": "aomr_silo",
    "aomr_counter_barracks_icon": "aomr_counter-barracks_icon",
    "aomr_imperial_academy_icon": "aomr_imperial_academy",
    "aomr_machine_workshop_icon": "aomr_machine_workshop",
    "aomr_nobles_hut_icon": "aomr_noble_hut_icon",
    "aomr_baolei_icon": "aomr_baolei",
    "aomr_shrine_greek_icon": "aomr_shrine_icon",
}


def is_building_unit(unit: ET.Element) -> bool:
    unit_types = {node.text.strip() for node in unit.findall("unittype") if node.text}
    return bool(unit_types & {"Building", "AbstractWall"})


def parse_proto_buildings(proto_path: Path) -> dict[str, ET.Element]:
    root = ET.parse(proto_path).getroot()
    buildings: dict[str, ET.Element] = {}
    for unit in root.findall("unit"):
        name = unit.get("name")
        if name and is_building_unit(unit):
            buildings[name] = unit
    return buildings


def parse_building_attack(unit: ET.Element) -> dict[str, Any]:
    attack = parse_attack(unit)
    for action in unit.findall("protoaction"):
        action_name = _text(action, "name")
        if action_name not in {"HandAttack", "RangedAttack", "SiegeAttack", "ShipAttack"}:
            continue
        projectiles = action.findtext("displayednumberprojectiles")
        if projectiles:
            attack["displayednumberprojectiles"] = int(round(_float(projectiles)))
        break
    return attack


def icon_for_culture(unit: ET.Element, culture: str | None) -> str:
    def resolve(icon_path: str) -> str:
        token = icon_token_from_path(icon_path)
        return BUILDING_ICON_TOKEN_OVERRIDES.get(token, token)

    if culture:
        for icon_node in unit.findall("icon"):
            if icon_node.get("culture") == culture and icon_node.text:
                return resolve(icon_node.text.strip())
    for icon_node in unit.findall("icon"):
        if icon_node.text and not icon_node.get("culture"):
            return resolve(icon_node.text.strip())
    if unit.find("icon") is not None and unit.find("icon").text:
        return resolve(unit.find("icon").text.strip())
    return ""


def build_icon_variants(unit: ET.Element) -> tuple[dict[int, str], str]:
    variants: dict[int, str] = {}
    for pantheon_id, culture in PANTHEON_ID_TO_CULTURE.items():
        token = icon_for_culture(unit, culture)
        if token:
            variants[pantheon_id] = token
    default = icon_for_culture(unit, None)
    if not default and variants:
        default = next(iter(variants.values()))
    pantheon = detect_building_pantheon(unit)
    if pantheon and pantheon["id"] in variants:
        default = variants[pantheon["id"]]
    return variants, default


def detect_building_pantheon(unit: ET.Element) -> dict[str, Any] | None:
    for field in ("icon", "animfile", "soundsetfile"):
        raw = _text(unit, field).lower().replace("/", "\\")
        if not raw:
            for child in unit.findall(field):
                raw = (child.text or "").lower().replace("/", "\\")
                if raw:
                    break
        for key, meta in PANTHEON_FROM_PATH.items():
            if f"\\{key}\\" in raw or raw.startswith(f"{key}\\"):
                return meta
    for animfile in unit.findall("animfile"):
        raw = (animfile.text or "").lower().replace("/", "\\")
        culture = animfile.get("culture")
        if culture and culture in CULTURE_TO_PANTHEON_ID:
            meta = PANTHEON_FROM_PATH.get(culture)
            if meta:
                return meta
    return None


def extract_building_record(
    name: str,
    unit: ET.Element,
    *,
    strings_en: dict[str, str],
    strings_pt: dict[str, str],
) -> dict[str, Any]:
    attack = parse_building_attack(unit)
    costs = parse_costs(unit)
    armor = parse_armor(unit)
    hp = _float(_text(unit, "maxhitpoints"))
    build_time = _float(_text(unit, "buildpoints"))
    garrison = int(round(_float(_text(unit, "maxcontained"))))

    rof = attack.get("rof", 0.0)
    primary_damage = 0.0
    primary_field = ""
    for dtype, amount in attack.get("damages", {}).items():
        field = DAMAGE_TYPE_FIELD.get(dtype)
        if field and amount > 0:
            primary_damage = amount
            primary_field = field
            break
    dps = round(primary_damage * rof, 4) if rof else 0.0

    display_id = _text(unit, "displaynameid")
    icon_variants, icon_default = build_icon_variants(unit)

    record: dict[str, Any] = {
        "proto_name": name,
        "nome_pt": strings_pt.get(display_id, name),
        "nome_en": strings_en.get(display_id, name),
        "pontos_de_vida": int(hp) if hp.is_integer() else hp,
        "tempo_construir_segundos": int(round(build_time)),
        "icon_variants": icon_variants,
        "icon_default": icon_default,
    }

    if garrison > 0:
        record["guarnicao"] = garrison

    for resource in ("madeira", "ouro", "comida"):
        value = costs[resource]
        if value > 0:
            record[resource] = int(value) if float(value).is_integer() else value

    total_cost = sum(costs[r] for r in ("comida", "madeira", "ouro"))
    if total_cost > 0:
        record["custo"] = int(total_cost) if float(total_cost).is_integer() else total_cost

    if primary_field:
        record[primary_field] = primary_damage
    if attack.get("maxrange"):
        record["alcance"] = attack["maxrange"]
    if rof:
        record["velocidade_de_ataque_atk_s"] = rof
    if dps:
        record["dps"] = dps
    if attack.get("displayednumberprojectiles"):
        record["no_projeteis"] = attack["displayednumberprojectiles"]

    record.update(armor)
    return record


def extract_buildings(
    cache_dir: Path,
    *,
    only_building: str | None = None,
) -> list[dict[str, Any]]:
    proto_path = cache_dir / "gameplay" / "proto.xml"
    strings_en_path = cache_dir / "strings" / "English" / "string_table.txt"
    strings_pt_path = cache_dir / "strings" / "PortugueseBrazil" / "string_table.txt"

    for required in (proto_path, strings_en_path, strings_pt_path):
        if not required.exists():
            raise FileNotFoundError(
                f"Arquivo ausente: {required}. Rode a extração do Data.bar primeiro."
            )

    strings_en = parse_string_table(strings_en_path)
    strings_pt = parse_string_table(strings_pt_path)
    buildings = parse_proto_buildings(proto_path)

    records: list[dict[str, Any]] = []
    for name, unit in sorted(buildings.items()):
        if only_building and name.lower() != only_building.lower():
            continue
        records.append(
            extract_building_record(
                name,
                unit,
                strings_en=strings_en,
                strings_pt=strings_pt,
            )
        )
    return records


def resolve_building_icon(extracted: dict[str, Any], pantheon_id: int | None) -> str:
    variants = extracted.get("icon_variants") or {}
    if pantheon_id is not None and pantheon_id in variants:
        return variants[pantheon_id]
    return extracted.get("icon_default", "")
