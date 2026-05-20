import { useMemo, useState } from "react";

import { Link } from "react-router-dom";



import { BackLink } from "@/components/ui/BackLink";

import { PageHeader } from "@/components/ui/PageHeader";

import { deuses, deusSlugById } from "@/data/catalog";

import { getDeusAssetUrl } from "@/lib/deusAssetUrl";

import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { cn } from "@/lib/cn";



import { TrilhaCallout } from "./TrilhaCallout";

import { TrilhaTokenImg } from "./TrilhaTokenImg";

import { rushTurtleBoomarImg } from "./trilhaAssets";



const PROF_AJAX_VIDEO = "https://www.youtube.com/embed/-N9ntWXsKWs";



type PlaystyleMode = "rush" | "turtle" | "eco";



const PLAYSTYLE_MODES: {

  id: PlaystyleMode;

  label: string;

  short: string;

  statKey: "rush" | "turtle" | "eco";

  img: string;

  tabActive: string;

  tabIdle: string;

  accent: string;

  bar: string;

  ring: string;

}[] = [

  {

    id: "rush",

    label: "Rush (agressivo)",

    short: "Rush",

    statKey: "rush",

    img: "Modo_Aggro.png",

    tabActive: "border-pink-500/70 bg-pink-950/50 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.15)]",

    tabIdle: "border-zinc-700/80 bg-zinc-900/40 text-zinc-400 hover:border-pink-800/50 hover:text-pink-200",

    accent: "text-pink-300",

    bar: "bg-pink-400",

    ring: "ring-pink-500/30",

  },

  {

    id: "turtle",

    label: "Turtle (defensivo)",

    short: "Turtle",

    statKey: "turtle",

    img: "Modo_Turtle.png",

    tabActive: "border-teal-500/70 bg-teal-950/45 text-teal-100 shadow-[0_0_20px_rgba(45,212,191,0.12)]",

    tabIdle: "border-zinc-700/80 bg-zinc-900/40 text-zinc-400 hover:border-teal-800/50 hover:text-teal-200",

    accent: "text-teal-300",

    bar: "bg-teal-400",

    ring: "ring-teal-500/30",

  },

  {

    id: "eco",

    label: "Eco (econômico)",

    short: "Eco",

    statKey: "eco",

    img: "Modo_Eco.png",

    tabActive: "border-blue-500/70 bg-blue-950/45 text-blue-100 shadow-[0_0_20px_rgba(96,165,250,0.12)]",

    tabIdle: "border-zinc-700/80 bg-zinc-900/40 text-zinc-400 hover:border-blue-800/50 hover:text-blue-200",

    accent: "text-blue-300",

    bar: "bg-blue-400",

    ring: "ring-blue-500/30",

  },

];



function isMajorGod(hierarquia: string | undefined): boolean {

  return hierarquia?.toLowerCase() === "maior";

}



function scoreLabel(n: number): string {

  switch (n) {

    case 5:

      return "Excelente";

    case 4:

      return "Ótimo";

    case 3:

      return "Bom";

    case 2:

      return "Ruim";

    case 1:

      return "Péssimo";

    default:

      return String(n);

  }

}



function ScoreBar({ score, barClass }: { score: number; barClass: string }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-3 rounded-full sm:w-4", i <= score ? barClass : "bg-zinc-800")}
        />
      ))}
    </div>
  );
}



function MajorGodsTop10({ mode }: { mode: (typeof PLAYSTYLE_MODES)[number] }) {

  const top10 = useMemo(() => {

    const key = mode.statKey;

    return deuses

      .filter((d) => isMajorGod(d.hierarquia) && typeof d[key] === "number")

      .sort((a, b) => (b[key] as number) - (a[key] as number) || a.nome.localeCompare(b.nome, "pt"))

      .slice(0, 10);

  }, [mode.statKey]);



  return (

    <ol className="space-y-2">

      {top10.map((deus, index) => {

        const score = deus[mode.statKey] as number;

        const portrait = getDeusAssetUrl(deus);

        const rank = index + 1;

        const isPodium = rank <= 3;



        return (

          <li key={deus.id}>

            <Link

              to={`/deuses/${deusSlugById.get(deus.id) ?? deus.id}`}

              className={cn(

                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",

                "border-zinc-800/90 bg-zinc-950/50 hover:border-zinc-600 hover:bg-zinc-900/70",

                isPodium && `ring-1 ${mode.ring}`,

              )}

            >

              <span

                className={cn(

                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",

                  isPodium ? "bg-zinc-800/90 text-amber-100" : "bg-zinc-900 text-zinc-500",

                )}

              >

                {rank}

              </span>

              {portrait ? (

                <img

                  src={portrait}

                  alt=""

                  className="h-10 w-10 shrink-0 rounded-lg border border-zinc-700/80 object-cover"

                />

              ) : (

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900 text-xs text-zinc-600">

                  ?

                </span>

              )}

              <div className="min-w-0 flex-1">

                <p className="truncate font-medium text-amber-100/95 group-hover:text-amber-50">{deus.nome}</p>

                <div className="mt-1 flex flex-wrap items-center gap-2">

                  <ScoreBar score={score} barClass={mode.bar} />

                  <span className={cn("text-xs tabular-nums", mode.accent)}>

                    {score}/5 · {scoreLabel(score)}

                  </span>

                </div>

              </div>

            </Link>

          </li>

        );

      })}

    </ol>

  );

}



