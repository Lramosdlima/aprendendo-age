import { useMemo, useState } from "react";

import { EntityCard } from "@/components/ui/EntityCard";
import { MetaNotionLine } from "@/components/ui/MetaNotionLine";
import { NotionText } from "@/components/ui/NotionText";
import { PantheonMetaIcon } from "@/components/ui/PantheonMetaIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchField } from "@/components/ui/SearchField";
import { tecnologias, tecnologiaSlugByIndex } from "@/data/catalog";
import { pantheonCardTint } from "@/lib/pantheonCardTint";
import { getTecnologiaAssetUrl } from "@/lib/tecnologiaAssetUrl";

function matches(t: (typeof tecnologias)[number], q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [t.nome, t.beneficia ?? "", t.panteoes ?? "", t.eras ?? "", t.god_especifico ?? "", t.construcao_origem ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

export function TecnologiasPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => tecnologias.map((t, i) => ({ t, i })).filter(({ t }) => matches(t, q)),
    [q],
  );

  return (
    <div>
      <PageHeader
        title="Tecnologias"
        description="Melhorias e bônus — a lista é grande; use a busca. O slug vem do nome; títulos repetidos ganham sufixo (-2, -3…)."
      />
      <SearchField value={q} onChange={setQ} placeholder="Filtrar por nome, deus ou panteão…" id="tec-search" />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(({ t, i }) => (
          <li key={`${i}-${t.nome}`}>
            <EntityCard
              to={`/tecnologias/${tecnologiaSlugByIndex.get(i) ?? i}`}
              title={t.nome || `(sem título #${i})`}
              cardTint={pantheonCardTint(t.panteoes ?? "")}
              watermarkSrc={getTecnologiaAssetUrl(t)}
              subtitle={t.beneficia ? <NotionText text={t.beneficia} /> : undefined}
              meta={
                <span className="inline-flex flex-wrap items-baseline gap-x-0">
                  {t.panteoes_id != null ? <PantheonMetaIcon panteaoId={t.panteoes_id} /> : null}
                  <MetaNotionLine parts={[t.panteoes, t.eras]} />
                </span>
              }
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="mt-8 text-center text-sm text-zinc-500">Nenhum resultado.</p> : null}
    </div>
  );
}
