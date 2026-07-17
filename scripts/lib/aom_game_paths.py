from __future__ import annotations

import os
from pathlib import Path

DEFAULT_GAME_DIR = Path(
    r"E:\SteamLibrary\steamapps\common\Age of Mythology Retold"
)
DEFAULT_CRYBAR = (
    Path(__file__).resolve().parents[2] / "tools" / "crybar" / "cli" / "crybar.exe"
)
DEFAULT_CACHE_DIR = (
    Path(__file__).resolve().parents[2] / "tools" / "aom-extracted"
)

DATA_BAR_REL = Path("game") / "data" / "Data.bar"
UI_TEXTURE_CACHE_BAR = Path("game") / "ui" / "UITextureCache.bar"
RANDOM_MAPS_DIR = Path("game") / "random_maps"

BAR_ENTRIES = [
    "gameplay/proto.xml.XMB",
    "gameplay/techtree.xml.XMB",
    "gameplay/powers.xml.XMB",
    "gameplay/god_powers/greek.godpowers.XMB",
    "gameplay/god_powers/egyptian.godpowers.XMB",
    "gameplay/god_powers/norse.godpowers.XMB",
    "gameplay/god_powers/atlantean.godpowers.XMB",
    "gameplay/god_powers/chinese.godpowers.XMB",
    "gameplay/god_powers/japanese.godpowers.XMB",
    "gameplay/god_powers/aztec.godpowers.XMB",
    "gameplay/god_powers/shared.godpowers.XMB",
    "gameplay/god_powers/spc.godpowers.XMB",
    "gameplay/god_powers/aotg.godpowers.XMB",
    "strings/English/string_table.txt",
    "strings/PortugueseBrazil/string_table.txt",
]


def resolve_game_dir(value: str | None) -> Path:
    if value:
        return Path(value).expanduser().resolve()
    env = os.environ.get("AOM_GAME_DIR")
    if env:
        return Path(env).expanduser().resolve()
    return DEFAULT_GAME_DIR


def data_bar_path(game_dir: Path) -> Path:
    return game_dir / DATA_BAR_REL
