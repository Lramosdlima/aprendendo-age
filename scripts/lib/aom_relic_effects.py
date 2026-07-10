from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from aom_relic_targets import target_label

SKIP_TRICKLE_FAVOR = 0.011

RESOURCE_EN = {
    "Food": "food",
    "Wood": "wood",
    "Gold": "gold",
    "Favor": "favor",
}
RESOURCE_PT = {
    "Food": "Comida",
    "Wood": "Madeira",
    "Gold": "Ouro",
    "Favor": "Favor",
}

ARMOR_EN = {
    "Hack": "hack",
    "Pierce": "pierce",
    "Crush": "crush",
}
ARMOR_PT = {
    "Hack": "cortante",
    "Pierce": "perfurante",
    "Crush": "contundente",
}

def _float(value: str | None, default: float = 0.0) -> float:
    if not value:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def _fmt_num(value: float) -> str:
    rounded = round(value, 2)
    if rounded == int(rounded):
        return str(int(rounded))
    return f"{rounded:.1f}".rstrip("0").rstrip(".")


def _pct_from_multiplier(multiplier: float) -> float:
    return (multiplier - 1.0) * 100.0


def _pct_change(multiplier: float) -> tuple[float, bool]:
    return abs(_pct_from_multiplier(multiplier)), multiplier >= 1.0


def _discount_from_cost_factor(factor: float) -> float:
    return (1.0 - factor) * 100.0


def _target_label(proto: str, *, locale: str, cache_dir: Path | None = None) -> str:
    return target_label(proto, locale=locale, cache_dir=cache_dir)


def _resource_label(resource: str, *, locale: str) -> str:
    labels = RESOURCE_PT if locale == "pt" else RESOURCE_EN
    return labels.get(resource, resource)


def _armor_label(armor_type: str, *, locale: str) -> str:
    labels = ARMOR_PT if locale == "pt" else ARMOR_EN
    return labels.get(armor_type, armor_type.lower())


def parse_data_effects(tech: ET.Element) -> list[dict[str, Any]]:
    effects: list[dict[str, Any]] = []
    for effect in tech.findall("./effects/effect"):
        effect_type = effect.get("type", "")
        if effect_type == "Data":
            target = effect.find("target")
            target_proto = ""
            target_type = ""
            if target is not None:
                target_type = target.get("type", "")
                target_proto = (target.text or "").strip()
            effects.append(
                {
                    "effect_type": effect_type,
                    "subtype": effect.get("subtype", ""),
                    "amount": _float(effect.get("amount")),
                    "resource": effect.get("resource") or "",
                    "relativity": effect.get("relativity", ""),
                    "armortype": effect.get("armortype") or "",
                    "damagetype": effect.get("damagetype") or "",
                    "effecttype": effect.get("effecttype") or "",
                    "target_type": target_type,
                    "target_proto": target_proto,
                }
            )
        elif effect_type == "TechStatus":
            effects.append(
                {
                    "effect_type": effect_type,
                    "status": effect.get("status", ""),
                    "linked_tech": (effect.text or "").strip(),
                }
            )
    return effects


def _is_noise_effect(effect: dict[str, Any]) -> bool:
    if effect.get("effect_type") != "Data":
        return False
    if effect["subtype"] != "ResourceTrickleRate":
        return False
    if effect["resource"] != "Favor":
        return False
    return abs(effect["amount"]) <= SKIP_TRICKLE_FAVOR


def _effect_key(effect: dict[str, Any]) -> tuple[Any, ...]:
    if effect.get("effect_type") == "TechStatus":
        return ("TechStatus", effect.get("linked_tech", ""))
    return (
        effect["subtype"],
        round(effect["amount"], 6),
        effect["resource"],
        effect["relativity"],
        effect["armortype"],
        effect["damagetype"],
        effect.get("effecttype", ""),
    )


def _dedupe_effects(effects: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[Any, ...], dict[str, Any]] = {}
    for effect in effects:
        if _is_noise_effect(effect):
            continue
        key = _effect_key(effect)
        if key not in grouped:
            grouped[key] = {**effect, "targets": []}
        if effect.get("effect_type") == "Data":
            proto = effect["target_proto"]
            if proto and proto not in grouped[key]["targets"]:
                grouped[key]["targets"].append(proto)
    return list(grouped.values())


