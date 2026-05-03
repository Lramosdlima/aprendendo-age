import { Link, useParams } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { InfoRow } from "@/components/ui/InfoRow";
import { NotionText } from "@/components/ui/NotionText";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { deusById, deusSlugById, panteaoBySlug } from "@/data/catalog";
import { cn } from "@/lib/cn";

export function PanteaoDetailPage() {
  const { slug } = useParams();
  const p = slug ? panteaoBySlug.get(slug) : undefined;

  if (!p) {
    return (
      <div>
        <BackLink to="/panteoes">Panteões</BackLink>
        <p className="text-zinc-400">Panteão não encontrado.</p>
      </div>
    );
  }

  const heroBackground =
    "hero_background" in p && typeof p.hero_background === "string" ? p.hero_background : undefined;

  const deusLinks = (p.deuses_ids ?? [])
    .map((did) => {
      const d = deusById.get(did);
      return d ? (
        <Link
          key={did}
          to={`/deuses/${deusSlugById.get(did) ?? did}`}
          className="text-amber-200 underline-offset-2 hover:underline"
        >
          {d.nome}
        </Link>
      ) : null;
    })
    .filter(Boolean);

  const sectionOnHeroClass =
    heroBackground &&
    "border-aom-border/90 bg-aom-card/75 shadow-black/25 backdrop-blur-[2px]";

  return (
    <div
      className={cn(
        heroBackground &&
          "relative isolate -mx-4 -mt-6 -mb-6 grid min-h-[100dvh] grid-cols-1 md:-mx-10 md:-mb-10 md:-mt-10",
      )}
    >
      {heroBackground ? (
        <>
          {/*
            Base opaca: quando a célula da grid é mais alta que a arte, evita faixa
            “vazia”/preta por baixo dos gradientes semi-transparentes.
          */}
          <div
            className="pointer-events-none -z-[12] col-start-1 row-start-1 w-full min-w-0 self-stretch bg-zinc-950"
            aria-hidden
          />
          {/*
            Imagem em largura total com altura intrínseca (sem crop). A linha da grid
            fica max(altura da arte, altura do conteúdo, min-h da página).
          */}
          <img
            src={heroBackground}
            alt=""
            decoding="async"
            className="pointer-events-none -z-10 col-start-1 row-start-1 block h-auto w-full max-w-full select-none self-start"
            aria-hidden
          />
          <div
            className="pointer-events-none -z-[9] col-start-1 row-start-1 w-full min-w-0 self-stretch bg-gradient-to-b from-zinc-950/88 via-zinc-950/78 to-zinc-950"
            aria-hidden
          />
          <div
            className="pointer-events-none -z-[8] col-start-1 row-start-1 w-full min-w-0 self-stretch bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(245,158,11,0.08),transparent)]"
            aria-hidden
          />
        </>
      ) : null}

      <div
        className={cn(
          "space-y-6",
          heroBackground &&
            "relative z-10 col-start-1 row-start-1 min-h-[100dvh] self-start px-4 pb-10 pt-1 md:px-10",
        )}
      >
        <BackLink to="/panteoes">Panteões</BackLink>

        {heroBackground ? (
          <header className="space-y-2" aria-labelledby="panteao-detail-heading">
            <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.18em] text-amber-400/90">
              Panteão
            </p>
            <h1
              id="panteao-detail-heading"
              className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-amber-50 sm:text-4xl md:text-5xl"
            >
              {p.nome}
            </h1>
          </header>
        ) : (
          <PageHeader title={p.nome} />
        )}

        {p.description ? (
          <Section title="Descrição" className={cn(sectionOnHeroClass)}>
            <NotionText text={p.description} />
          </Section>
        ) : null}
        {"dois_tipos_de_trabalhadores_alimentam_esse_crescimento" in p &&
        p.dois_tipos_de_trabalhadores_alimentam_esse_crescimento ? (
          <Section title="Trabalhadores" className={cn(sectionOnHeroClass)}>
            <NotionText text={p.dois_tipos_de_trabalhadores_alimentam_esse_crescimento} />
          </Section>
        ) : null}

        <div
          className={cn(
            "space-y-0 rounded-2xl border border-aom-border bg-aom-card/60 p-5 shadow-sm shadow-black/20",
            heroBackground && "border-aom-border/90 bg-aom-card/75 shadow-black/25 backdrop-blur-[2px]",
          )}
        >
          {p.vill ? (
            <InfoRow label="Aldeão">
              <NotionText text={String(p.vill)} />
            </InfoRow>
          ) : null}
          {p.starts ? (
            <InfoRow label="Starts (referências)">
              <NotionText text={p.starts} />
            </InfoRow>
          ) : null}
          {deusLinks.length > 0 ? (
            <InfoRow label="Deuses (links)">
              <span className="flex flex-wrap gap-x-2 gap-y-1">
                {deusLinks.map((el, i) => (
                  <span key={i}>
                    {el}
                    {i < deusLinks.length - 1 ? "," : ""}
                  </span>
                ))}
              </span>
            </InfoRow>
          ) : null}
        </div>
      </div>
    </div>
  );
}
