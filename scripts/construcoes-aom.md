# Pipeline de construções (AoM Retold)

Extrai stats, custos, tempo de construção, ícone e ataque de prédios do `proto.xml`.

## Scripts

| Comando npm | Script | Função |
|-------------|--------|--------|
| `npm run data:extract-construcoes` | `extract-construcoes-aom.py` | Extrai do cache |
| `npm run data:merge-construcoes` | `merge-construcoes-aom.py` | Atualiza PT e EN |
| `npm run data:sync-aom` | `sync-aom-data.py` | Roda todos os catálogos |

## Uso

```bash
python scripts/extract-construcoes-aom.py --compare "Town Center"
python scripts/merge-construcoes-aom.py --ids 1-10 --dry-run
python scripts/merge-construcoes-aom.py --ids 1-80 --write
```

## Campos

**Preservados:** `id`, `nome`, `tipo`, `panteao`, `panteao_id`, `era`, `era_id`, `tecnologias`, `tecnologias_ids`, `unidades`, `unidades_ids`, `ingles`

**Atualizados do jogo:** stats de combate, armaduras, custos, `custo`, `guarnicao`, `tempo_construir_segundos`, `no_projeteis`, `icon` (por cultura/`panteao_id`)

## Aliases

- `Wooden Wall` → `WallShort`
- `OX` → `OxCartBuilding`

Prédios compartilhados entre pantões (ex.: `TownCenter`) usam o mesmo proto; o ícone é escolhido pelo `panteao_id` do catálogo.