def _respawn_delay(tech_index: dict[str, ET.Element], linked_tech: str) -> float | None:
    linked = tech_index.get(linked_tech)
    if linked is None:
        return None
    delay = linked.findtext("delay")
    if not delay:
        return None
    value = _float(delay)
    return value if value > 0 else None


def _bonus_work_rate_line(
    tech_index: dict[str, ET.Element],
    linked_techs: list[str],
    *,
    locale: str,
) -> str | None:
    bonuses: list[float] = []
    for linked in linked_techs:
        linked = tech_index.get(linked)
        if linked is None:
            continue
        for effect in linked.findall("./effects/effect"):
            if effect.get("subtype") != "WorkRate":
                continue
            amount = _float(effect.get("amount"))
            if amount:
                bonuses.append(_pct_from_multiplier(amount))
    if not bonuses:
        return None
    bonus = bonuses[0]
    if locale == "pt":
        return (
            f"Plow, Irrigação, Controle de Cheias e Chinampas concedem "
            f"+{_fmt_num(bonus)}% extra de coleta de Comida em fazendas."
        )
    return (
        f"Plow, Irrigation, Flood Control, and Chinampas each grant "
        f"+{_fmt_num(bonus)}% extra Food gather rate from Farms."
    )


def _join_targets(targets: list[str], *, locale: str, cache_dir: Path | None = None) -> str:
    labels = [_target_label(proto, locale=locale, cache_dir=cache_dir) for proto in targets if proto]
    labels = [label for label in labels if label]
    if not labels:
        return ""
    if len(labels) == 1:
        return labels[0]
    if locale == "pt":
        return ", ".join(labels[:-1]) + f" e {labels[-1]}"
    return ", ".join(labels[:-1]) + f" and {labels[-1]}"


def _join_resources(resources: list[str], *, locale: str) -> str:
    labels = [_resource_label(resource, locale=locale) for resource in resources]
    if len(labels) == 1:
        return labels[0]
    if locale == "pt":
        return ", ".join(labels[:-1]) + f" e {labels[-1]}"
    return ", ".join(labels[:-1]) + f" and {labels[-1]}"


