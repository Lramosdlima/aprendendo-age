import { useCallback, useMemo, useState } from "react";

import { StartStructuredContent } from "@/components/starts/StartStructuredContent";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  START_TABLE_ROW_TYPE_OPTIONS,
  type StartBuildOrder,
  type StartBuildSegment,
  type StartTableRow,
  deuses,
  panteoes,
  startBySlug,
  startsBuildOrder,
} from "@/data/catalog";
import { buildStartSlug } from "@/lib/startSlug";

const inputClass =
  "w-full rounded-lg border border-aom-border bg-aom-card px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/25";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeCell(v: string): string | null {
  const t = v.trim();
  return t.length ? t : null;
}

type EditorRow = {
  id: string;
  description: string;
  food: string;
  wood: string;
  gold: string;
  favor: string;
  pop: string;
  type: string;
};

type EditorLeadCallout = {
  id: string;
  text: string;
};

type EditorSegment = {
  id: string;
  heading: string;
  /** Vários callouts em sequência no `lead` (antes da tabela), como no JSON. */
  callouts: EditorLeadCallout[];
  footer: string;
  rows: EditorRow[];
};

function emptyRow(): EditorRow {
  return {
    id: uid(),
    description: "",
    food: "",
    wood: "",
    gold: "",
    favor: "",
    pop: "",
    type: "",
  };
}

/** Nova linha: copia food/wood/gold/favor/pop da linha anterior (descrição e tipo vazios). */
function newTableRowAfter(previous: EditorRow | undefined): EditorRow {
  if (!previous) return emptyRow();
  return {
    id: uid(),
    description: "",
    food: previous.food,
    wood: previous.wood,
    gold: previous.gold,
    favor: previous.favor,
    pop: previous.pop,
    type: "",
  };
}

function emptyLeadCallout(): EditorLeadCallout {
  return { id: uid(), text: "" };
}

function newLeadCalloutAfter(previous: EditorLeadCallout | undefined): EditorLeadCallout {
  if (!previous) return emptyLeadCallout();
  return { id: uid(), text: previous.text };
}

function emptySegment(): EditorSegment {
  return {
    id: uid(),
    heading: "",
    callouts: [emptyLeadCallout()],
    footer: "",
    rows: [emptyRow()],
  };
}

function segmentToStructured(seg: EditorSegment): StartBuildSegment {
  const lead: StartBuildSegment["lead"] = [];
  if (seg.heading.trim()) {
    lead.push({ kind: "heading", level: 1, text: seg.heading.trim() });
  }
  for (const c of seg.callouts) {
    if (c.text.trim()) {
      lead.push({ kind: "callout", text: c.text.trim() });
    }
  }
  const table: StartTableRow[] = seg.rows
    .filter((r) => r.description.trim())
    .map((r) => ({
      description: r.description.trim(),
      food: normalizeCell(r.food),
      wood: normalizeCell(r.wood),
      gold: normalizeCell(r.gold),
      favor: normalizeCell(r.favor),
      pop: normalizeCell(r.pop),
      type: r.type ? r.type : null,
    }));
  const footer: StartBuildSegment["footer"] = [];
  if (seg.footer.trim()) {
    footer.push({ kind: "paragraph", text: seg.footer.trim() });
  }
  return {
    lead: lead.length ? lead : undefined,
    table: table.length ? table : undefined,
    footer: footer.length ? footer : undefined,
  };
}

const deusesSorted = [...deuses].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));

