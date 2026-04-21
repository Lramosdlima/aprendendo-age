import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { EntityCard } from "@/components/ui/EntityCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { trilhaShared } from "./trilhaAssets";

const YT_APRENDENDO_AGE = "https://www.youtube.com/embed/fT66Hc4XcRo";
const BATTLE_SIM = "https://www.aom-battlesimulator.net/#/";

export function TrilhaDeAprendizadoPage() {
  const archaic = getTokenAssetUrl("aomr_archaic_age_icon");
  const wonder = getTokenAssetUrl("aomr_wonder_age_icon");

  return (
    <div>
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="text-zinc-500">TRILHA:</span>
            <span>
              Do <span className="text-amber-200/95">Noob</span>{" "}
              {archaic ? <img src={archaic} alt="" className="inline-block h-7 w-7 align-[-0.2em] object-contain" /> : null}{" "}
              ao <span className="text-sky-300/95">Pro</span>{" "}
              {wonder ? <img src={wonder} alt="" className="inline-block h-7 w-7 align-[-0.2em] object-contain" /> : null}!
            </span>
          </span>
        }
        description="Roteiro do básico ao avançado — forças e fraquezas, eras, unidades, atalhos, starts e estratégias."
      />

      <TrilhaCallout
        variant="teal"
        icon={<img src={trilhaShared("ScoobyManiaco_Perfil.png")} alt="" className="h-12 w-12 rounded-full object-cover" />}
      >
        <p>
          <span className="font-semibold text-teal-300">Scooby: </span>
          Novo no jogo? Iniciante? Segue essa trilha do SUCESSO!
        </p>
      </TrilhaCallout>

      <ol className="mt-10 space-y-10">
        <TrilhaStep
          n={1}
          title="Forças e Fraquezas"
          emoji="💪"
          body={
            <>
              <p>
                Comece por aqui! Descubra o que fazer com cada unidade em combate: o que é{" "}
                <span className="text-red-400">forte</span> contra o que? O que é{" "}
                <span className="text-sky-400">fraco</span>?
              </p>
              <p className="pt-2">
                <Link
                  to="/trilha-de-aprendizado/tipos-unidades-multiplicadores"
                  className="font-medium text-amber-200 underline decoration-amber-500/50 underline-offset-4 hover:text-amber-50"
                >
                  Tipos de Unidades e Multiplicadores →
                </Link>
              </p>
            </>
          }
        />

        <TrilhaStep
          n={2}
          title="Eras"
          emoji="⏳"
          body={
            <>
              <p>Mas o que fazer para evoluir de era? Quais são? Onde elas moram? Confere!</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/eras"
                    title="Eras"
                    subtitle="Custos e requisitos para avançar."
                    watermarkSrc={getTokenAssetUrl("aomr_classical_age_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={3}
          title="Planilha com todas as unidades"
          emoji="📊"
          body={
            <>
              <p>
                Planilha com cada unidade do jogo: status, forças, fraquezas, custos e onde treinar — tudo na seção de
                unidades.
              </p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/unidades"
                    title="Unidades AoM"
                    subtitle="Lista completa com stats e multiplicadores."
                    watermarkSrc={getTokenAssetUrl("aomr_type_human_soldier_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={4}
          title="Atalhos"
          emoji="⏭"
          body={
            <>
              <p>Precisa de velocidade nas ações? Aprenda atalhos importantes para construir, encontrar unidades e mais.</p>
              <p className="pt-2">
                <Link
                  to="/trilha-de-aprendizado/atalhos-importantes"
                  className="font-medium text-amber-200 underline decoration-amber-500/50 underline-offset-4 hover:text-amber-50"
                >
                  Atalhos importantes →
                </Link>
              </p>
            </>
          }
        />

        <TrilhaStep
          n={5}
          title="Starts / Build Order"
          emoji="📋"
          body={
            <>
              <p>
                Starts ou Build Orders são o passo a passo no início da partida — para quais recursos mandar os aldeões e
                como otimizar o tempo.
              </p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <EntityCard
                    to="/starts"
                    title="Starts / Build Order"
                    subtitle="Builds por deus e objetivo."
                    watermarkSrc={getTokenAssetUrl("aomr_time_icon")}
                  />
                </li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={6}
          title="Depois do start: Rush? Turtle? Boom?"
          emoji="🎯"
          body={
            <>
              <p>
                Os starts levam da Arcaica à Clássica com uma estratégia em mente. No RTS existem arquétipos clássicos —
                entenda como se relacionam.
              </p>
              <p className="pt-2">
                <Link
                  to="/trilha-de-aprendizado/rush-turtle-boom"
                  className="font-medium text-amber-200 underline decoration-amber-500/50 underline-offset-4 hover:text-amber-50"
                >
                  Rush? Turtle? Boomar? →
                </Link>
              </p>
            </>
          }
        />

        <TrilhaStep
          n={7}
          title="Vídeo: do básico ao avançado"
          emoji="📺"
          body={
            <>
              <p className="mb-4">Aula completa em vídeo (YouTube) — capítulos no próprio player.</p>
              <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40 shadow-lg shadow-black/40">
                <iframe
                  title="Aprendendo Age — básico ao avançado"
                  src={YT_APRENDENDO_AGE}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-zinc-400">
                <li>O que fazer no começo? (Start)</li>
                <li>Recursos do jogo</li>
                <li>Estratégias depois da Arcaica</li>
                <li>Tipos de unidade, god powers, micragem, raid, GC e mais</li>
              </ul>
            </>
          }
        />

        <TrilhaStep
          n={8}
          title="Simulador de batalha"
          emoji="⚔"
          body={
            <>
              <p className="text-zinc-400">
                <em>Créditos: Felix Lilienthal.</em> Ferramenta externa para simular confrontos entre composições.
              </p>
              <p className="pt-3">
                <a
                  href={BATTLE_SIM}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-amber-200 underline decoration-amber-500/50 underline-offset-4 hover:text-amber-50"
                >
                  {BATTLE_SIM} ↗
                </a>
              </p>
            </>
          }
        />
      </ol>
    </div>
  );
}

function TrilhaStep({
  n,
  title,
  emoji,
  body,
}: {
  n: number;
  title: string;
  emoji: string;
  body: ReactNode;
}) {
  return (
    <li className="list-none">
      <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/40 p-5 shadow-sm shadow-black/20">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-100">
          <span className="text-zinc-500">{n}. </span>
          {emoji} {title}
        </h2>
        <div className="mt-3 space-y-2 text-sm text-zinc-300">{body}</div>
      </div>
    </li>
  );
}
