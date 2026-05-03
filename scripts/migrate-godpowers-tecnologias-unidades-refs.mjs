/**
 * Migra `godpowers.json`, `tecnologias.json`, `unidades_aom.json`:
 * cada `*_id` / `*_ids` vira array de `{ id, nome }` no campo base (sem sufixo _id).
 * Executar: node scripts/migrate-godpowers-tecnologias-unidades-refs.mjs
 */
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, root), "utf8"));
const write = (p, data) => fs.writeFileSync(new URL(p, root), JSON.stringify(data, null, 2) + "\n", "utf8");

const construcoes = read("src/data/construcoes.json");
const eras = read("src/data/eras.json");
const deuses = read("src/data/deuses_aom.json");
const panteoes = read("src/data/panteoes.json");

const construcaoById = new Map(construcoes.map((c) => [c.id, c]));
const eraById = new Map(eras.map((e) => [e.id, e]));
const deusById = new Map(deuses.map((d) => [d.id, d]));
const panteaoById = new Map(panteoes.map((p) => [p.id, p]));

function splitCsv(s) {
  return String(s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function zipIdsToRefs(ids, names, lookup) {
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    let nome = names[i];
    if (nome == null || nome === "") {
      const row = lookup?.get?.(id);
      nome = row?.nome ?? String(id);
    }
    out.push({ id, nome });
  }
  return out;
}

function migrateGodpowers(list) {
  return list.map((g) => {
    const o = { ...g };
    if (g.god_id != null) {
      o.god = [{ id: g.god_id, nome: g.god ?? deusById.get(g.god_id)?.nome ?? String(g.god_id) }];
      delete o.god_id;
    }
    if (g.era_id != null) {
      o.era = [{ id: g.era_id, nome: g.era ?? eraById.get(g.era_id)?.nome ?? String(g.era_id) }];
      delete o.era_id;
    }
    if (g.panteao_id != null) {
      o.panteao = [{ id: g.panteao_id, nome: g.panteao ?? panteaoById.get(g.panteao_id)?.nome ?? String(g.panteao_id) }];
      delete o.panteao_id;
    }
    return o;
  });
}

function migrateTecnologias(list) {
  return list.map((t) => {
    const o = { ...t };

    if (t.eras_id != null) {
      o.eras = [{ id: t.eras_id, nome: t.eras ?? eraById.get(t.eras_id)?.nome ?? String(t.eras_id) }];
      delete o.eras_id;
    }

    if (Array.isArray(t.construcao_origem_ids) && t.construcao_origem_ids.length) {
      const parts = splitCsv(t.construcao_origem);
      o.construcao_origem = zipIdsToRefs(t.construcao_origem_ids, parts, construcaoById);
      delete o.construcao_origem_ids;
    } else if (t.construcao_origem_id != null) {
      const nome = t.construcao_origem ?? construcaoById.get(t.construcao_origem_id)?.nome ?? String(t.construcao_origem_id);
      o.construcao_origem = [{ id: t.construcao_origem_id, nome }];
      delete o.construcao_origem_id;
    }

    if (t.panteoes_id != null) {
      o.panteoes = [{ id: t.panteoes_id, nome: t.panteoes ?? panteaoById.get(t.panteoes_id)?.nome ?? String(t.panteoes_id) }];
      delete o.panteoes_id;
    }

    if (Array.isArray(t.god_especifico_ids) && t.god_especifico_ids.length) {
      const parts = splitCsv(t.god_especifico);
      o.god_especifico = zipIdsToRefs(t.god_especifico_ids, parts, deusById);
      delete o.god_especifico_ids;
    } else if (t.god_especifico_id != null) {
      const nome = t.god_especifico ?? deusById.get(t.god_especifico_id)?.nome ?? String(t.god_especifico_id);
      o.god_especifico = [{ id: t.god_especifico_id, nome }];
      delete o.god_especifico_id;
    }

    return o;
  });
}

function migrateUnidades(list) {
  return list.map((u) => {
    const o = { ...u };

    if (u.era_id != null) {
      o.era = [{ id: u.era_id, nome: u.era ?? eraById.get(u.era_id)?.nome ?? String(u.era_id) }];
      delete o.era_id;
    }

    if (u.panteao_id != null) {
      o.panteao = [{ id: u.panteao_id, nome: u.panteao ?? panteaoById.get(u.panteao_id)?.nome ?? String(u.panteao_id) }];
      delete o.panteao_id;
    }

    if (Array.isArray(u.construcao_ids) && u.construcao_ids.length) {
      const parts = splitCsv(u.construcao);
      o.construcao = zipIdsToRefs(u.construcao_ids, parts, construcaoById);
      delete o.construcao_ids;
    } else if (u.construcao_id != null) {
      const nome = u.construcao ?? construcaoById.get(u.construcao_id)?.nome ?? String(u.construcao_id);
      o.construcao = [{ id: u.construcao_id, nome }];
      delete o.construcao_id;
    }

    if (Array.isArray(u.god_dono_ids) && u.god_dono_ids.length) {
      const parts = splitCsv(u.god_dono);
      o.god_dono = zipIdsToRefs(u.god_dono_ids, parts, deusById);
      delete o.god_dono_ids;
    } else if (u.god_dono_id != null) {
      const nome = u.god_dono ?? deusById.get(u.god_dono_id)?.nome ?? String(u.god_dono_id);
      o.god_dono = [{ id: u.god_dono_id, nome }];
      delete o.god_dono_id;
    }

    return o;
  });
}

const godpowers = read("src/data/godpowers.json");
const tecnologias = read("src/data/tecnologias.json");
const unidades = read("src/data/unidades_aom.json");

write("src/data/godpowers.json", migrateGodpowers(godpowers));
write("src/data/tecnologias.json", migrateTecnologias(tecnologias));
write("src/data/unidades_aom.json", migrateUnidades(unidades));

console.log("OK: godpowers", godpowers.length, "tecnologias", tecnologias.length, "unidades", unidades.length);