export function SecretStartBuilderPage() {
  const [nome, setNome] = useState("");
  const [titulo, setTitulo] = useState("");
  const [youtubeText, setYoutubeText] = useState("");
  const [authors, setAuthors] = useState<string[]>([""]);
  const [godFilter, setGodFilter] = useState("");
  const [godsChecked, setGodsChecked] = useState<Record<number, boolean>>({});
  const [pantheon, setPantheon] = useState("");
  const [notionId, setNotionId] = useState("");
  const [slugOverride, setSlugOverride] = useState("");
  const [segments, setSegments] = useState<EditorSegment[]>([emptySegment()]);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  const maxStartId = useMemo(() => Math.max(0, ...startsBuildOrder.map((s) => s.id)), []);

  const filteredDeuses = useMemo(() => {
    const q = godFilter.trim().toLowerCase();
    if (!q) return deusesSorted;
    return deusesSorted.filter((d) => d.nome.toLowerCase().includes(q));
  }, [godFilter]);

  const godNamesSelected = useMemo(
    () => deusesSorted.filter((d) => godsChecked[d.id]).map((d) => d.nome),
    [godsChecked],
  );

  const structuredPreview = useMemo(
    () => ({ segments: segments.map(segmentToStructured).filter((s) => s.lead?.length || s.table?.length || s.footer?.length) }),
    [segments],
  );

  const builtStart = useMemo((): StartBuildOrder | null => {
    const t = titulo.trim();
    if (!t) return null;
    const author = authors.map((a) => a.trim()).filter(Boolean);
    const youtube = youtubeText
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    const segs = segments.map(segmentToStructured).filter((s) => s.lead?.length || s.table?.length || s.footer?.length);
    if (!segs.some((s) => (s.table?.length ?? 0) > 0)) return null;

    const base: Omit<StartBuildOrder, "slug"> = {
      id: maxStartId + 1,
      titulo: t,
      author,
      god: godNamesSelected,
      notion_file_id: notionId.trim() || "00000000000000000000000000000000",
      youtube,
      descricao_curta: nome.trim() || "Rascunho gerado pelo builder secreto.",
      structured: { segments: segs },
    };
    const slug = slugOverride.trim() ? slugifyManual(slugOverride) : buildStartSlug(base) || "start";
    const out: StartBuildOrder = {
      ...base,
      slug,
    };
    if (pantheon.trim()) {
      out.pantheon = pantheon.trim();
    }
    return out;
  }, [titulo, authors, youtubeText, godNamesSelected, segments, nome, notionId, slugOverride, pantheon, maxStartId]);

  const slugPreview = builtStart?.slug ?? "";
  const slugCollision = slugPreview && startBySlug.has(slugPreview);

  const jsonText = useMemo(() => (builtStart ? JSON.stringify(builtStart, null, 2) : ""), [builtStart]);

  const reorderSegments = useCallback((from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setSegments((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }, []);

  const copyJson = useCallback(async () => {
    if (!jsonText) return;
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopyState("ok");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("err");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  }, [jsonText]);

  const downloadJson = useCallback(() => {
    if (!builtStart || !jsonText) return;
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${builtStart.slug || "start"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [builtStart, jsonText]);

  return (
    <div className="pb-16">
      <BackLink to="/">Início</BackLink>
      <PageHeader
        title="Builder secreto de starts"
        description="Apenas por URL. Gera um objeto JSON para colar em starts_build_order.json (o site não grava arquivo no disco). Campos nome e título: nome → descrição curta da página; título → titulo do card e da entrada."
      />

      <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-8">
          <section className="rounded-xl border border-aom-border bg-aom-card/40 p-4 sm:p-5">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-amber-100/95">
              Metadados
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-400">Nome (descrição curta / subtítulo)</span>
                <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Rush com 2 aldeões no ouro" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-400">Título</span>
                <input className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Zeus - por Fulano" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-400">YouTube (URLs, uma por linha ou separadas por vírgula)</span>
                <textarea
                  className={cnTextarea()}
                  value={youtubeText}
                  onChange={(e) => setYoutubeText(e.target.value)}
                  rows={3}
                  placeholder="https://youtu.be/..."
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-400">ID Notion (opcional, 32 hex)</span>
                <input className={inputClass} value={notionId} onChange={(e) => setNotionId(e.target.value)} placeholder="00000000000000000000000000000000" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-400">Slug manual (opcional)</span>
                <input
                  className={inputClass}
                  value={slugOverride}
                  onChange={(e) => setSlugOverride(e.target.value)}
                  placeholder="Deixe vazio para gerar a partir do título e autores"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-400">Panteão (opcional, como em panteoes.json)</span>
                <select className={inputClass} value={pantheon} onChange={(e) => setPantheon(e.target.value)}>
                  <option value="">—</option>
                  {panteoes.map((p) => (
                    <option key={p.id} value={p.nome}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-aom-border bg-aom-card/40 p-4 sm:p-5">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-amber-100/95">Autores</h2>
            <ul className="space-y-2">
              {authors.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={a}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAuthors((prev) => prev.map((x, j) => (j === i ? v : x)));
                    }}
                    placeholder={`Autor ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-zinc-600 px-2 text-xs text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setAuthors((prev) => prev.filter((_, j) => j !== i))}
                    disabled={authors.length <= 1}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 rounded-lg border border-amber-600/50 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-500/20"
              onClick={() => setAuthors((prev) => [...prev, ""])}
            >
              + Autor
            </button>
          </section>

          <section className="rounded-xl border border-aom-border bg-aom-card/40 p-4 sm:p-5">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-amber-100/95">Deuses (god)</h2>
            <input
              className={`${inputClass} mb-3`}
              value={godFilter}
              onChange={(e) => setGodFilter(e.target.value)}
              placeholder="Filtrar por nome…"
            />
            <div className="max-h-56 overflow-y-auto rounded-lg border border-aom-border/80 p-2">
              <ul className="grid gap-1 sm:grid-cols-2">
                {filteredDeuses.map((d) => (
                  <li key={d.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-zinc-800/60">
                      <input
                        type="checkbox"
                        checked={!!godsChecked[d.id]}
                        onChange={(e) =>
                          setGodsChecked((prev) => ({
                            ...prev,
                            [d.id]: e.target.checked,
                          }))
                        }
                      />
                      <span className="truncate text-zinc-200">{d.nome}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-aom-border bg-aom-card/40 p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-amber-100/95">Segmentos</h2>
              <button
                type="button"
                className="rounded-lg border border-amber-600/50 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-500/20"
                onClick={() => setSegments((prev) => [...prev, emptySegment()])}
              >
                + Segmento
              </button>
            </div>
            <p className="mb-4 text-xs text-zinc-500">
              Arraste pelo ícone ⋮⋮ à esquerda para reordenar. Cada segmento pode ter título (heading), vários callouts antes da tabela, a tabela e rodapé opcional.
              Tipos de linha da tabela: os mesmos usados em{" "}
              <code className="text-zinc-400">starts_build_order.json</code> (hint, blue, pink, …).
            </p>
            <ul className="space-y-4">
              {segments.map((seg, si) => (
                <li
                  key={seg.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const raw = e.dataTransfer.getData("text/plain");
                    const from = Number.parseInt(raw, 10);
                    if (Number.isNaN(from) || from === si) return;
                    reorderSegments(from, si);
                  }}
                  className="rounded-xl border border-zinc-700/80 bg-zinc-950/40 p-3"
                >
                  <div className="mb-2 flex items-start gap-2">
                    <span
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(si));
                      }}
                      className="cursor-grab select-none px-1.5 py-2 text-zinc-500 active:cursor-grabbing"
                      title="Arrastar para reordenar"
                      role="button"
                      tabIndex={0}
                    >
                      ⋮⋮
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        className={inputClass}
                        value={seg.heading}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSegments((prev) => prev.map((s, j) => (j === si ? { ...s, heading: v } : s)));
                        }}
                        placeholder="Título do segmento (heading nível 1), opcional"
                      />
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-zinc-400">Callouts antes da tabela (opcional)</span>
                        {seg.callouts.map((c, ci) => (
                          <div key={c.id} className="rounded-lg border border-aom-border/60 bg-aom-card/25 p-2">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs text-zinc-500">Callout {ci + 1}</span>
                              <button
                                type="button"
                                className="rounded border border-zinc-600 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800"
                                onClick={() =>
                                  setSegments((prev) =>
                                    prev.map((s, j) =>
                                      j === si
                                        ? {
                                            ...s,
                                            callouts:
                                              s.callouts.length <= 1 ? s.callouts : s.callouts.filter((_, k) => k !== ci),
                                          }
                                        : s,
                                    ),
                                  )
                                }
                                disabled={seg.callouts.length <= 1}
                              >
                                Remover callout
                              </button>
                            </div>
                            <textarea
                              className={cnTextarea()}
                              value={c.text}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSegments((prev) =>
                                  prev.map((s, j) =>
                                    j === si
                                      ? {
                                          ...s,
                                          callouts: s.callouts.map((x, k) => (k === ci ? { ...x, text: v } : x)),
                                        }
                                      : s,
                                  ),
                                );
                              }}
                              rows={2}
                              placeholder="Texto do callout (:tokens:, mini-markup…)"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-sm text-amber-200/90 underline-offset-2 hover:underline"
                          onClick={() =>
                            setSegments((prev) =>
                              prev.map((s, j) => {
                                if (j !== si) return s;
                                const last = s.callouts[s.callouts.length - 1];
                                return { ...s, callouts: [...s.callouts, newLeadCalloutAfter(last)] };
                              }),
                            )
                          }
                        >
                          + Callout
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded border border-red-900/60 px-2 py-1 text-xs text-red-300 hover:bg-red-950/40"
                      onClick={() => setSegments((prev) => (prev.length <= 1 ? prev : prev.filter((_, j) => j !== si)))}
                    >
                      Remover segmento
                    </button>
                  </div>

                  <div className="ml-8 space-y-2 border-l border-zinc-700/60 pl-3">
                    {seg.rows.map((row, ri) => (
                      <div key={row.id} className="rounded-lg border border-aom-border/60 bg-aom-card/30 p-2">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-zinc-500">Linha {ri + 1}</span>
                          <label className="ml-auto flex items-center gap-1 text-xs text-zinc-400">
                            Tipo
                            <select
                              className={`${inputClass} !py-1 text-xs`}
                              value={row.type}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSegments((prev) =>
                                  prev.map((s, j) =>
                                    j === si
                                      ? {
                                          ...s,
                                          rows: s.rows.map((r, k) => (k === ri ? { ...r, type: v } : r)),
                                        }
                                      : s,
                                  ),
                                );
                              }}
                            >
                              {START_TABLE_ROW_TYPE_OPTIONS.map((o) => (
                                <option key={o.value || "null"} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            className="rounded border border-zinc-600 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800"
                            onClick={() =>
                              setSegments((prev) =>
                                prev.map((s, j) =>
                                  j === si
                                    ? {
                                        ...s,
                                        rows: s.rows.length <= 1 ? s.rows : s.rows.filter((_, k) => k !== ri),
                                      }
                                    : s,
                                ),
                              )
                            }
                            disabled={seg.rows.length <= 1}
                          >
                            Remover linha
                          </button>
                        </div>
                        <input
                          className={`${inputClass} mb-1`}
                          value={row.description}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSegments((prev) =>
                              prev.map((s, j) =>
                                j === si ? { ...s, rows: s.rows.map((r, k) => (k === ri ? { ...r, description: v } : r)) } : s,
                              ),
                            );
                          }}
                          placeholder="Descrição (mini-markup / :aomr_…:)"
                        />
                        <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
                          {(["food", "wood", "gold", "favor", "pop"] as const).map((field) => (
                            <input
                              key={field}
                              className={`${inputClass} !py-1.5 text-xs`}
                              value={row[field]}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSegments((prev) =>
                                  prev.map((s, j) =>
                                    j === si
                                      ? { ...s, rows: s.rows.map((r, k) => (k === ri ? { ...r, [field]: v } : r)) }
                                      : s,
                                  ),
                                );
                              }}
                              placeholder={field}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-sm text-amber-200/90 underline-offset-2 hover:underline"
                      onClick={() =>
                        setSegments((prev) =>
                          prev.map((s, j) => {
                            if (j !== si) return s;
                            const last = s.rows[s.rows.length - 1];
                            return { ...s, rows: [...s.rows, newTableRowAfter(last)] };
                          }),
                        )
                      }
                    >
                      + Linha na tabela
                    </button>
                  </div>

                  <label className="ml-8 mt-2 block border-l border-zinc-700/60 pl-3">
                    <span className="mb-1 block text-xs text-zinc-500">Rodapé do segmento (parágrafo, opcional)</span>
                    <textarea
                      className={cnTextarea()}
                      value={seg.footer}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSegments((prev) => prev.map((s, j) => (j === si ? { ...s, footer: v } : s)));
                      }}
                      rows={2}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-aom-border bg-aom-card/40 p-4 sm:p-5">
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-base font-semibold text-amber-100/95">Exportar</h2>
            <p className="mb-3 text-sm text-zinc-400">
              Próximo <code className="text-zinc-500">id</code> sugerido: <strong className="text-zinc-200">{maxStartId + 1}</strong>. Ajuste no JSON se já tiver adicionado entradas.
            </p>
            {slugCollision ? (
              <p className="mb-2 text-sm text-amber-300">Atenção: o slug «{slugPreview}» já existe em starts_build_order.json.</p>
            ) : null}
            {!builtStart ? (
              <p className="text-sm text-zinc-500">Preencha o título e pelo menos uma linha de tabela com descrição para gerar o JSON.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500"
                  onClick={() => void copyJson()}
                >
                  Copiar JSON
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-aom-border px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
                  onClick={downloadJson}
                >
                  Baixar .json
                </button>
                {copyState === "ok" ? <span className="self-center text-sm text-emerald-400">Copiado.</span> : null}
                {copyState === "err" ? <span className="self-center text-sm text-red-400">Não foi possível copiar.</span> : null}
              </div>
            )}
          </section>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-sm font-semibold text-amber-100/90">Pré-visualização</h2>
          {structuredPreview.segments.length ? (
            <div className="rounded-xl border border-aom-border bg-zinc-950/50 p-3">
              <StartStructuredContent segments={structuredPreview.segments} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Adicione conteúdo a um segmento para ver a tabela aqui.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function cnTextarea(): string {
  return `${inputClass} min-h-[4.5rem] resize-y font-mono text-[13px] leading-snug`;
}

/** Slug digitado livremente: só normaliza espaços e barras. */
function slugifyManual(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
