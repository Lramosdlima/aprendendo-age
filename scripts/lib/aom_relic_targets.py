from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from functools import lru_cache
from pathlib import Path

from aom_string_table import parse_string_table
from aom_unit_merge import _compact_key

# Grupos lógicos do techtree (não são protos em proto.xml).
LOGICAL_TARGET_EN: dict[str, str] = {
    "Unit": "Units",
    "LogicalTypeMythUnitNotTitan": "Myth units (except Titans)",
    "LogicalTypeTrainableMythUnit": "Trainable myth units",
    "LogicalTypeNavalMythUnit": "Naval myth units",
    "LogicalTypeRangedMythUnit": "Ranged myth units",
    "LogicalTypeHealableHero": "Healable heroes",
    "LogicalTypeUnitIsConstructed": "Units under construction",
    "AbstractWall": "Walls",
    "AbstractFishingShip": "Fishing ships",
    "AbstractWarship": "Warships",
    "AbstractWarshipHero": "Naval heroes",
    "AbstractMythUnit": "Myth units",
    "AbstractTrap": "Traps",
    "AbstractMonument": "Monuments",
    "AbstractTownCenter": "Town Centers",
    "AbstractFortress": "Fortresses",
    "AbstractSiegeWeapon": "Siege weapons",
    "AbstractTower": "Towers",
    "AbstractInfantry": "Infantry",
    "AbstractArcher": "Ranged soldiers",
    "AbstractCavalry": "Cavalry",
    "EconomicUpgraded": "Villagers",
    "HumanSoldier": "Human soldiers",
    "Building": "Buildings",
    "Player": "",
    "AgeUpgrade": "Age upgrades",
    "SecretsOfTheTitans": "Secrets of the Titans",
    "ArmoryWeaponsTechnology": "Armory weapon upgrades",
    "HeroShadowUpgraded": "Hero shadows",
}

LOGICAL_TARGET_PT: dict[str, str] = {
    "Unit": "Unidades",
    "LogicalTypeMythUnitNotTitan": "Unidades mitológicas (exceto Titãs)",
    "LogicalTypeTrainableMythUnit": "Unidades mitológicas treináveis",
    "LogicalTypeNavalMythUnit": "Unidades mitológicas navais",
    "LogicalTypeRangedMythUnit": "Unidades mitológicas de longo alcance",
    "LogicalTypeHealableHero": "Heróis curáveis",
    "LogicalTypeUnitIsConstructed": "Unidades em construção",
    "AbstractWall": "Muralhas",
    "AbstractFishingShip": "Barcos de pesca",
    "AbstractWarship": "Navios de guerra",
    "AbstractWarshipHero": "Heróis navais",
    "AbstractMythUnit": "Unidades mitológicas",
    "AbstractTrap": "Armadilhas",
    "AbstractMonument": "Monumentos",
    "AbstractTownCenter": "Centros Urbanos",
    "AbstractFortress": "Fortalezas",
    "AbstractSiegeWeapon": "Armas de cerco",
    "AbstractTower": "Torres",
    "AbstractInfantry": "Infantaria",
    "AbstractArcher": "Soldados de longo alcance",
    "AbstractCavalry": "Cavalaria",
    "EconomicUpgraded": "Aldeões",
    "HumanSoldier": "Soldados humanos",
    "Building": "Construções",
    "Player": "",
    "AgeUpgrade": "Avanços de era",
    "SecretsOfTheTitans": "Segredos dos Titãs",
    "ArmoryWeaponsTechnology": "melhorias de armas da Armaria",
    "HeroShadowUpgraded": "sombras de heróis",
}

# Fallbacks quando o proto não está em proto.xml (ex.: Temple = melhorias do Templo).
EXTRA_TARGET_EN: dict[str, str] = {
    "Temple": "Temple technologies",
    "Armory": "Armory technologies",
    "DwarvenArmory": "Dwarven Armory technologies",
    "TownCenter": "Town Centers",
    "CitadelCenter": "Citadel Centers",
    "SentryTower": "Sentry Towers",
    "WallGate": "Gates",
    "TradeUnit": "Trade units",
    "MythUnit": "Myth units",
    "Hero": "Heroes",
    "House": "Houses",
    "Manor": "Manors",
    "Storehouse": "Storehouses",
    "Granary": "Granaries",
    "LumberCamp": "Lumber camps",
    "MiningCamp": "Mining camps",
    "MiningCampJapanese": "Japanese mining camps",
    "Watermill": "Watermills",
    "EconomicGuild": "Economic guilds",
    "Silo": "Silos",
    "OxCartBuilding": "Ox carts",
    "Calpulli": "Calpulli",
    "OsirisPieceCart": "Osiris Piece carts",
    "Quinametzin": "Quinametzin",
}

