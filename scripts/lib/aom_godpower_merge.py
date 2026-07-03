from __future__ import annotations

import html
from copy import deepcopy
from pathlib import Path
from typing import Any

from aom_unit_merge import (
    _compact_key,
    _normalize_number,
    load_catalog,
    parse_id_range,
    save_catalog,
)

PRESERVED_FIELDS = frozenset(
    {
        "id",
        "god",
        "era",
        "panteao",
        "descricao_avancada",
    }
)

GODPOWER_CATALOG_ALIASES = {
    "PeachBlossomSpring": "ThePeachBlossomSpring",
    "Hesperides": "HesperidesTree",
    "Drought": "DroughtLand",
    "Fei Beasts": "VenomBeast",
    "Goshinboku Tree": "Goshinboku",
    "Pillar of Tlálocan": "MonolithOfTlaloc",
    "Pillar of Tlalocan": "MonolithOfTlaloc",
    "Plenty Vault": "PlentyVault",
    "Plenty": "PlentyVault",
    "Ceasefire": "CeaseFire",
    "Underworld Passage": "UnderworldPassage",
    "Lightning Storm": "LightningStorm",
    "Shifting Sands": "ShiftingSands",
    "Plague of Serpents": "PlagueOfSerpents",
    "Son of Osiris": "SonOfOsiris",
    "Locust Swarm": "LocustSwarm",
    "Dwarven Mine": "DwarvenMine",
    "Great Hunt": "GreatHunt",
    "Gaia Forest": "GaiaForest",
    "Solar Shield": "SolarShield",
    "New Moon": "NewMoon",
    "Prosperous Seeds": "ProsperousSeeds",
    "Walking Woods": "WalkingWoods",
    "Walking Berry Bushes": "WalkingBerryBushes",
    "Arctic Winds": "ArcticWinds",
    "Underworld Invasion": "UnderworldInvasion",
    "Arcadian Meadow": "ArcadianMeadow",
    "Communal Hearth": "CommunalHearth",
}


def decode_catalog_name(value: str) -> str:
    return html.unescape(value.replace("%27", "'").replace("%26", "&")).strip()


def match_catalog_to_power(catalog_row: dict[str, Any]) -> str:
    return decode_catalog_name(
        (catalog_row.get("ingles") or catalog_row.get("nome") or "").strip()
    )


def _catalog_name_candidates(catalog_name: str) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    def add(value: str) -> None:
        value = decode_catalog_name(value)
        if value and value not in seen:
            seen.add(value)
            out.append(value)

    add(catalog_name)
    add(GODPOWER_CATALOG_ALIASES.get(catalog_name, ""))

    return out


def resolve_proto_name(
    catalog_name: str,
    extracted_index: dict[str, dict[str, Any]],
) -> str | None:
    if not catalog_name:
        return None

    compact_index = {_compact_key(proto): proto for proto in extracted_index}

    for candidate in _catalog_name_candidates(catalog_name):
        if candidate in extracted_index:
            return candidate

        aliased = GODPOWER_CATALOG_ALIASES.get(candidate)
        if aliased and aliased in extracted_index:
            return aliased

        resolved = compact_index.get(_compact_key(candidate))
        if resolved:
            return resolved

    return None


