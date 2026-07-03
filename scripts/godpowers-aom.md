# Pipeline de god powers (AoM Retold)

Extrai cooldown, custos, duração, ícone e descrição resumida do jogo para `godpowers.json`.

Fontes:
  - `gameplay/god_powers/*.godpowers` — stats e ícones
  - `gameplay/techtree.xml` — cooldown (`GodPower` effects)
  - `strings/*/string_table.txt` — nomes e descrições

## Scripts

| Comando npm | Script | Função |
|-------------|--------|--------|
| `npm run data:extract-godpowers` | `extract-godpowers-aom.py` | Extrai do Data.bar / cache |
| `npm run data:merge-godpowers` | `merge-godpowers-aom.py` | Atualiza PT e EN no catálogo |
| `npm run data:sync-aom` | `sync-aom-data.py` | Roda unidades + tecnologias + god powers |

## Uso

```bash
python scripts/extract-godpowers-aom.py --compare Bolt
python scripts/merge-godpowers-aom.py --power Bolt --dry-run
python scripts/merge-godpowers-aom.py --ids 1-92 --write
```

## Campos

**Preservados:** `id`, `god`, `era`, `panteao`, `descricao_avancada`

**Atualizados do jogo:** `nome`, `ingles`, `cooldown_seg`, `duracao_no_mapa_seg`, `custo_repetir`, `incremento_por_uso`, `descricao_resumida`, `icon`

## Aliases

Alguns nomes do catálogo divergem do proto no jogo, por exemplo:
- `PeachBlossomSpring` → `ThePeachBlossomSpring`
- `Plenty Vault` → `PlentyVault`
- `Fei Beasts` → `VenomBeast`
