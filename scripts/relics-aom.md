# Pipeline de relíquias (AoM Retold)

Extrai nomes, descrições e ícones do jogo para `reliquias.json`.

Fontes:
  - `gameplay/techtree.xml` — techs `Relic*` (type Normal)
  - `strings/*/string_table.txt` — nomes (`STR_RLC_TECH_*_NAME`), resumo (`*_LR`) e mensagem (`*_SELF`)
  - `game/ui/UITextureCache.bar` — ícones DDS em `resources/nature/relics/`

## Scripts

| Comando npm | Script | Função |
|-------------|--------|--------|
| `npm run data:extract-relics` | `extract-relics-aom.py` | Extrai do Data.bar / cache |
| `npm run data:merge-relics` | `merge-relics-aom.py` | Atualiza PT e EN + ícones em `public/assets/relics` |
| `npm run data:sync-aom` | `sync-aom-data.py` | Inclui `reliquias` no sync geral |

## Uso

```bash
python scripts/extract-relics-aom.py --compare "Ankh of Ra"
python scripts/merge-relics-aom.py --bootstrap --write
python scripts/merge-relics-aom.py --ids 1-114 --write
python scripts/sync-aom-data.py --only reliquias --write
```

## Campos

**Preservados:** `id`

**Atualizados do jogo:** `nome`, `ingles`, `descricao_resumida`, `descricao_avancada`, `icon`

**Ícones:** exportados para `public/assets/relics/` e mapeados em `token_asset_map.json`.