export function RushTurtleBoomarPage() {

  const [modeId, setModeId] = useState<PlaystyleMode>("rush");

  const mode = PLAYSTYLE_MODES.find((m) => m.id === modeId) ?? PLAYSTYLE_MODES[0];



  return (

    <div>

      <BackLink to="/trilha-de-aprendizado">Trilha de Aprendizado</BackLink>

      <PageHeader

        title="Rush? Turtle? Boomar?"

        description="Três arquétipos de estratégia em RTS — agressivo, defensivo e econômico — e como costumam se contrapor."

      />



      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">

        <p>Existem 3 estratégias principais no RTS. Esses arquétipos são:</p>

        <ul className="list-disc space-y-2 pl-5 marker:text-zinc-500">

          <li>

            jogar de forma <span className="text-pink-400">agressiva</span>{" "}

            <img

              src={rushTurtleBoomarImg("Modo_Aggro.png")}

              alt=""

              className="inline-block h-7 w-7 align-[-0.15em] rounded object-contain sm:h-8 sm:w-8"

            />

            {";"}

          </li>

          <li>

            jogar de forma <span className="text-blue-300">econômica</span>{" "}

            <img

              src={rushTurtleBoomarImg("Modo_Eco.png")}

              alt=""

              className="inline-block h-7 w-7 align-[-0.15em] rounded object-contain sm:h-8 sm:w-8"

            />

            {";"}

          </li>

          <li>

            jogar de forma <span className="text-teal-300">defensiva</span>{" "}

            <img

              src={rushTurtleBoomarImg("Modo_Turtle.png")}

              alt=""

              className="inline-block h-7 w-7 align-[-0.15em] rounded object-contain sm:h-8 sm:w-8"

            />

            {"."}

          </li>

        </ul>

        <p>Elas se combatem entre si, como pedra ✊, papel 🖐 e tesoura ✌.</p>

        <p>

          Em resumo: <span className="text-pink-400">Rush</span> &gt; <span className="text-blue-300">Eco</span> &gt;{" "}

          <span className="text-teal-300">Turtle</span> (cada estilo tem pontos fortes contra outro — mas na prática

          tudo depende de mapa, panteão e execução).

        </p>



        <TrilhaCallout variant="gray" icon="💡">

          <p className="font-medium text-zinc-200">Dica!</p>

          <p>

            Normalmente é importante alinhar a estratégia já pensando em god/panteão — pois eles combinam com os

            arquétipos (Egípicio→Econômico, Nórdico→Agressivo). MAS, se o adversário ler seu estilo, tente adaptar! Ou

            seja, é normal um egípicio fazer economia, então ao invés disso faça rush e surpreenda seu adversário!

          </p>

          <p>

            Outro exemplo: Se sua <span className="text-pink-400">agressividade</span> encontrar{" "}

            <span className="text-teal-300">turtle</span>, você ainda pode mudar para{" "}

            <span className="text-blue-300">eco</span>/<span className="text-blue-300">boom</span> rumo à era heróica{" "}

            <img

              src={getTokenAssetUrl("aomr_heroic_age_icon")}

              alt=""

              className="inline h-[1em] w-[1em] align-[-0.15em] object-contain"

            />{" "}

            com cerco{" "}

            <img

              src={getTokenAssetUrl("aomr_type_siege_weapon_icon")}

              alt=""

              className="inline h-[1em] w-[1em] align-[-0.15em] object-contain"

            />

            . O mesmo acontece com quem joga <span className="text-teal-300">turtle</span>, podendo mudar para{" "}

            <span className="text-blue-300">boom</span> ou <span className="text-pink-400">agressividade</span> quando o

            inimigo investe em <span className="text-blue-300">economia</span>.

          </p>

          <p>

            O Termo <span className="text-blue-300">Boomar</span> pode ser 2º centro da cidade{" "}

            <TrilhaTokenImg token="aomr_town_center_egyptian_icon" /> ou juntar recursos <TrilhaTokenImg token="foodaom" />

            <TrilhaTokenImg token="goldaom" /> para FH (<em>Fast Heroic</em>).

          </p>

        </TrilhaCallout>



        <p>Você pode ver o vídeo de referência abaixo ou ler os resumos nesta página:</p>



        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">

          <iframe

            title="Referência — Professor Ajax"

            src={PROF_AJAX_VIDEO}

            className="h-full w-full"

            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"

            allowFullScreen

          />

        </div>

        <blockquote className="border-l-2 border-zinc-600 pl-4 text-zinc-400">

          <strong className="text-zinc-300">Referência:</strong> Professor Ajax

        </blockquote>



        <section className="rounded-xl border border-pink-900/40 bg-pink-950/20 p-5">

          <div className="flex flex-row items-start gap-4 sm:gap-5">

            <img

              src={rushTurtleBoomarImg("Modo_Aggro.png")}

              alt="Ilustração do arquétipo rush (agressivo)"

              className="w-24 shrink-0 self-start rounded-lg border border-aom-border object-contain sm:w-36"

            />

            <div className="min-w-0 flex-1 space-y-4">

              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-pink-200">Rush! (Push!)</h2>

              <p>Priorizar produção militar e pressão cedo — jogo agressivo.</p>

              <p>

                <span className="text-emerald-400">Prós:</span> dano cedo (muitas vezes na Clássica), atrasando economia

                inimiga.

              </p>

              <p>

                <span className="text-red-400">Contras:</span> pode ser punido por <strong className="text-teal-300">turtle</strong>{" "}

                bem executado.

              </p>

            </div>

          </div>

        </section>



        <section className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-5">

          <div className="flex flex-row items-start gap-4 sm:gap-5">

            <img

              src={rushTurtleBoomarImg("Modo_Turtle.png")}

              alt="Ilustração do arquétipo turtle (defensivo)"

              className="w-24 shrink-0 self-start rounded-lg border border-aom-border object-contain sm:w-36"

            />

            <div className="min-w-0 flex-1 space-y-4">

              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-teal-200">

                Turtle (modo tartaruga)

              </h2>

              <p>Jogo fechado: equilíbrio entre defesas (muros, torres) e crescimento.</p>

              <p>

                <span className="text-emerald-400">Prós:</span> base sólida para mid/late com tecnologias e exército.

              </p>

              <p>

                <span className="text-red-400">Contras:</span> pode sofrer contra quem maximiza{" "}

                <strong className="text-blue-300">eco</strong> e ultrapassa em economia.

              </p>

            </div>

          </div>

        </section>



        <section className="rounded-xl border border-blue-900/40 bg-blue-950/25 p-5">

          <div className="flex flex-row items-start gap-4 sm:gap-5">

            <img

              src={rushTurtleBoomarImg("Modo_Eco.png")}

              alt="Ilustração do arquétipo eco (econômico)"

              className="w-24 shrink-0 self-start rounded-lg border border-aom-border object-contain sm:w-36"

            />

            <div className="min-w-0 flex-1 space-y-4">

              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-blue-200">Eco (Boom!)</h2>

              <p>Foco em aldeões, recursos e expansão — “boomar” a economia.</p>

              <p>

                <span className="text-emerald-400">Prós:</span> forte no late game com upgrades completos; pouco gasto

                militar no começo.

              </p>

              <p>

                <span className="text-red-400">Contras:</span> vulnerável a <strong className="text-pink-300">rush</strong> se

                não houver defesa ou scouting.

              </p>

            </div>

          </div>

        </section>



        <img

          src={rushTurtleBoomarImg("Contra - RTS Estratégia.png")}

          alt="Rush, eco e turtle: como os arquétipos se contrapõem no RTS"

          className="mt-4 max-w-full rounded-lg border border-aom-border"

        />



        <section className="rounded-2xl border border-amber-900/35 bg-gradient-to-b from-zinc-950/80 to-zinc-950/40 p-5 sm:p-6">

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">

                Top 10 — deuses maiores

              </h2>

              <p className="mt-1 max-w-xl text-zinc-400">

                Notas do material legado (escala 1–5; 5 é o melhor). Troque o arquétipo para ver quem se destaca em cada

                estilo. Detalhes em{" "}

                <Link className="text-amber-200 underline hover:text-amber-50" to="/deuses">

                  Deuses

                </Link>

                .

              </p>

            </div>

            <img

              src={rushTurtleBoomarImg(mode.img)}

              alt=""

              className="hidden h-14 w-14 shrink-0 rounded-lg border border-aom-border object-contain sm:block"

            />

          </div>



          <div

            className="mb-5 flex flex-wrap gap-2"

            role="tablist"

            aria-label="Arquétipo para ranking de deuses maiores"

          >

            {PLAYSTYLE_MODES.map((m) => {

              const active = m.id === modeId;

              return (

                <button

                  key={m.id}

                  type="button"

                  role="tab"

                  aria-selected={active}

                  onClick={() => setModeId(m.id)}

                  className={cn(

                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",

                    active ? m.tabActive : m.tabIdle,

                  )}

                >

                  <img src={rushTurtleBoomarImg(m.img)} alt="" className="h-6 w-6 rounded object-contain" />

                  {m.short}

                </button>

              );

            })}

          </div>



          <div role="tabpanel" aria-label={`Top 10 ${mode.label}`}>

            <p className="mb-3 text-xs text-zinc-500">

              Ordenado por nota de <span className={mode.accent}>{mode.short}</span> (maior primeiro).

            </p>

            <MajorGodsTop10 mode={mode} />

          </div>

        </section>

      </div>

    </div>

  );

}


