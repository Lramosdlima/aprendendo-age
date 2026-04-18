import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { deusById, eraById, godpowerById, panteaoById, unidadeById } from "@/data/catalog";
import { getDeusAssetUrl } from "@/lib/deusAssetUrl";
import { parseStartReferences } from "@/lib/startLinksFromDeus";

export function DeusDetailPage() {
  const { id } = useParams();
  const d = deusById.get(Number(id));

  if (!d) {
    return (
      <div>
        <BackLink to="/deuses">Deuses</BackLink>
        <p className="text-zinc-400">Deus não encontrado.</p>
      </div>
    );
  }

  const deusIcon = getDeusAssetUrl(d.nome);

  const panteao = d.panteao_id != null ? panteaoById.get(d.panteao_id) : undefined;
  const era = d.era_id != null ? eraById.get(d.era_id) : undefined;
  const gp = d.godpower_id != null ? godpowerById.get(d.godpower_id) : undefined;

  const relacoes = (d.god_maior_relacao_ids ?? [])
    .map((rid) => {
      const x = deusById.get(rid);
      return x ? (
        <Link key={rid} to={`/deuses/${rid}`} className="text-amber-200 underline-offset-2 hover:underline">
          {x.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  const unidadesEx = (d.unidades_exclusivas_ids ?? [])
    .map((uid) => {
      const u = unidadeById.get(uid);
      return u ? (
        <Link key={uid} to={`/unidades/${uid}`} className="text-amber-200 underline-offset-2 hover:underline">
          {u.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div>
      <BackLink to="/deuses">Deuses</BackLink>
      <PageHeader
        title={d.nome}
        description={[d.hierarquia, d.panteao].filter(Boolean).join(" · ")}
        headerIconSrc={deusIcon}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Visão geral">
          <div className="space-y-0">
            {panteao ? (
              <InfoRow label="Panteão">
                <Link to={`/panteoes/${panteao.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                  {panteao.nome}
                </Link>
              </InfoRow>
            ) : d.panteao ? (
              <InfoRow label="Panteão (texto)">
                <NotionText text={d.panteao} />
              </InfoRow>
            ) : null}
            {d.hierarquia ? <InfoRow label="Hierarquia">{d.hierarquia}</InfoRow> : null}
            {era ? (
              <InfoRow label="Era">
                <Link to={`/eras/${era.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                  {era.nome}
                </Link>
              </InfoRow>
            ) : d.era ? (
              <InfoRow label="Era">
                <NotionText text={d.era} />
              </InfoRow>
            ) : null}
            {gp ? (
              <InfoRow label="Poder divino">
                <Link to={`/poderes/${gp.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                  {gp.nome}
                </Link>
              </InfoRow>
            ) : d.godpower ? (
              <InfoRow label="Poder divino">
                <NotionText text={d.godpower} />
              </InfoRow>
            ) : null}
          </div>
        </Section>

        <Section title="Avaliação (builds)">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-zinc-900/80 p-3">
              <div className="text-xs uppercase text-zinc-500">Rush</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-100">{d.rush ?? "—"}</div>
            </div>
            <div className="rounded-lg bg-zinc-900/80 p-3">
              <div className="text-xs uppercase text-zinc-500">Turtle</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-100">{d.turtle ?? "—"}</div>
            </div>
            <div className="rounded-lg bg-zinc-900/80 p-3">
              <div className="text-xs uppercase text-zinc-500">Eco</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-amber-100">{d.eco ?? "—"}</div>
            </div>
          </div>
          {d.foco ? (
            <p className="mt-4 text-sm">
              <span className="text-zinc-500">Foco: </span>
              <NotionText text={d.foco} />
            </p>
          ) : null}
        </Section>
      </div>

      {d.starts ? (
        <Section title="Starts (referências)" className="mt-6">
          <ul className="list-inside list-disc space-y-2 text-sm">
            {parseStartReferences(d.starts).map((item, i) => (
              <li key={i}>
                {item.kind === "link" ? (
                  <Link to={`/starts/${item.id}`} className="text-amber-200 underline-offset-2 hover:underline">
                    <NotionText text={item.titulo} />
                  </Link>
                ) : (
                  <NotionText text={item.raw} />
                )}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {relacoes.length > 0 ? (
        <Section title="Deuses Menores" className="mt-6">
          <ul className="list-inside list-disc space-y-1">
            {relacoes.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </Section>
      ) : d.god_maior_relacao ? (
        <Section title="Deuses Menores" className="mt-6">
          <NotionText text={d.god_maior_relacao} />
        </Section>
      ) : null}

      {d.tecnologias ? (
        <Section title="Tecnologias" className="mt-6">
          <NotionText text={d.tecnologias} />
        </Section>
      ) : null}

      {unidadesEx.length > 0 ? (
        <Section title="Unidades exclusivas" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {unidadesEx.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </Section>
      ) : d.unidades_exclusivas ? (
        <Section title="Unidades exclusivas (texto)" className="mt-6">
          <NotionText text={d.unidades_exclusivas} />
        </Section>
      ) : null}
    </div>
  );
}
