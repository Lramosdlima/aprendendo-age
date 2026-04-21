import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { TrilhaTokenImg } from "./TrilhaTokenImg";
import { atalhosImg } from "./trilhaAssets";

const YT_ATALHOS = "https://www.youtube.com/embed/CBp0iKE7bbA";
const YT_ATTACK_MOVE = "https://www.youtube.com/embed/dZd1QNiy99Q";

function Kbd({ children }: { children: string }) {
  return (
    <code className="rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-xs text-amber-100/95">{children}</code>
  );
}

function Tok({ name }: { name: string }) {
  const src = getTokenAssetUrl(name);
  return src ? (
    <img src={src} alt="" title={name} className="inline h-[1em] w-[1em] align-[-0.15em] object-contain" />
  ) : null;
}

export function AtalhosImportantesPage() {
  return (
    <div>
      <BackLink to="/trilha-de-aprendizado">Trilha de Aprendizado</BackLink>
      <PageHeader
        title="Atalhos importantes!"
        description="Atalhos de teclado para construir rápido, encontrar unidades e gerenciar grupos — do export original do Notion."
      />

      <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
          <iframe
            title="DicasAoM — Atalhos"
            src={YT_ATALHOS}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <TrilhaCallout variant="orange" icon="⚠️">
          <p>Todos os atalhos a seguir podem ser alterados nas configurações do jogo!</p>
        </TrilhaCallout>

        <figure className="overflow-x-auto">
          <img
            src={atalhosImg("Teclado_AoM_Atalhos.png")}
            alt="Mapa de atalhos no teclado"
            className="max-h-[70vh] w-auto max-w-full rounded-lg border border-aom-border object-contain"
          />
        </figure>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Encontrar construções e unidades
          </h2>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <img src={atalhosImg("image.png")} alt="" className="rounded-lg border border-aom-border" />
              <img src={atalhosImg("image 1.png")} alt="" className="rounded-lg border border-aom-border" />
            </div>
            <div className="min-w-0 flex-[1.4] space-y-3">
              <p>
                Com <Tok name="aomr_type_villager_icon" /> ou <Tok name="aomr_type_building_icon" /> selecionado, as teclas
                para escolher itens do menu seguem a ordem do teclado — por exemplo Casa <TrilhaTokenImg token="aomr_house_icon" />{" "}
                com <Kbd>Q</Kbd>, Templo <TrilhaTokenImg token="aomr_temple_icon" /> com <Kbd>T</Kbd>, Muralha{" "}
                <TrilhaTokenImg token="aomr_wooden_wall_icon" /> com <Kbd>X</Kbd>.
              </p>
              <p>
                Com <Kbd>Ctrl</Kbd> + mesma tecla, você <strong className="text-zinc-200">enfoca</strong> a construção. O TC
                grego <TrilhaTokenImg token="aomr_town_center_greek_icon" /> usa <Kbd>Z</Kbd> → <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd>{" "}
                centraliza nele; mercado <TrilhaTokenImg token="aomr_market_icon" /> <Kbd>G</Kbd> → <Kbd>Ctrl</Kbd>+
                <Kbd>G</Kbd>.
              </p>
              <TrilhaCallout variant="gray">
                <p>
                  <strong className="text-zinc-200">Dica:</strong> “Z” é a última letra do alfabeto — lembre do TC como última
                  linha de defesa. “G” lembra “grana”.
                </p>
              </TrilhaCallout>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-zinc-100">Encontrar tropas ou aldeões</h3>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-3">
              <p>
                Unidades ociosas? Use a bandeira no canto da tela ou os atalhos: aldeão ocioso <Kbd>.</Kbd> ou botão do
                mouse; militar ocioso <Kbd>,</Kbd>; herói <Kbd>;</Kbd> ou <Kbd>Alt</Kbd>+<Kbd>D</Kbd>; batedor{" "}
                <TrilhaTokenImg token="los_icon_aoe3de" /> <Kbd>/</Kbd>.
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <img src={atalhosImg("image 2.png")} alt="" className="rounded-lg border border-aom-border" />
              <img src={atalhosImg("image 3.png")} alt="" className="rounded-lg border border-aom-border" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Encontrar todos de uma vez
          </h2>
          <div className="overflow-x-auto rounded-lg border border-aom-border">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Atalho</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">
                    Todas as <Tok name="aomr_type_building_icon" /> de produção de tropas{" "}
                    <Tok name="aomr_type_human_soldier_icon" /> <Tok name="aomr_type_myth_unit_icon" />{" "}
                    <Tok name="aomr_type_hero_icon" />
                  </td>
                  <td className="px-3 py-2">
                    <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>Espaço</Kbd>
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">
                    Todas as unidades <Tok name="aomr_type_human_soldier_icon" /> <Tok name="aomr_type_myth_unit_icon" />{" "}
                    <Tok name="aomr_type_hero_icon" />
                  </td>
                  <td className="px-3 py-2">
                    <Kbd>Alt</Kbd> + <Kbd>Shift</Kbd> + <Kbd>A</Kbd>
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Unidades em tela</td>
                  <td className="px-3 py-2">
                    <Kbd>Alt</Kbd> + <Kbd>A</Kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Guarnecer e abrigo
          </h2>
          <div className="overflow-x-auto rounded-lg border border-aom-border">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Atalho</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Entrar na construção (guarnecer)</td>
                  <td className="px-3 py-2">
                    <Kbd>Alt</Kbd> + clique direito na <Tok name="aomr_type_building_icon" />
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Esvaziar construção</td>
                  <td className="px-3 py-2">
                    Com prédio selecionado: <Kbd>Alt</Kbd> + <Kbd>X</Kbd>
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">“Raid — procurar abrigo” (unidade corre para o abrigo mais próximo)</td>
                  <td className="px-3 py-2">
                    <Kbd>Alt</Kbd> + <Kbd>C</Kbd>
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">“Voltar ao trabalho” (sair e retomar tarefa)</td>
                  <td className="px-3 py-2">
                    Com prédio selecionado: <Kbd>Alt</Kbd> + <Kbd>C</Kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Agrupamento de unidades
          </h2>
          <img src={atalhosImg("image 4.png")} alt="" className="mb-4 max-w-full rounded-lg border border-aom-border" />
          <p>
            <Kbd>Ctrl</Kbd> + número <Kbd>1</Kbd>–<Kbd>9</Kbd> ou <Kbd>0</Kbd> salva o grupo; pressionar o número recupera a
            seleção. <Kbd>Shift</Kbd> + número adiciona ao grupo; <Kbd>Alt</Kbd> + número foca a câmera no grupo.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-aom-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2">Ação</th>
                  <th className="px-3 py-2">Atalho</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Selecionar grupo</td>
                  <td className="px-3 py-2">Número do grupo</td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Criar grupo</td>
                  <td className="px-3 py-2">
                    <Kbd>Ctrl</Kbd> + número
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Adicionar ao grupo</td>
                  <td className="px-3 py-2">
                    <Kbd>Shift</Kbd> + número
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">Focar no grupo</td>
                  <td className="px-3 py-2">
                    <Kbd>Alt</Kbd> + número
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-zinc-100">Seleção rápida</h3>
            <p>Duplo clique em uma unidade seleciona todas do mesmo tipo à vista (vale para humanos, míticas e heróis).</p>
            <p className="mt-2">
              Tecla <Kbd>O</Kbd> centraliza a câmera na seleção atual.
            </p>
            <img src={atalhosImg("image 5.png")} alt="" className="mt-3 rounded-lg border border-aom-border" />
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-zinc-100">Retratos na barra</h3>
            <p>
              <Kbd>Ctrl</Kbd> no retrato remove aquele tipo da seleção; <Kbd>Shift</Kbd> no retrato isola só aquele tipo.
            </p>
            <img src={atalhosImg("image 6.png")} alt="" className="mt-3 rounded-lg border border-aom-border" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Attack Move e kiting
          </h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <TrilhaTokenImg token="attackmove" className="h-auto w-24 shrink-0 object-contain" />
            <div className="space-y-2">
              <p>
                Attack Move: unidades atacam o primeiro inimigo ao entrar no alcance. Atalho: <Kbd>Espaço</Kbd> + clique
                direito para mover — útil para kiting com <Tok name="aomr_type_archer_icon" />.
              </p>
            </div>
          </div>
          <video
            className="mt-4 max-h-[50vh] w-full max-w-lg rounded-lg border border-aom-border"
            controls
            src={atalhosImg("VID-20251119-WA0030.mp4")}
          >
            Vídeo de exemplo (navegador sem suporte a vídeo).
          </video>
          <div className="mt-4 aspect-video max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
            <iframe
              title="Attack Move — DicasAoM"
              src={YT_ATTACK_MOVE}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">Patrulhar</h2>
          <p>
            Como Attack Move, mas em loop na rota — defende o trecho e ataca intrusos. Atalho: <Kbd>Alt</Kbd> + <Kbd>V</Kbd> (
            pense em “vasculhar”).
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Seleção só militar
          </h2>
          <p className="mb-3">
            Segure <Kbd>Alt</Kbd> antes de arrastar o retângulo de seleção para pegar apenas militares{" "}
            <Tok name="aomr_type_human_soldier_icon" />.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <img src={atalhosImg("image 7.png")} alt="" className="rounded-lg border border-aom-border" />
            <img src={atalhosImg("image 8.png")} alt="" className="rounded-lg border border-aom-border" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Fila de produção
          </h2>
          <div className="flex flex-col gap-4 lg:flex-row">
            <img src={atalhosImg("image 9.png")} alt="" className="max-w-md rounded-lg border border-aom-border" />
            <div className="space-y-3">
              <p>
                Com quartel / <TrilhaTokenImg token="aomr_military_academy_icon" /> ou qualquer fila de unidades:{" "}
                <Kbd>Shift</Kbd> + clique enfileira até 5 unidades de uma vez; <Kbd>Shift</Kbd> + atalho da unidade (ex.:{" "}
                <Kbd>Shift</Kbd>+<Kbd>Q</Kbd> no estábulo grego para Hippeus <TrilhaTokenImg token="aomr_hippeus_icon" />) faz o
                mesmo.
              </p>
              <div className="overflow-x-auto rounded-lg border border-aom-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 text-zinc-400">
                    <tr>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2">Atalho</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-zinc-800">
                      <td className="px-3 py-2">Cancelar último item</td>
                      <td className="px-3 py-2">
                        <Kbd>Backspace</Kbd>
                      </td>
                    </tr>
                    <tr className="border-t border-zinc-800">
                      <td className="px-3 py-2">Cancelar fila inteira</td>
                      <td className="px-3 py-2">
                        <Kbd>Shift</Kbd> + <Kbd>Backspace</Kbd>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <div className="aspect-video max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
          <iframe
            title="DicasAoM — Atalhos (reprise)"
            src={YT_ATALHOS}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