def _format_single_effect(
    effect: dict[str, Any],
    *,
    locale: str,
    tech_index: dict[str, ET.Element] | None = None,
    cache_dir: Path | None = None,
) -> str | None:
    if effect.get("effect_type") == "TechStatus":
        linked = effect.get("linked_tech", "")
        if not linked or not tech_index:
            return None
        if linked.endswith("Bonus"):
            return None
        delay = _respawn_delay(tech_index, linked)
        if delay is None:
            return None
        if locale == "pt":
            return f"Unidade bônus reaparece a cada {_fmt_num(delay)} segundos."
        return f"Bonus unit respawns every {_fmt_num(delay)} seconds."

    subtype = effect["subtype"]
    amount = effect["amount"]
    resource = effect["resource"]
    relativity = effect["relativity"]
    targets = _join_targets(effect.get("targets", []), locale=locale, cache_dir=cache_dir)
    armor = _armor_label(effect["armortype"], locale=locale) if effect["armortype"] else ""

    if subtype == "ResourceTrickleRate" and relativity == "Absolute":
        per_min = amount * 60.0
        res = _resource_label(resource, locale=locale)
        if locale == "pt":
            return f"Produz um fluxo de {_fmt_num(per_min)} de {res} por minuto."
        return f"Produces a trickle of {_fmt_num(per_min)} {res} per minute."

    if subtype in {"Cost", "cost", "CostBuildingTechs"} and relativity == "Assign" and amount == 0:
        if locale == "pt":
            if targets:
                return f"{targets} são gratuitos."
            return "Custo zerado."
        if targets:
            return f"{targets} are free."
        return "No cost."

    if subtype in {"Cost", "cost", "CostBuildingTechs"} and relativity in {"Percent", "BasePercent"}:
        discount = _discount_from_cost_factor(amount)
        res = _resource_label(resource, locale=locale) if resource else ""
        if locale == "pt":
            if discount >= 0:
                if res and targets:
                    return f"{targets.capitalize()} custam {_fmt_num(discount)}% menos de {res}."
                if res:
                    return f"Custa {_fmt_num(discount)}% menos de {res}."
                if targets:
                    return f"{targets.capitalize()} custam {_fmt_num(discount)}% menos."
                return f"Custo reduzido em {_fmt_num(discount)}%."
            extra = abs(discount)
            if res and targets:
                return f"{targets.capitalize()} custam {_fmt_num(extra)}% mais de {res}."
            if res:
                return f"Custa {_fmt_num(extra)}% mais de {res}."
            if targets:
                return f"{targets.capitalize()} custam {_fmt_num(extra)}% mais."
            return f"Custo aumentado em {_fmt_num(extra)}%."
        if discount >= 0:
            if res and targets:
                return f"{targets} cost {_fmt_num(discount)}% less {res}."
            if res:
                return f"Costs {_fmt_num(discount)}% less {res}."
            if targets:
                return f"{targets} cost {_fmt_num(discount)}% less."
            return f"Cost reduced by {_fmt_num(discount)}%."
        extra = abs(discount)
        if res and targets:
            return f"{targets} cost {_fmt_num(extra)}% more {res}."
        if res:
            return f"Costs {_fmt_num(extra)}% more {res}."
        if targets:
            return f"{targets} cost {_fmt_num(extra)}% more."
        return f"Cost increased by {_fmt_num(extra)}%."

    if subtype == "ArmorVulnerability" and relativity == "Percent":
        reduction = abs(amount) * 100.0
        if locale == "pt":
            if targets and armor:
                return (
                    f"{targets} têm {_fmt_num(reduction)}% menos vulnerabilidade "
                    f"a dano {armor}."
                )
            if targets:
                return f"{targets} têm {_fmt_num(reduction)}% menos vulnerabilidade."
            return f"Reduz vulnerabilidade em {_fmt_num(reduction)}%."
        if targets and armor:
            return f"{targets} have {_fmt_num(reduction)}% less vulnerability to {armor} damage."
        if targets:
            return f"{targets} have {_fmt_num(reduction)}% less vulnerability."
        return f"Reduces vulnerability by {_fmt_num(reduction)}%."

    if subtype in {"Damage", "DamageBonus", "Damagebonus"}:
        if relativity in {"BasePercent", "Percent"}:
            pct, is_increase = _pct_change(amount)
            if locale == "pt":
                if targets:
                    if is_increase:
                        return f"{targets} causam {_fmt_num(pct)}% mais dano."
                    return f"{targets} causam {_fmt_num(pct)}% menos dano."
                if is_increase:
                    return f"+{_fmt_num(pct)}% de dano."
                return f"-{_fmt_num(pct)}% de dano."
            if targets:
                if is_increase:
                    return f"{targets} deal {_fmt_num(pct)}% more damage."
                return f"{targets} deal {_fmt_num(pct)}% less damage."
            if is_increase:
                return f"+{_fmt_num(pct)}% damage."
            return f"-{_fmt_num(pct)}% damage."
        if relativity == "Absolute" and targets:
            if locale == "pt":
                return f"{targets} ganham +{_fmt_num(amount)} de dano."
            return f"{targets} gain +{_fmt_num(amount)} damage."

    if subtype == "Hitpoints" and relativity == "BasePercent":
        pct, is_increase = _pct_change(amount)
        if locale == "pt":
            if targets:
                if is_increase:
                    return f"{targets} têm +{_fmt_num(pct)}% de pontos de vida."
                return f"{targets} têm {_fmt_num(pct)}% menos pontos de vida."
            if is_increase:
                return f"+{_fmt_num(pct)}% de pontos de vida."
            return f"-{_fmt_num(pct)}% de pontos de vida."
        if targets:
            if is_increase:
                return f"{targets} have +{_fmt_num(pct)}% hit points."
            return f"{targets} have {_fmt_num(pct)}% less hit points."
        if is_increase:
            return f"+{_fmt_num(pct)}% hit points."
        return f"-{_fmt_num(pct)}% hit points."

    if subtype == "WorkRate" and relativity in {"BasePercent", "Percent"}:
        pct, is_increase = _pct_change(amount)
        if locale == "pt":
            if targets:
                if is_increase:
                    return f"{targets} trabalham {_fmt_num(pct)}% mais rápido."
                return f"{targets} trabalham {_fmt_num(pct)}% mais devagar."
            if is_increase:
                return f"+{_fmt_num(pct)}% de velocidade de trabalho."
            return f"-{_fmt_num(pct)}% de velocidade de trabalho."
        if targets:
            if is_increase:
                return f"{targets} work {_fmt_num(pct)}% faster."
            return f"{targets} work {_fmt_num(pct)}% slower."
        if is_increase:
            return f"+{_fmt_num(pct)}% work rate."
        return f"-{_fmt_num(pct)}% work rate."

    if subtype == "BuildPoints" and relativity == "Percent":
        speed_mult = 1.0 / amount if amount else 0.0
        pct, is_increase = _pct_change(speed_mult)
        if locale == "pt":
            if targets:
                if is_increase:
                    return f"{targets} são construídos {_fmt_num(pct)}% mais rápido."
                return f"{targets} são construídos {_fmt_num(pct)}% mais devagar."
            if is_increase:
                return f"Construção {_fmt_num(pct)}% mais rápida."
            return f"Construção {_fmt_num(pct)}% mais devagar."
        if targets:
            if is_increase:
                return f"{targets} are built {_fmt_num(pct)}% faster."
            return f"{targets} are built {_fmt_num(pct)}% slower."
        if is_increase:
            return f"Build speed +{_fmt_num(pct)}%."
        return f"Build speed -{_fmt_num(pct)}%."

    if subtype == "MaximumRange":
        if relativity == "Absolute":
            if locale == "pt":
                return f"{targets} ganham +{_fmt_num(amount)} de alcance." if targets else f"+{_fmt_num(amount)} de alcance."
            return f"{targets} gain +{_fmt_num(amount)} range." if targets else f"+{_fmt_num(amount)} range."
        if relativity in {"BasePercent", "Percent"}:
            pct, is_increase = _pct_change(amount)
            if locale == "pt":
                if targets:
                    if is_increase:
                        return f"{targets} têm +{_fmt_num(pct)}% de alcance."
                    return f"{targets} têm {_fmt_num(pct)}% menos alcance."
                if is_increase:
                    return f"+{_fmt_num(pct)}% de alcance."
                return f"-{_fmt_num(pct)}% de alcance."
            if targets:
                if is_increase:
                    return f"{targets} have +{_fmt_num(pct)}% range."
                return f"{targets} have {_fmt_num(pct)}% less range."
            if is_increase:
                return f"+{_fmt_num(pct)}% range."
            return f"-{_fmt_num(pct)}% range."

    if subtype == "MaximumVelocity":
        if relativity == "Absolute":
            if locale == "pt":
                return f"{targets} ganham +{_fmt_num(amount)} de velocidade." if targets else f"+{_fmt_num(amount)} de velocidade."
            return f"{targets} gain +{_fmt_num(amount)} speed." if targets else f"+{_fmt_num(amount)} speed."
        if relativity in {"BasePercent", "Percent"}:
            pct, is_increase = _pct_change(amount)
            if locale == "pt":
                if targets:
                    if is_increase:
                        return f"{targets} movem-se {_fmt_num(pct)}% mais rápido."
                    return f"{targets} movem-se {_fmt_num(pct)}% mais devagar."
                if is_increase:
                    return f"+{_fmt_num(pct)}% de velocidade."
                return f"-{_fmt_num(pct)}% de velocidade."
            if targets:
                if is_increase:
                    return f"{targets} move {_fmt_num(pct)}% faster."
                return f"{targets} move {_fmt_num(pct)}% slower."
            if is_increase:
                return f"+{_fmt_num(pct)}% speed."
            return f"-{_fmt_num(pct)}% speed."

    if subtype == "LOS":
        if relativity == "Absolute":
            if locale == "pt":
                return f"{targets} ganham +{_fmt_num(amount)} de linha de visão." if targets else f"+{_fmt_num(amount)} de linha de visão."
            return f"{targets} gain +{_fmt_num(amount)} line of sight." if targets else f"+{_fmt_num(amount)} line of sight."
        if relativity in {"BasePercent", "Percent"}:
            pct, is_increase = _pct_change(amount)
            if locale == "pt":
                if targets:
                    if is_increase:
                        return f"{targets} têm +{_fmt_num(pct)}% de linha de visão."
                    return f"{targets} têm {_fmt_num(pct)}% menos linha de visão."
                if is_increase:
                    return f"+{_fmt_num(pct)}% de linha de visão."
                return f"-{_fmt_num(pct)}% de linha de visão."
            if targets:
                if is_increase:
                    return f"{targets} have +{_fmt_num(pct)}% line of sight."
                return f"{targets} have {_fmt_num(pct)}% less line of sight."
            if is_increase:
                return f"+{_fmt_num(pct)}% line of sight."
            return f"-{_fmt_num(pct)}% line of sight."

    if subtype == "PopulationCapAddition" and relativity == "Absolute":
        if locale == "pt":
            return f"Centros Urbanos suportam +{_fmt_num(amount)} de população."
        return f"Town Centers support +{_fmt_num(amount)} population."

    if subtype == "PopulationCount" and relativity == "Absolute" and amount < 0:
        reduction = abs(amount)
        if locale == "pt":
            return f"{targets} custam {_fmt_num(reduction)} a menos de população." if targets else f"Custo populacional -{_fmt_num(reduction)}."
        return f"{targets} cost {_fmt_num(reduction)} less population." if targets else f"Population cost -{_fmt_num(reduction)}."

    if subtype == "UnitRegenRate" and relativity == "Absolute":
        if locale == "pt":
            return f"{targets} regeneram {_fmt_num(amount)} PV/s." if targets else f"Regeneração de {_fmt_num(amount)} PV/s."
        return f"{targets} regenerate {_fmt_num(amount)} HP/s." if targets else f"Regenerates {_fmt_num(amount)} HP/s."

    if subtype == "RateOfFire" and relativity == "BasePercent":
        bonus = _pct_from_multiplier(1.0 / amount) if amount else 0.0
        if locale == "pt":
            return f"{targets} atacam {_fmt_num(bonus)}% mais rápido." if targets else f"Cadência +{_fmt_num(bonus)}%."
        return f"{targets} attack {_fmt_num(bonus)}% faster." if targets else f"Attack speed +{_fmt_num(bonus)}%."

    if subtype == "ResourceReturn" and relativity == "Assign":
        res = _resource_label(resource, locale=locale)
        if locale == "pt":
            return f"{targets} concedem +{_fmt_num(amount)} de {res} ao serem abatidos." if targets else f"+{_fmt_num(amount)} de {res} ao abater."
        return f"{targets} grant +{_fmt_num(amount)} {res} when killed." if targets else f"+{_fmt_num(amount)} {res} on kill."

    if subtype == "ResourceReturnRate" and relativity == "Absolute":
        pct = amount * 100.0
        res = _resource_label(resource, locale=locale)
        if locale == "pt":
            return f"{targets} devolvem {_fmt_num(pct)}% dos recursos gastos em {res}." if targets else f"Retorno de {_fmt_num(pct)}% em {res}."
        return f"{targets} return {_fmt_num(pct)}% of spent {res}." if targets else f"Returns {_fmt_num(pct)}% of spent {res}."

    if subtype == "TrainPoints" and relativity in {"Percent", "BasePercent"}:
        if relativity == "Percent":
            discount = _discount_from_cost_factor(amount)
            if locale == "pt":
                return f"{targets} treinam {_fmt_num(discount)}% mais rápido." if targets else f"Treino {_fmt_num(discount)}% mais rápido."
            return f"{targets} train {_fmt_num(discount)}% faster." if targets else f"Training {_fmt_num(discount)}% faster."
        bonus = _pct_from_multiplier(amount)
        if locale == "pt":
            return f"{targets} treinam {_fmt_num(bonus)}% mais devagar." if targets else f"Treino {_fmt_num(bonus)}% mais devagar."
        return f"{targets} train {_fmt_num(bonus)}% slower." if targets else f"Training {_fmt_num(bonus)}% slower."

    if subtype == "RechargeTime" and relativity == "BasePercent":
        discount = _discount_from_cost_factor(amount)
        if locale == "pt":
            return f"{targets} têm recarga {_fmt_num(discount)}% mais rápida." if targets else f"Recarga {_fmt_num(discount)}% mais rápida."
        return f"{targets} recharge {_fmt_num(discount)}% faster." if targets else f"Recharge {_fmt_num(discount)}% faster."

    if subtype in {"GodPowerROFFactor", "GodPowerCostFactor"} and relativity == "Percent":
        discount = _discount_from_cost_factor(amount)
        label = "cooldown" if subtype == "GodPowerROFFactor" else "cost"
        if locale == "pt":
            label_pt = "recarga" if subtype == "GodPowerROFFactor" else "custo"
            return f"Poderes divinos têm {label_pt} {_fmt_num(discount)}% menor."
        return f"God powers have {_fmt_num(discount)}% lower {label}."

    if subtype == "RepairCostFactor" and relativity == "BasePercent":
        discount = _discount_from_cost_factor(amount)
        if locale == "pt":
            return f"Reparos custam {_fmt_num(discount)}% menos."
        return f"Repairs cost {_fmt_num(discount)}% less."

    if subtype == "BuildingChainResourceFactor" and relativity == "Percent":
        bonus = _pct_from_multiplier(amount)
        res = _resource_label(resource, locale=locale)
        if locale == "pt":
            return f"Geração de {res} em cadeia +{_fmt_num(bonus)}%."
        return f"Chain {res} generation +{_fmt_num(bonus)}%."

    if subtype == "OnHitEffect" and relativity == "Assign":
        if locale == "pt":
            return f"{targets} aplicam efeito especial ao acertar." if targets else "Efeito especial ao acertar."
        return f"{targets} apply a special on-hit effect." if targets else "Special on-hit effect."

    if subtype == "OnHitEffectAttachBone" and relativity == "Assign":
        if locale == "pt":
            return f"{targets} aplicam efeito adicional ao acertar." if targets else "Efeito adicional ao acertar."
        return f"{targets} apply an extra on-hit effect." if targets else "Extra on-hit effect."

    if subtype == "OnHitEffectRate" and relativity == "Absolute":
        if effect.get("effecttype") == "Lifesteal":
            pct = amount * 100.0
            if locale == "pt":
                return (
                    f"{targets} recuperam {_fmt_num(pct)}% do dano causado como vida."
                    if targets
                    else f"Recupera {_fmt_num(pct)}% do dano causado como vida."
                )
            return (
                f"{targets} heal for {_fmt_num(pct)}% of damage dealt."
                if targets
                else f"Heals for {_fmt_num(pct)}% of damage dealt."
            )

    if subtype == "OnDamageModify" and relativity == "Absolute":
        if locale == "pt":
            return f"{targets} reduzem dano recebido." if targets else "Reduz dano recebido."
        return f"{targets} reduce damage taken." if targets else "Reduces damage taken."

    if subtype == "ProtoActionAdd" and relativity == "Assign":
        if locale == "pt":
            return f"{targets} ganham uma nova ação." if targets else "Nova ação desbloqueada."
        return f"{targets} gain a new action." if targets else "New action unlocked."

    if subtype == "ActionEnable" and relativity == "Absolute":
        if locale == "pt":
            return f"{targets} desbloqueiam uma ação especial." if targets else "Ação especial desbloqueada."
        return f"{targets} unlock a special action." if targets else "Special action unlocked."

    return None


