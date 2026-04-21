"""
Extrai o corpo explicativo (page-body) dos HTML exportados do Notion para deuses maiores,
converte <img alt="token"> em :token: e gera JSON para colar em deuses_aom.json.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
DEUSES_JSON = ROOT / "src" / "data" / "deuses_aom.json"
NOTION_DEUSES = (
    ROOT.parent
    / "Notion Aprendendo Age"
    / "Aprendendo Age"
    / "Deuses AoM"
)


def element_to_notion_text(node: Tag | NavigableString) -> str:
    """Converte nó HTML inline para string com :tokens: para ícones."""
    if isinstance(node, NavigableString):
        t = str(node)
        return html.unescape(t.replace("\xa0", " "))

    if not isinstance(node, Tag):
        return ""

    if node.name == "img":
        alt = (node.get("alt") or "").strip()
        if not alt:
            return ""
        return f":{alt.lower()}:"

    if node.name in ("br",):
        return " "

    # ignora scripts / desconhecido: só filhos
    parts: list[str] = []
    for child in node.children:
        parts.append(element_to_notion_text(child))
    return "".join(parts)


def normalize_ws(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    return s


def merge_adjacent_listas(blocks: list[dict]) -> list[dict]:
    """Junta blocos `lista` consecutivos (export Notion: um <ul> por linha)."""
    out: list[dict] = []
    for b in blocks:
        if b["tipo"] == "lista" and out and out[-1]["tipo"] == "lista":
            out[-1]["itens"].extend(b["itens"])
        else:
            out.append(b)
    return out


def parse_page_body(soup: BeautifulSoup) -> list[dict]:
    body = soup.select_one("div.page-body")
    if not body:
        return []

    blocks: list[dict] = []
    stop_body = False

    # Ordem: filhos diretos são wrappers display:contents
    for wrapper in body.children:
        if stop_body:
            break
        if not isinstance(wrapper, Tag):
            continue
        for el in wrapper.children:
            if not isinstance(el, Tag):
                continue
            name = el.name.lower()
            if name == "blockquote":
                texto = normalize_ws(element_to_notion_text(el))
                if texto:
                    blocks.append({"tipo": "citacao", "texto": texto})
            elif name == "ul":
                itens: list[str] = []
                for li in el.find_all("li", recursive=False):
                    t = normalize_ws(element_to_notion_text(li))
                    if t:
                        itens.append(t)
                if itens:
                    blocks.append({"tipo": "lista", "itens": itens})
            elif name == "h3":
                titulo = normalize_ws(element_to_notion_text(el))
                if titulo.lower() == "starts":
                    stop_body = True
                    break
                if titulo:
                    blocks.append({"tipo": "titulo", "texto": titulo})
            elif name == "p":
                texto = normalize_ws(element_to_notion_text(el))
                if texto:
                    blocks.append({"tipo": "paragrafo", "texto": texto})

    return merge_adjacent_listas(blocks)


def find_html_for_god(nome: str) -> Path | None:
    if not NOTION_DEUSES.is_dir():
        print(f"Pasta não encontrada: {NOTION_DEUSES}", file=sys.stderr)
        return None
    prefix = nome + " "
    for p in sorted(NOTION_DEUSES.glob("*.html")):
        if p.name.startswith(prefix):
            return p
    return None


def main() -> None:
    data = json.loads(DEUSES_JSON.read_text(encoding="utf-8"))
    majors = [d for d in data if d.get("hierarquia") == "Maior"]
    out: dict[int, list[dict]] = {}
    missing: list[str] = []

    for d in majors:
        nid = d["id"]
        nome = d["nome"]
        path = find_html_for_god(nome)
        if not path:
            missing.append(f"{nid} {nome}")
            continue
        html_text = path.read_text(encoding="utf-8", errors="replace")
        soup = BeautifulSoup(html_text, "html.parser")
        blocks = parse_page_body(soup)
        if not blocks:
            missing.append(f"{nid} {nome} (sem page-body)")
            continue
        out[nid] = blocks

    # imprime relatório e JSON por id para merge manual
    print("=== IDs com conteúdo ===")
    for nid in sorted(out.keys()):
        print(nid, len(out[nid]), "blocos")

    if missing:
        print("\n=== Sem ficheiro ou vazio ===", file=sys.stderr)
        for m in missing:
            print(m, file=sys.stderr)

    patch_path = ROOT / "scripts" / "deus_explicacao_maior.generated.json"
    patch_path.write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"\nEscrito: {patch_path}")


if __name__ == "__main__":
    main()