EXTRA_TARGET_PT: dict[str, str] = {
    "Temple": "melhorias do Templo",
    "Armory": "melhorias da Armaria",
    "DwarvenArmory": "melhorias da Armaria Anã",
    "TownCenter": "Centros Urbanos",
    "CitadelCenter": "Cidadelas",
    "SentryTower": "Torres de sentinela",
    "WallGate": "Portões",
    "TradeUnit": "Caravanas",
    "MythUnit": "Unidades mitológicas",
    "Hero": "Heróis",
    "House": "Casas",
    "Manor": "Manors",
    "Storehouse": "Armazéns",
    "Granary": "Celeiros",
    "LumberCamp": "Campos madeireiros",
    "MiningCamp": "Campos de mineração",
    "MiningCampJapanese": "Campos de mineração japoneses",
    "Watermill": "Moinhos d'água",
    "EconomicGuild": "Guildas econômicas",
    "Silo": "Silos",
    "OxCartBuilding": "Carroças de boi",
    "Calpulli": "Calpulli",
    "OsirisPieceCart": "carroças da Peça de Osíris",
    "Quinametzin": "Quinametzin",
}


def _humanize_proto(proto: str) -> str:
    text = proto
    for prefix in ("LogicalType", "Abstract"):
        if text.startswith(prefix):
            text = text[len(prefix) :]
            break
    parts = re.findall(r"[A-Z]?[a-z0-9]+", text)
    return " ".join(part.capitalize() for part in parts if part)


@lru_cache(maxsize=4)
def _proto_labels_from_game(cache_key: str) -> tuple[dict[str, str], dict[str, str]]:
    cache_dir = Path(cache_key)
    proto_path = cache_dir / "gameplay" / "proto.xml"
    strings_en_path = cache_dir / "strings" / "English" / "string_table.txt"
    strings_pt_path = cache_dir / "strings" / "PortugueseBrazil" / "string_table.txt"

    en: dict[str, str] = {}
    pt: dict[str, str] = {}

    if not proto_path.exists():
        return en, pt

    strings_en = parse_string_table(strings_en_path) if strings_en_path.exists() else {}
    strings_pt = parse_string_table(strings_pt_path) if strings_pt_path.exists() else {}

    for node in ET.parse(proto_path).getroot().findall("unit"):
        proto_name = node.get("name")
        display_id = (node.findtext("displaynameid") or "").strip()
        if not proto_name or not display_id:
            continue
        en[proto_name] = strings_en.get(display_id, _humanize_proto(proto_name))
        pt[proto_name] = strings_pt.get(display_id, strings_en.get(display_id, _humanize_proto(proto_name)))

    return en, pt


def build_target_labels(cache_dir: Path | None = None) -> tuple[dict[str, str], dict[str, str]]:
    en: dict[str, str] = {**LOGICAL_TARGET_EN, **EXTRA_TARGET_EN}
    pt: dict[str, str] = {**LOGICAL_TARGET_PT, **EXTRA_TARGET_PT}

    if cache_dir is not None:
        game_en, game_pt = _proto_labels_from_game(str(cache_dir.resolve()))
        en = {**game_en, **en}
        pt = {**game_pt, **pt}

    return en, pt


def target_label(proto: str, *, locale: str, cache_dir: Path | None = None) -> str:
    if not proto:
        return ""
    en, pt = build_target_labels(cache_dir)
    labels = pt if locale == "pt" else en
    if proto in labels:
        return labels[proto]
    compact = _compact_key(proto)
    for key, value in labels.items():
        if _compact_key(key) == compact:
            return value
    return _humanize_proto(proto)