def _merge_cost_lines(
    lines: list[str],
    effects: list[dict[str, Any]],
    *,
    locale: str,
    cache_dir: Path | None = None,
) -> list[str]:
    cost_groups: dict[tuple[str, float, str], list[str]] = {}
    other_effects: list[dict[str, Any]] = []
    for effect in effects:
        if effect["subtype"] in {"Cost", "cost", "CostBuildingTechs"} and effect["relativity"] in {
            "Percent",
            "BasePercent",
        }:
            key = (
                effect["subtype"],
                round(effect["amount"], 6),
                _join_targets(effect.get("targets", []), locale=locale, cache_dir=cache_dir),
            )
            cost_groups.setdefault(key, [])
            if effect["resource"] and effect["resource"] not in cost_groups[key]:
                cost_groups[key].append(effect["resource"])
        else:
            other_effects.append(effect)

    out = list(lines)
    for (subtype, amount, targets), resources in cost_groups.items():
        discount = _discount_from_cost_factor(amount)
        joined = _join_resources(resources, locale=locale)
        if locale == "pt":
            if discount >= 0:
                if targets and joined:
                    out.append(f"{targets.capitalize()} custam {_fmt_num(discount)}% menos de {joined}.")
                elif joined:
                    out.append(f"Custa {_fmt_num(discount)}% menos de {joined}.")
                elif targets:
                    out.append(f"{targets.capitalize()} custam {_fmt_num(discount)}% menos.")
            else:
                extra = abs(discount)
                if targets and joined:
                    out.append(f"{targets.capitalize()} custam {_fmt_num(extra)}% mais de {joined}.")
                elif joined:
                    out.append(f"Custa {_fmt_num(extra)}% mais de {joined}.")
                elif targets:
                    out.append(f"{targets.capitalize()} custam {_fmt_num(extra)}% mais.")
        elif discount >= 0:
            if targets and joined:
                out.append(f"{targets} cost {_fmt_num(discount)}% less {joined}.")
            elif joined:
                out.append(f"Costs {_fmt_num(discount)}% less {joined}.")
            elif targets:
                out.append(f"{targets} cost {_fmt_num(discount)}% less.")
        else:
            extra = abs(discount)
            if targets and joined:
                out.append(f"{targets} cost {_fmt_num(extra)}% more {joined}.")
            elif joined:
                out.append(f"Costs {_fmt_num(extra)}% more {joined}.")
            elif targets:
                out.append(f"{targets} cost {_fmt_num(extra)}% more.")
    return out


