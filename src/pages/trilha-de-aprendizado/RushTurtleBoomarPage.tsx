import { Link } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { deusSlugById } from "@/data/catalog";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { TrilhaTokenImg } from "./TrilhaTokenImg";
import { rushTurtleBoomarImg } from "./trilhaAssets";

const PROF_AJAX_VIDEO = "https://www.youtube.com/embed/-N9ntWXsKWs";

/** Major gods com nota de Rush (1–5) — legado Notion; veja página do deus para contexto completo. */
const RUSH_MAJOR_GODS: { id: number; nome: string; rush: number }[] = [
  { id: 12, nome: "Cronos", rush: 5 },
  { id: 8, nome: "Odin", rush: 5 },
  { id: 1, nome: "Zeus", rush: 5 },
  { id: 18, nome: "Tsukuyomi", rush: 4 },
  { id: 17, nome: "Amaterasu", rush: 4 },
  { id: 16, nome: "Frey", rush: 4 },
  { id: 15, nome: "Shennong", rush: 4 },
  { id: 13, nome: "Fu Xi", rush: 4 },
  { id: 10, nome: "Urano", rush: 4 },
  { id: 9, nome: "Loki", rush: 4 },
  { id: 6, nome: "Set", rush: 4 },
];

export function RushTurtleBoomarPage() {
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
        <p>Em resumo: <span className="text-pink-400">Rush</span> &gt; <span className="text-blue-300">Eco</span> &gt; <span className="text-teal-300">Turtle</span> (cada
          estilo tem pontos fortes contra outro — mas na prática tudo depende de mapa, panteão e execução).</p>
        
        <TrilhaCallout variant="gray" icon="💡">
          <p className="font-medium text-zinc-200">Dica!</p>
          <p>
            Normalmente é importante alinhar a estratégia já pensando em god/panteão — pois eles combinam com os arquétipos (Egípicio→Econômico, Nórdico→Agressivo).
            MAS, se o adversário ler seu estilo, tente adaptar! Ou seja, é normal um egípicio fazer economia, então ao invés disso faça rush e surpreenda seu adversário!
          </p>
          <p>
            Outro exemplo: Se sua <span className="text-pink-400">agressividade</span> encontrar{" "}
            <span className="text-teal-300">turtle</span>, você ainda pode mudar para {" "}
            <span className="text-blue-300">eco</span>/<span className="text-blue-300">boom</span> rumo à era
            heróica{" "}
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
            . O mesmo acontece com quem joga <span className="text-teal-300">turtle</span>, podendo mudar para <span className="text-blue-300">boom</span> ou <span className="text-pink-400">agressividade</span> quando o inimigo
            investe em <span className="text-blue-300">economia</span>. 
          </p>
          <p>
            O Termo <span className="text-blue-300">Boomar</span> pode ser 2º centro da cidade{" "}
            <TrilhaTokenImg token="aomr_town_center_egyptian_icon" /> ou juntar recursos <TrilhaTokenImg token="foodaom" />
            <TrilhaTokenImg token="goldaom" /> para FH (
            <em>Fast Heroic</em>).
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
                <span className="text-red-400">Contras:</span> pode sofrer contra quem maximiza <strong className="text-blue-300">eco</strong> e
                ultrapassa em economia.
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
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-blue-200">
                Eco (Boom!)
              </h2>
              <p>Foco em aldeões, recursos e expansão — “boomar” a economia.</p>
              <p>
                <span className="text-emerald-400">Prós:</span> forte no late game com upgrades completos; pouco gasto militar no
                começo.
              </p>
              <p>
                <span className="text-red-400">Contras:</span> vulnerável a <strong className="text-pink-300">rush</strong> se não
                houver defesa ou scouting.
              </p>
            </div>
          </div>
        </section>

        <img
          src={rushTurtleBoomarImg("Contra - RTS Estratégia.png")}
          alt="Rush, eco e turtle: como os arquétipos se contrapõem no RTS"
          className="mt-4 max-w-full rounded-lg border border-aom-border"
        />


        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Deuses maiores e nota de Rush
          </h2>
          <p className="mb-4 text-zinc-400">
            Tabela resumida do material original (nota só de <strong>Rush</strong>). Para Turtle, Eco e detalhes, explore
            cada deus em{" "}
            <Link className="text-amber-200 underline hover:text-amber-50" to="/deuses">
              Deuses
            </Link>
            .
          </p>
          <div className="overflow-x-auto rounded-lg border border-aom-border">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Deus</th>
                  <th className="px-3 py-2 font-medium">Rush (1–5)</th>
                </tr>
              </thead>
              <tbody>
                {RUSH_MAJOR_GODS.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800/90">
                    <td className="px-3 py-2">
                      <Link
                        to={`/deuses/${deusSlugById.get(row.id) ?? row.id}`}
                        className="text-amber-200/95 underline-offset-2 hover:text-amber-50 hover:underline"
                      >
                        {row.nome}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-zinc-300">{row.rush}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
