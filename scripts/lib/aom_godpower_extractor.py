from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from aom_string_table import parse_string_table
from aom_unit_extractor import ensure_bar_extracted, icon_token_from_path

GODPOWER_FILES = (
    "greek.godpowers",
    "egyptian.godpowers",
    "norse.godpowers",
    "atlantean.godpowers",
    "chinese.godpowers",
    "japanese.godpowers",
    "aztec.godpowers",
    "shared.godpowers",
    "spc.godpowers",
    "aotg.godpowers",
)

GODPOWER_ICON_TOKEN_OVERRIDES = {
    # Alguns caminhos internos do jogo não correspondem aos nomes dos assets públicos.
    "aomr_lure_icon": "aomr_lure_power_icon",
    "aomr_sentinel_icon": "aomr_sentinel_power_icon",
    "aomr_the_peach_blossom_spring_power_icon": "aomr_peachblossomspring_power",
    "aomr_creation_icon": "aomr_creation",
    "aomr_prosperous_seeds_icon": "aomr_prosperous_seeds",
    "aomr_gullinbursti_icon_age1_png_icon": "aomr_gullinbursti_icon",
    "aomr_solar_shield_icon": "aomr_solar_shield",
    "aomr_new_moon_icon": "aomr_new_moon",
    "aomr_kusanagi_icon": "aomr_kusanagi",
    "aomr_citadel_icon": "aomr_citadel_power_icon",
    "aomr_son_of_osiris_icon": "aomr_son_of_osiris_power_icon",
    "aomr_healing_spring_icon": "aomr_healing_spring_power_icon",
    "aomr_walking_woods_icon": "aomr_walking_woods_power_icon",
    "aomr_carnivora_icon": "aomr_carnivora_power_icon",
    "aomr_tartarian_gate_icon": "aomr_tartarian_gate_power_icon",
    "aomr_vanish_icon": "aomr_vanish",
    "aomr_lightning_weapons_icon": "aomr_lightning_weapons",
    "aomr_earth_wall_power_icon": "aomr_earth_wall_power",
    "aomr_forest_protection_icon": "aomr_forest_protection",
    "aomr_drought_land_icon": "aomr_drought",
    "aomr_venom_beast_icon": "aomr_fei_beasts",
    "aomr_great_flood_icon": "aomr_great_flood",
    "aomr_yinglongs_wrath_icon": "aomr_yinglongs_wrath",
    "aomr_blazing_prairie_png_icon": "aomr_blazing_prairie",
    "aomr_goshinboku_icon": "aomr_goshinboku_tree_icon",
}


def godpower_icon_token(icon_path: str) -> str:
    token = icon_token_from_path(icon_path)
    return GODPOWER_ICON_TOKEN_OVERRIDES.get(token, token)


def _text(node: ET.Element | None, tag: str, default: str = "") -> str:
    if node is None:
        return default
    child = node.find(tag)
    if child is None or child.text is None:
        return default
    return child.text.strip()


def _float(value: str | None, default: float = 0.0) -> float:
    if not value:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def is_player_godpower(power: ET.Element) -> bool:
    return power.get("godpower") is not None


def parse_all_powers(cache_dir: Path) -> dict[str, ET.Element]:
    powers: dict[str, ET.Element] = {}
    gp_dir = cache_dir / "gameplay" / "god_powers"
    for filename in GODPOWER_FILES:
        path = gp_dir / filename
        if not path.exists():
            continue
        for power in ET.parse(path).getroot().findall("power"):
            name = power.get("name")
            if not name or not is_player_godpower(power):
                continue
            powers.setdefault(name, power)
    return powers


def parse_power_cooldowns(techtree_path: Path) -> dict[str, int]:
    cooldowns: dict[str, float] = {}
    for tech in ET.parse(techtree_path).getroot().findall("tech"):
        for effect in tech.findall("./effects/effect"):
            if effect.get("subtype") != "GodPower":
                continue
            power = effect.get("power")
            cooldown = effect.get("cooldown")
            if not power or not cooldown:
                continue
            value = _float(cooldown)
            if power not in cooldowns or value < cooldowns[power]:
                cooldowns[power] = value
    return {name: int(round(value)) for name, value in cooldowns.items()}


def format_repeat_cost(value: float) -> str:
    amount = int(round(value))
    return f"+{amount}"


def parse_active_time(power: ET.Element) -> int:
    raw = _text(power, "activetime")
    if not raw:
        return 0
    value = _float(raw)
    if value < 0:
        return 0
    return int(round(value))


def lookup_power_strings(
    power: ET.Element,
    *,
    strings_en: dict[str, str],
    strings_pt: dict[str, str],
) -> tuple[str, str, str, str]:
    display_id = _text(power, "displaynameid")
    rollover_id = _text(power, "rolloverid")
    nome_pt = strings_pt.get(display_id, strings_en.get(display_id, ""))
    nome_en = strings_en.get(display_id, "")
    desc_pt = strings_pt.get(rollover_id, strings_en.get(rollover_id, ""))
    desc_en = strings_en.get(rollover_id, "")
    return nome_pt, nome_en, desc_pt, desc_en


def extract_power_record(
    power_name: str,
    power: ET.Element,
    *,
    strings_en: dict[str, str],
    strings_pt: dict[str, str],
    cooldowns: dict[str, int],
) -> dict[str, Any]:
    nome_pt, nome_en, desc_pt, desc_en = lookup_power_strings(
        power,
        strings_en=strings_en,
        strings_pt=strings_pt,
    )
    repeat_cost = _float(_text(power, "repeatcost"))
    record: dict[str, Any] = {
        "proto_name": power_name,
        "nome": nome_pt or power_name,
        "ingles": nome_en or power_name,
        "descricao_resumida_pt": desc_pt,
        "descricao_resumida_en": desc_en,
        "icon": godpower_icon_token(_text(power, "icon")),
        "duracao_no_mapa_seg": parse_active_time(power),
        "incremento_por_uso": format_repeat_cost(repeat_cost) if repeat_cost else None,
    }
    cost = _float(_text(power, "cost"))
    if cost:
        record["custo_repetir"] = int(round(cost))
    if power_name in cooldowns:
        record["cooldown_seg"] = cooldowns[power_name]
    return record


def extract_godpowers(
    cache_dir: Path,
    *,
    only_power: str | None = None,
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
    powers = parse_all_powers(cache_dir)
    cooldowns = parse_power_cooldowns(techtree_path)

    records: list[dict[str, Any]] = []
    for power_name, power in sorted(powers.items()):
        if only_power and power_name.lower() != only_power.lower():
            continue
        records.append(
            extract_power_record(
                power_name,
                power,
                strings_en=strings_en,
                strings_pt=strings_pt,
                cooldowns=cooldowns,
            )
        )
    return records
