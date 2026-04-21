import { Link } from "react-router-dom";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTokenAssetUrl } from "@/lib/notionTokenAssets";

import { TrilhaCallout } from "./TrilhaCallout";
import { TrilhaTokenImg } from "./TrilhaTokenImg";
import { tiposImg, trilhaShared } from "./trilhaAssets";

const YT_MICRAGEM = "https://www.youtube.com/embed/zE27Ehwk3Cs";

function Tok({ name }: { name: string }) {
  const src = getTokenAssetUrl(name);
  return src ? (
    <img src={src} alt="" title={name} className="inline h-[1em] w-[1em] align-[-0.15em] object-contain" />
  ) : null;
}

export function TiposUnidadesMultiplicadoresPage() {
  return (
    <div>
      <BackLink to="/trilha-de-aprendizado">Trilha de Aprendizado</BackLink>
      <PageHeader
        headerIconSrc={getTokenAssetUrl("aomr_type_myth_unit_icon")}
        title="Tipos de Unidades e Multiplicadores"
        description="Como ler atributos, multiplicadores de dano, categorias e o ‘pedra, papel, tesoura’ do combate."
      />

      <article className="space-y-10 text-sm leading-relaxed text-zinc-300">
        <section className="space-y-3">
          <p>
            No jogo dá para ver os <span className="text-amber-200/90">atributos</span> da unidade ao selecioná-la,
            inclusive o <span className="text-pink-300/90">multiplicador</span> de dano — ou seja, quanto essa unidade fica{" "}
            <span className="text-red-400">mais forte</span> contra certo tipo de alvo.
          </p>
          <p>
            No <span className="text-sky-300">Hoplita</span>, por exemplo, o multiplicador é{" "}
            <span className="text-pink-300">1,25×</span> contra <span className="text-teal-300">cavalaria</span>{" "}
            <Tok name="aomr_type_cavalry_icon" />. Com <span className="text-red-400">8 de dano cortante</span>{" "}
            <TrilhaTokenImg token="hackdamage" />, contra
            cavalaria isso vira 8 × 1,25 = <span className="text-red-400">10 de cortante</span> — um{" "}
            <span className="text-orange-300">soft counter</span> (vantagem, mas não extremo).
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <a href={tiposImg("image.png")} target="_blank" rel="noreferrer" className="shrink-0">
              <img
                src={tiposImg("image.png")}
                alt="Painel do Hoplita no jogo"
                className="max-w-md rounded-lg border border-aom-border"
              />
            </a>
            <p className="min-w-0 flex-1">
              Já o <span className="text-sky-300">Hipaspista</span> é um <span className="text-orange-300">hard counter</span>{" "}
              contra <span className="text-red-400">infantaria</span> <Tok name="aomr_type_infantry_icon" />: multiplicador
              de <span className="text-pink-300">5×</span>, chegando a <span className="text-red-400">30 de cortante</span>{" "}
              <TrilhaTokenImg token="hackdamage" /> só contra
              infantaria — muito forte nesse papel, mais fraco contra outras linhas.
            </p>
          </div>
          <div className="flex justify-center">
            <a href={tiposImg("image 1.png")} target="_blank" rel="noreferrer">
              <img src={tiposImg("image 1.png")} alt="Hipaspista" className="max-w-sm rounded-lg border border-aom-border" />
            </a>
          </div>
        </section>

        <section>
          <p>
            A planilha completa com todas as unidades está na seção{" "}
            <Link to="/unidades" className="font-medium text-amber-200 underline hover:text-amber-50">
              Unidades AoM
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Unidades: soldados humanos
          </h2>
          <p className="mb-4">Soldados humanos se dividem em:</p>
          <div className="space-y-3">
            <TrilhaCallout variant="teal" icon={<Tok name="aomr_type_infantry_icon" />}>
              <p>
                <span className="font-semibold text-red-300">Infantaria</span> — combate corpo a corpo.
              </p>
            </TrilhaCallout>
            <TrilhaCallout variant="teal" icon={<Tok name="aomr_type_cavalry_icon" />}>
              <p>
                <span className="font-semibold text-teal-300">Cavalaria</span> — unidades montadas.
              </p>
            </TrilhaCallout>
            <TrilhaCallout variant="teal" icon={<Tok name="aomr_type_archer_icon" />}>
              <p>
                <span className="font-semibold text-sky-300">Artilharia</span> — ataque à distância.
              </p>
            </TrilhaCallout>
          </div>
          <blockquote className="mt-4 border-l-2 border-zinc-600 pl-4 text-zinc-300">
            <span className="text-red-300">Infantaria</span> <Tok name="aomr_type_infantry_icon" /> →{" "}
            <span className="text-teal-300">Cavalaria</span> <Tok name="aomr_type_cavalry_icon" /> →{" "}
            <span className="text-sky-300">Artilharia</span> <Tok name="aomr_type_archer_icon" /> →{" "}
            <span className="text-red-300">Infantaria</span> <Tok name="aomr_type_infantry_icon" />
            <img
              src={tiposImg("Militares_Beneficios.png")}
              alt="Diagrama infantaria, cavalaria, artilharia"
              className="mt-3 max-w-full rounded-lg border border-aom-border"
            />
          </blockquote>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            Unidades míticas
          </h2>
          <p>
            Unidades muito fortes contra <Tok name="aomr_type_human_soldier_icon" />, com habilidades especiais.{" "}
            <Tok name="aomr_type_hero_icon" /> são o contrapelo mítico.
          </p>
          <img src={tiposImg("image 2.png")} alt="" className="mt-3 max-w-xs rounded-lg border border-aom-border" />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">Heróis</h2>
          <p>
            Especialistas contra <Tok name="aomr_type_myth_unit_icon" />.
          </p>
          <img src={tiposImg("image 3.png")} alt="" className="mt-3 max-w-xs rounded-lg border border-aom-border" />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">Navais</h2>
          <p>
            Feitos na doca <TrilhaTokenImg token="aomr_dock_icon" />{" "}
            a partir da Era Clássica <Tok name="aomr_classical_age_icon" />. Ciclo aproximado: flecheiro → combate
            curto-alcance → cerco → flecheiro.
          </p>
          <img
            src={tiposImg("Barcos_Beneficios.png")}
            alt="Ciclo naval"
            className="mt-4 max-w-full rounded-lg border border-aom-border"
          />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">Cerco</h2>
          <p>
            Unidades terrestres contra <Tok name="aomr_type_building_icon" />, lentas e com pouquíssimo dano vs. unidades —
            em geral disponíveis na <span className="text-orange-300">Era Heróica</span>{" "}
            <Tok name="aomr_heroic_age_icon" />.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">Categorias (UI)</h2>
          <img src={tiposImg("image 4.png")} alt="Categorias no jogo" className="max-w-full rounded-lg border border-aom-border" />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">Vídeo explicativo</h2>
          <div className="aspect-video max-w-2xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
            <iframe
              title="DicasAoM — Micragem"
              src={YT_MICRAGEM}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">
            Multiplicadores: pedra, papel, tesoura
          </h2>
          <TrilhaCallout
            variant="teal"
            icon={<img src={trilhaShared("ScoobyManiaco_Perfil.png")} alt="" className="h-10 w-10 rounded-full object-cover" />}
          >
            <p>
              <span className="font-semibold text-teal-300">Scooby:</span> o jogo usa multiplicadores que mudam a eficácia
              contra cada tipo — como pedra, papel e tesoura. Pensar antes de mandar o exército direto faz diferença.
            </p>
          </TrilhaCallout>
          <p className="mt-4">
            <span className="text-amber-200">Herói</span> <Tok name="aomr_type_hero_icon" /> →{" "}
            <span className="text-pink-300">Mítica</span> <Tok name="aomr_type_myth_unit_icon" /> →{" "}
            <span className="text-amber-200">Soldado humano</span> <Tok name="aomr_type_human_soldier_icon" /> →{" "}
            <span className="text-amber-200">Herói</span> <Tok name="aomr_type_hero_icon" />
          </p>
          <p>
            <span className="text-red-300">Infantaria</span> <Tok name="aomr_type_infantry_icon" /> →{" "}
            <span className="text-teal-300">Cavalaria</span> <Tok name="aomr_type_cavalry_icon" /> →{" "}
            <span className="text-sky-300">Artilharia</span> <Tok name="aomr_type_archer_icon" /> →{" "}
            <span className="text-red-300">Infantaria</span> <Tok name="aomr_type_infantry_icon" />
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <img src={tiposImg("Contra_-Mitica.png")} alt="" className="rounded-lg border border-aom-border" />
            <img src={tiposImg("Elementos_Primarios.jpg")} alt="" className="rounded-lg border border-aom-border" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">Tipos de dano</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-red-200">
                <TrilhaTokenImg token="hackdamage" className="h-6 w-6 object-contain" /> Dano cortante (Hack)
              </h3>
              <p className="mt-2">
                Corpo a corpo; comum em <span className="text-red-300">infantaria</span> e{" "}
                <span className="text-teal-300">cavalaria</span>.
              </p>
            </div>
            <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-sky-200">
                <TrilhaTokenImg token="piercedamage" className="h-6 w-6 object-contain" /> Dano perfurante (Pierce)
              </h3>
              <p className="mt-2">À distância; típico de <span className="text-sky-300">artilharia</span>.</p>
            </div>
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-amber-200">
                <TrilhaTokenImg token="crushdamage" className="h-6 w-6 object-contain" /> Dano contundente (Crush)
              </h3>
              <p className="mt-2">Focado em derrubar <Tok name="aomr_type_building_icon" />; classe <strong>cerco</strong>.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-amber-100">Defesas</h2>
          <p>
            O dano final considera multiplicador de ataque e defesas da unidade alvo — em geral porcentagens que reduzem
            cada tipo de dano.
          </p>
          <blockquote className="mt-3 border-l-2 border-zinc-600 pl-4 text-zinc-400">
            Exemplo: 10 de cortante <TrilhaTokenImg token="hackdamage" className="inline h-[1em] w-[1em] align-[-0.15em]" /> contra
            alvo com 50% de armadura cortante{" "}
            <TrilhaTokenImg token="hackarmor" className="inline h-[1em] w-[1em] align-[-0.15em]" />{" "}
            → 5 de dano efetivo.
          </blockquote>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-red-900/35 bg-red-950/15 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-red-200">
                <TrilhaTokenImg token="hackarmor" className="h-6 w-6 object-contain" /> Proteção cortante
              </h3>
              <p className="mt-2">Comum em <span className="text-red-300">infantaria</span>; valores típicos altos no papel de linha.</p>
            </div>
            <div className="rounded-xl border border-sky-900/35 bg-sky-950/15 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-sky-200">
                <TrilhaTokenImg token="piercearmor" className="h-6 w-6 object-contain" /> Proteção perfurante
              </h3>
              <p className="mt-2">Muito presente em <span className="text-teal-300">cavalaria</span>.</p>
            </div>
            <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-200">
                <TrilhaTokenImg token="crusharmor" className="h-6 w-6 object-contain" /> Proteção contundente
              </h3>
              <p className="mt-2">A maioria das unidades tem resistência altíssima a crush; o dano é pensado para construções.</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