def format_relic_effects(
    tech: ET.Element,
    *,
    locale: str,
    tech_index: dict[str, ET.Element] | None = None,
    cache_dir: Path | None = None,
) -> str:
    raw = parse_data_effects(tech)
    deduped = _dedupe_effects(raw)

    bonus_techs = [
        effect.get("linked_tech", "")
        for effect in deduped
        if effect.get("effect_type") == "TechStatus" and effect.get("linked_tech", "").endswith("Bonus")
    ]

    cost_effects = [
        e
        for e in deduped
        if e.get("effect_type") == "Data"
        and e["subtype"] in {"Cost", "cost", "CostBuildingTechs"}
        and e["relativity"] in {"Percent", "BasePercent"}
    ]
    non_cost = [
        e
        for e in deduped
        if not (
            e.get("effect_type") == "Data"
            and e["subtype"] in {"Cost", "cost", "CostBuildingTechs"}
            and e["relativity"] in {"Percent", "BasePercent"}
        )
    ]

    lines: list[str] = []
    if bonus_techs and tech_index:
        bonus_line = _bonus_work_rate_line(tech_index, bonus_techs, locale=locale)
        if bonus_line:
            lines.append(bonus_line)

    for effect in non_cost:
        line = _format_single_effect(effect, locale=locale, tech_index=tech_index, cache_dir=cache_dir)
        if line and line not in lines:
            lines.append(line)

    if cost_effects:
        lines = _merge_cost_lines(lines, cost_effects, locale=locale, cache_dir=cache_dir)

    return "\n".join(lines)


def format_relic_effects_both(
    tech: ET.Element,
    *,
    tech_index: dict[str, ET.Element] | None = None,
    cache_dir: Path | None = None,
) -> tuple[str, str]:
    return (
        format_relic_effects(tech, locale="pt", tech_index=tech_index, cache_dir=cache_dir),
        format_relic_effects(tech, locale="en", tech_index=tech_index, cache_dir=cache_dir),
    )