def index_extracted_by_proto(
    extracted_rows: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    return {row["proto_name"]: row for row in extracted_rows if row.get("proto_name")}


def load_power_name_set(cache_dir: Path) -> set[str]:
    from aom_godpower_extractor import parse_all_powers

    return set(parse_all_powers(cache_dir))


def supplement_extracted_index(
    extracted_index: dict[str, dict[str, Any]],
    *,
    catalog_path: Path,
    cache_dir: Path,
    id_filter: set[int] | None,
    power_filter: set[str] | None,
) -> int:
    rows = load_catalog(catalog_path)
    power_names = load_power_name_set(cache_dir)
    stub_index = {name: {} for name in power_names}
    normalized_power_filter = (
        {name.lower() for name in power_filter} if power_filter is not None else None
    )
    pending: set[str] = set()

    for row in rows:
        if id_filter is not None and row.get("id") not in id_filter:
            continue
        catalog_name = match_catalog_to_power(row)
        if normalized_power_filter is not None:
            if catalog_name.lower() not in normalized_power_filter:
                continue
        if resolve_proto_name(catalog_name, extracted_index):
            continue
        resolved = resolve_proto_name(catalog_name, stub_index)
        if resolved:
            pending.add(resolved)

    if not pending:
        return 0

    from aom_godpower_extractor import extract_godpowers

    added = 0
    for proto in sorted(pending):
        extracted_rows = extract_godpowers(cache_dir, only_power=proto)
        if extracted_rows:
            extracted_index[proto] = extracted_rows[0]
            added += 1
    return added


def build_merged_row(
    existing: dict[str, Any],
    extracted: dict[str, Any],
    *,
    locale: str,
) -> dict[str, Any]:
    merged = deepcopy(existing)
    locale_key = locale.lower()

    if locale_key == "en":
        merged["nome"] = extracted.get("ingles") or merged.get("nome")
        merged["descricao_resumida"] = (
            extracted.get("descricao_resumida_en")
            or merged.get("descricao_resumida")
        )
    else:
        merged["nome"] = extracted.get("nome") or merged.get("nome")
        merged["descricao_resumida"] = (
            extracted.get("descricao_resumida_pt")
            or merged.get("descricao_resumida")
        )

    merged["ingles"] = extracted.get("ingles") or merged.get("ingles")

    for field in (
        "cooldown_seg",
        "duracao_no_mapa_seg",
        "custo_repetir",
        "incremento_por_uso",
        "icon",
    ):
        if field in extracted and extracted[field] is not None:
            merged[field] = _normalize_number(extracted[field])

    return merged


def diff_fields(before: dict[str, Any], after: dict[str, Any]) -> dict[str, dict[str, Any]]:
    changes: dict[str, dict[str, Any]] = {}
    keys = set(before) | set(after)
    for key in sorted(keys):
        if key in PRESERVED_FIELDS:
            continue
        old = before.get(key)
        new = after.get(key)
        if old != new:
            changes[key] = {"before": old, "after": new}
    return changes


def parse_power_filter(value: str | None) -> set[str] | None:
    if not value:
        return None
    return {decode_catalog_name(part.strip()) for part in value.split(",") if part.strip()}


def merge_catalog_file(
    catalog_path: Path,
    extracted_index: dict[str, dict[str, Any]],
    *,
    locale: str,
    power_filter: set[str] | None = None,
    id_filter: set[int] | None = None,
    dry_run: bool = False,
) -> dict[str, Any]:
    rows = load_catalog(catalog_path)
    updated_rows: list[dict[str, Any]] = []
    report: list[dict[str, Any]] = []
    missing: list[str] = []

    normalized_power_filter = (
        {name.lower() for name in power_filter} if power_filter is not None else None
    )

    for row in rows:
        catalog_name = match_catalog_to_power(row)
        if normalized_power_filter is not None:
            if catalog_name.lower() not in normalized_power_filter:
                updated_rows.append(row)
                continue
        elif id_filter is not None and row.get("id") not in id_filter:
            updated_rows.append(row)
            continue

        resolved_proto = resolve_proto_name(catalog_name, extracted_index)
        extracted = extracted_index.get(resolved_proto or "") if resolved_proto else None
        if not extracted:
            missing.append(catalog_name or f"id={row.get('id')}")
            updated_rows.append(row)
            continue

        merged = build_merged_row(row, extracted, locale=locale)
        changes = diff_fields(row, merged)
        if changes:
            report.append(
                {
                    "id": row.get("id"),
                    "proto": resolved_proto,
                    "catalog_name": catalog_name,
                    "nome": row.get("nome"),
                    "changes": changes,
                }
            )
        updated_rows.append(merged)

    if not dry_run:
        save_catalog(catalog_path, updated_rows)

    return {
        "path": str(catalog_path),
        "updated": len(report),
        "missing": missing,
        "report": report,
    }
