import { Link } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { deusSlugById } from "@/data/catalog";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { TrilhaTokenImg } from "./TrilhaTokenImg";

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
        <ul className="list-disc pl-5">
          <li>jogar de forma agressiva;</li>
          <li>jogar de forma econômica;</li>
          <li>jogar de forma defensiva.</li>
        </ul>
        <p>
          Elas se combatem entre si, como pedra, papel e tesoura. No resumo clássico: Rush &gt; Eco &gt; Turtle (cada
          estilo tem pontos fortes contra outro — na prática tudo depende de mapa, civ e execução).
        </p>
        <p>Você pode ver o vídeo de referência abaixo ou ler os resumos nesta página.</p>

        <TrilhaCallout variant="gray" icon="💡">
          <p className="font-medium text-zinc-200">Dica!</p>
          <p>
            Escolha uma estratégia já pensando em deus + panteão — cada um tende a um arquétipo. Se o adversário ler sua
            intenção, adaptar (turtle, boom, mudança de idade) é parte do jogo.
          </p>
          <p>
            Se sua <span className="text-pink-400">agressividade</span> encontrar{" "}
            <span className="text-teal-300">turtle</span>, pode migrar para{" "}
            <span className="text-purple-300">eco</span> e <span className="text-purple-300">boom</span> rumo à era
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
            . Quem joga <span className="text-teal-300">turtle</span> pode responder com boom ou pressão quando o inimigo
            investe em economia. <span className="text-purple-300">Boomar</span> pode ser segundo centro da cidade{" "}
            <TrilhaTokenImg token="aomr_town_center_egyptian_icon" /> ou juntar recursos <TrilhaTokenImg token="foodaom" />
            <TrilhaTokenImg token="goldaom" /> para FH (
            <em>Fast Heroic</em>).
          </p>
        </TrilhaCallout>

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

        <section className="space-y-4 rounded-xl border border-pink-900/40 bg-pink-950/20 p-5">
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
        </section>

        <section className="space-y-4 rounded-xl border border-teal-900/40 bg-teal-950/20 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-teal-200">
            Turtle (modo tartaruga)
          </h2>
          <p>Jogo fechado: equilíbrio entre defesas (muros, torres) e crescimento.</p>
          <p>
            <span className="text-emerald-400">Prós:</span> base sólida para mid/late com tecnologias e exército.
          </p>
          <p>
            <span className="text-red-400">Contras:</span> pode sofrer contra quem maximiza <strong className="text-purple-300">eco</strong> e
            ultrapassa em economia.
          </p>
        </section>

        <section className="space-y-4 rounded-xl border border-purple-900/40 bg-purple-950/25 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-purple-200">
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
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Deuses maiores e nota de Rush (legado)
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
