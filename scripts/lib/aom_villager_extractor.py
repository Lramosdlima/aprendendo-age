from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from aom_string_table import parse_string_table
from aom_unit_extractor import icon_token_from_path

# IDs editoriais de aldeoes.json associados aos protos jogáveis.
VILLAGER_PROTOS = {
    1: "VillagerGreek",
    2: "VillagerDwarf",
    3: "VillagerChinese",
    4: "VillagerAtlantean",
    5: "VillagerAtlanteanHero",
    6: "VillagerNorse",
    7: "Kuafu",
    8: "KuafuHero",
    9: "VillagerJapanese",
    10: "VillagerEgyptian",
    11: "VillagerAztec",
}

RESOURCE_FIELDS = {
    "Food": "carne",
    "Wood": "madeira",
    "Gold": "ouro",
    "Favor": "favor",
}

GATHER_FIELDS = {
    "Huntable": "cacar",
    "Herdable": "gado_galinhas",
    "WildCrops": "frutinhas",
    "AbstractFarm": "fazenda",
    "WoodResource": "arvore",
    "GoldResource": "mina",
}

PERCENT_FIELDS = {
    "cacar": "cacar_porcento",
    "gado_galinhas": "gado_porcento",
    "frutinhas": "frutinhas_porcento",
    "fazenda": "fazenda_porcento",
    "arvore": "arvore_porcento",
    "mina": "mina_porcento",
}

# O catálogo histórico expressa construção como 54 / work rate.
BUILD_RATE_DISPLAY_BASE = 54.0
GATHER_RATE_PER_MINUTE = 60.0


def _float(value: str | None, default: float = 0.0) -> float:
    if not value:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def _number(value: float, digits: int = 2) -> int | float:
    rounded = round(value, digits)
    return int(rounded) if rounded.is_integer() else rounded


def _action_rates(unit: ET.Element, action_name: str) -> dict[str, float]:
    for action in unit.findall("protoaction"):
        if action.findtext("name") != action_name:
            continue
        rates: dict[str, float] = {}
        for rate in action.findall("rate"):
            rate_type = rate.get("type")
            if rate_type and rate.get("resource") is None:
                rates[rate_type] = _float(rate.text or rate.get("value"))
        return rates
    return {}


def _build_rate(unit: ET.Element) -> float:
    rates = _action_rates(unit, "Build")
    return rates.get("Building") or rates.get("House") or 0.0


def _costs(unit: ET.Element) -> dict[str, float]:
    costs = {field: 0.0 for field in RESOURCE_FIELDS.values()}
    for cost in unit.findall("cost"):
        field = RESOURCE_FIELDS.get(cost.get("resourcetype", ""))
        if field:
            costs[field] = _float(cost.text or cost.get("value"))
    return costs


def _extract_record(
    villager_id: int,
    proto_name: str,
    unit: ET.Element,
    *,
    strings_pt: dict[str, str],
    strings_en: dict[str, str],
    reference_gather: dict[str, float],
    reference_build: float,
) -> dict[str, Any]:
    display_id = unit.findtext("displaynameid", "")
    costs = _costs(unit)
    gather_rates = _action_rates(unit, "Gather")
    build_rate = _build_rate(unit)
    herdable = gather_rates.get("Herdable")
    chickens = gather_rates.get("NonConvertableHerdable")
    if (
        herdable is not None
        and chickens is not None
        and abs(herdable - chickens) > 1e-9
    ):
        raise RuntimeError(
            f"{proto_name}: taxas de gado e galinhas divergiram "
            f"({herdable} != {chickens}); separe os campos antes de sincronizar."
        )

    record: dict[str, Any] = {
        "id": villager_id,
        "proto_name": proto_name,
        "nome_pt": strings_pt.get(display_id, proto_name),
        "nome_en": strings_en.get(display_id, proto_name),
        "recursos": _number(costs["carne"] + costs["madeira"] + costs["ouro"]),
        "vida": _number(_float(unit.findtext("maxhitpoints"))),
        "populacao": _number(_float(unit.findtext("populationcount"))),
        "tempo_de_treinamento": (
            _number(_float(unit.findtext("trainpoints")))
            if unit.find("trainpoints") is not None
            else None
        ),
        "icon_extraido": icon_token_from_path(unit.findtext("icon", "")),
        "build_rate": build_rate,
    }

    for field, amount in costs.items():
        record[field] = _number(amount)

    for rate_type, field in GATHER_FIELDS.items():
        rate = gather_rates.get(rate_type, 0.0)
        reference = reference_gather.get(rate_type, 0.0)
        record[field] = _number(rate * GATHER_RATE_PER_MINUTE)
        record[PERCENT_FIELDS[field]] = (
            _number((rate / reference - 1.0) * 100.0) if reference else 0
        )

    record["velocidade_construcao"] = (
        _number(BUILD_RATE_DISPLAY_BASE / build_rate) if build_rate else None
    )
    record["velocidade_construcao_porcento"] = (
        _number((build_rate / reference_build - 1.0) * 100.0)
        if build_rate and reference_build
        else 0
    )
    return record


def extract_villagers(cache_dir: Path) -> list[dict[str, Any]]:
    proto_path = cache_dir / "gameplay" / "proto.xml"
    strings_en_path = cache_dir / "strings" / "English" / "string_table.txt"
    strings_pt_path = cache_dir / "strings" / "PortugueseBrazil" / "string_table.txt"
    for required in (proto_path, strings_en_path, strings_pt_path):
        if not required.exists():
            raise FileNotFoundError(
                f"Arquivo ausente: {required}. Rode a extração do Data.bar primeiro."
            )

    root = ET.parse(proto_path).getroot()
    units = {
        unit.get("name", ""): unit
        for unit in root.findall("unit")
        if unit.get("name")
    }
    reference = units.get("VillagerGreek")
    if reference is None:
        raise RuntimeError("Proto de referência VillagerGreek não encontrado.")

    strings_en = parse_string_table(strings_en_path)
    strings_pt = parse_string_table(strings_pt_path)
    reference_gather = _action_rates(reference, "Gather")
    reference_build = _build_rate(reference)

    rows: list[dict[str, Any]] = []
    for villager_id, proto_name in VILLAGER_PROTOS.items():
        unit = units.get(proto_name)
        if unit is None:
            raise RuntimeError(f"Proto de aldeão não encontrado: {proto_name}")
        rows.append(
            _extract_record(
                villager_id,
                proto_name,
                unit,
                strings_pt=strings_pt,
                strings_en=strings_en,
                reference_gather=reference_gather,
                reference_build=reference_build,
            )
        )
    return rows
