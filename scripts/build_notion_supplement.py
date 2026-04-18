"""
Gera starts_build_order.json a partir dos HTML em «Starts Build Order/Starts»,
copia ícones e imagens referenciadas para public/assets e reescreve src para /assets/...

Dependência: pip install -r scripts/requirements.txt
"""
from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup, Tag

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
NOTION_APP = WORKSPACE / "Notion Aprendendo Age" / "Aprendendo Age"
STARTS_DIR = NOTION_APP / "Starts Build Order" / "Starts"
DATA = ROOT / "src" / "data"
PUBLIC_ASSETS = ROOT / "public" / "assets"

YOUTUBE_RE = re.compile(
    r"https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})",
    re.I,
)

# Raiz do export — recursos comuns no HTML de starts
ROOT_RESOURCE_NAMES = frozenset(
    {
        "FoodAOM.png",
        "WoodAOM.png",
        "GoldAOM.png",
        "FavorAOM.png",
        "AoMR_Classical_Age_icon.png",
        "AoMR_Heroic_Age_icon.png",
        "AoMR_Mythic_Age_icon.png",
        "AoMR_Wonder_Age_icon.png",
    }
)


def strip_html_title(html: str) -> str:
    m = re.search(r"<title>([^<]+)</title>", html, re.I)
    return (m.group(1).strip() if m else "").replace("  ", " ")


def extract_youtube(html: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for m in YOUTUBE_RE.finditer(html):
        vid = m.group(1)
        url = f"https://youtu.be/{vid}"
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def find_file_by_basename(search_root: Path, basename: str) -> Path | None:
    if not basename or basename.startswith("http"):
        return None
    # já é basename puro
    bn = basename.split("/")[-1].split("\\")[-1]
    bn = unquote(bn)
    for dp, _, files in os.walk(search_root):
        if bn in files:
            return Path(dp) / bn
    return None


def collect_basenames_from_html(html: str) -> set[str]:
    out: set[str] = set()
    for m in re.finditer(r'src="([^"]+)"', html):
        src = unquote(m.group(1).split("?")[0])
        if src.startswith("http"):
            continue
        base = os.path.basename(src)
        if base:
            out.add(base)
    return out


def copy_asset_map(
    notion_root: Path,
    starts_dir: Path,
    dest: Path,
) -> dict[str, str]:
    """
    Copia ficheiros para dest/ e devolve mapa basename -> /assets/basename
    """
    dest.mkdir(parents=True, exist_ok=True)
    copied: dict[str, str] = {}

    def add_copy(src: Path) -> None:
        if not src.is_file():
            return
        bn = src.name
        if bn in copied:
            return
        shutil.copy2(src, dest / bn)
        copied[bn] = f"/assets/{bn}"

    # 1) Todos os AoMR_*_icon.png sob Starts Build Order (pedido do utilizador)
    sb_root = notion_root / "Starts Build Order"
    if sb_root.is_dir():
        for dp, _, files in os.walk(sb_root):
            for f in files:
                if f.startswith("AoMR_") and "_icon" in f and f.endswith(".png"):
                    add_copy(Path(dp) / f)

    # 2) Recursos na raiz Aprendendo Age
    for name in ROOT_RESOURCE_NAMES:
        p = notion_root / name
        if p.is_file():
            add_copy(p)

    # 3) Favor em Termos (nome da pasta pode variar)
    for child in notion_root.iterdir():
        if child.is_dir() and "Termos" in child.name:
            p = child / "FavorAOM.png"
            if p.is_file():
                add_copy(p)
            break

    # 4) Para cada HTML de starts: basenames referenciados → procurar em todo o export
    if starts_dir.is_dir():
        all_bn: set[str] = set()
        for fp in starts_dir.glob("*.html"):
            text = fp.read_text(encoding="utf-8", errors="replace")
            all_bn |= collect_basenames_from_html(text)
        for bn in sorted(all_bn):
            if bn in copied:
                continue
            found = find_file_by_basename(notion_root, bn)
            if found:
                add_copy(found)

    return copied


def unwrap_notion_layout_divs(root: Tag) -> None:
    """Remove divs display:contents que o Notion coloca dentro de thead/tbody e quebram a tabela no browser."""
    for div in list(root.find_all("div")):
        st = div.get("style") or ""
        if "display:contents" in st and div.parent:
            div.unwrap()


def rewrite_img_src(soup_fragment: BeautifulSoup, asset_map: dict[str, str]) -> None:
    for img in soup_fragment.find_all("img"):
        src = img.get("src")
        if not src or src.startswith("http"):
            continue
        base = os.path.basename(unquote(src.split("?")[0]))
        if base in asset_map:
            img["src"] = asset_map[base]
        elif base.startswith("AoMR_") and "_icon" in base:
            img["src"] = f"/assets/{base}"


def extract_page_body_html(html: str, asset_map: dict[str, str]) -> str:
    soup = BeautifulSoup(html, "html.parser")
    body = soup.select_one("article .page-body") or soup.select_one(".page-body")
    if not body:
        return ""
    unwrap_notion_layout_divs(body)
    rewrite_img_src(body, asset_map)
    return str(body)


def build_starts(asset_map: dict[str, str]) -> list[dict]:
    if not STARTS_DIR.is_dir():
        return []
    rows: list[dict] = []
    files = sorted(STARTS_DIR.glob("*.html"), key=lambda p: p.name)
    for i, fp in enumerate(files, start=1):
        text = fp.read_text(encoding="utf-8", errors="replace")
        title = strip_html_title(text)
        notion_id = fp.stem.split()[-1] if " " in fp.stem else fp.stem
        conteudo_html = extract_page_body_html(text, asset_map)
        rows.append(
            {
                "id": i,
                "titulo": title,
                "notion_file_id": notion_id,
                "youtube": extract_youtube(text),
                "descricao_curta": "Sequência em tabela e notas exportadas do Notion.",
                "conteudo_html": conteudo_html,
            }
        )
    return rows


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    if not NOTION_APP.is_dir():
        print("Aviso: pasta Notion não encontrada:", NOTION_APP)
        asset_map = {}
    else:
        asset_map = copy_asset_map(NOTION_APP, STARTS_DIR, PUBLIC_ASSETS)
        print("Assets copiados:", len(asset_map), "ficheiros -> public/assets")

    starts = build_starts(asset_map)
    (DATA / "starts_build_order.json").write_text(
        json.dumps(starts, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("Wrote starts_build_order.json:", len(starts), "entries")


if __name__ == "__main__":
    main()
