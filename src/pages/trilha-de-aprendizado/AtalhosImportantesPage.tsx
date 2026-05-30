import type { ReactNode } from "react";

import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/hooks/useTranslation";
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

function ShortcutTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: { desc: ReactNode; shortcut: ReactNode }[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-aom-border">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead className="bg-zinc-900/80 text-zinc-400">
          <tr>
            <th className="px-3 py-2">{headers[0]}</th>
            <th className="px-3 py-2">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-zinc-800">
              <td className="px-3 py-2">{row.desc}</td>
              <td className="px-3 py-2">{row.shortcut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AtalhosImportantesPage() {
  const { t } = useTranslation();
  const thDesc = t("pages.trilha.shortcuts.tableDescription");
  const thShortcut = t("pages.trilha.shortcuts.tableShortcut");
  const thAction = t("pages.trilha.shortcuts.tableAction");

  return (
    <div>
      <BackLink to="/trilha-de-aprendizado">{t("pages.trilha.backLink")}</BackLink>
      <PageHeader title={t("pages.trilha.shortcuts.title")} description={t("pages.trilha.shortcuts.description")} />

      <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
          <iframe
            title={t("pages.trilha.shortcuts.videoTitle")}
            src={YT_ATALHOS}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <TrilhaCallout variant="orange" icon="⚠️">
          <p>{t("pages.trilha.shortcuts.settingsWarning")}</p>
        </TrilhaCallout>

        <figure className="overflow-x-auto">
          <img
            src={atalhosImg("Teclado_AoM_Atalhos.png")}
            alt={t("pages.trilha.shortcuts.keyboardMapAlt")}
            className="max-h-[70vh] w-auto max-w-full rounded-lg border border-aom-border object-contain"
          />
        </figure>

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.findBuildingsTitle")}
          </h2>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <img src={atalhosImg("image.png")} alt="" className="rounded-lg border border-aom-border" />
              <img src={atalhosImg("image 1.png")} alt="" className="rounded-lg border border-aom-border" />
            </div>
            <div className="min-w-0 flex-[1.4] space-y-3">
              <p>{t("pages.trilha.shortcuts.findBuildingsP1")}</p>
              <p>{t("pages.trilha.shortcuts.findBuildingsP2")}</p>
              <TrilhaCallout variant="gray">
                <p>{t("pages.trilha.shortcuts.findBuildingsTip")}</p>
              </TrilhaCallout>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-zinc-100">{t("pages.trilha.shortcuts.findTroopsTitle")}</h3>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-3">
              <p>{t("pages.trilha.shortcuts.findTroopsP1")}</p>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <img src={atalhosImg("image 2.png")} alt="" className="rounded-lg border border-aom-border" />
              <img src={atalhosImg("image 3.png")} alt="" className="rounded-lg border border-aom-border" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.findAllTitle")}
          </h2>
          <ShortcutTable
            headers={[thDesc, thShortcut]}
            rows={[
              {
                desc: (
                  <>
                    {t("pages.trilha.shortcuts.tableAllProductionBuildings")}{" "}
                    <Tok name="aomr_type_building_icon" /> <Tok name="aomr_type_human_soldier_icon" />{" "}
                    <Tok name="aomr_type_myth_unit_icon" /> <Tok name="aomr_type_hero_icon" />
                  </>
                ),
                shortcut: (
                  <>
                    <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>Espaço</Kbd>
                  </>
                ),
              },
              {
                desc: (
                  <>
                    {t("pages.trilha.shortcuts.tableAllMilitaryUnits")}{" "}
                    <Tok name="aomr_type_human_soldier_icon" /> <Tok name="aomr_type_myth_unit_icon" />{" "}
                    <Tok name="aomr_type_hero_icon" />
                  </>
                ),
                shortcut: (
                  <>
                    <Kbd>Alt</Kbd> + <Kbd>Shift</Kbd> + <Kbd>A</Kbd>
                  </>
                ),
              },
              {
                desc: t("pages.trilha.shortcuts.tableUnitsOnScreen"),
                shortcut: (
                  <>
                    <Kbd>Alt</Kbd> + <Kbd>A</Kbd>
                  </>
                ),
              },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.garrisonTitle")}
          </h2>
          <ShortcutTable
            headers={[thDesc, thShortcut]}
            rows={[
              {
                desc: t("pages.trilha.shortcuts.tableGarrisonEnter"),
                shortcut: (
                  <>
                    <Kbd>Alt</Kbd> + {t("pages.trilha.shortcuts.tableGarrisonEnterHint")}{" "}
                    <Tok name="aomr_type_building_icon" />
                  </>
                ),
              },
              {
                desc: t("pages.trilha.shortcuts.tableGarrisonEmpty"),
                shortcut: (
                  <>
                    {t("pages.trilha.shortcuts.tableGarrisonEmptyHint")} <Kbd>Alt</Kbd> + <Kbd>X</Kbd>
                  </>
                ),
              },
              {
                desc: t("pages.trilha.shortcuts.tableRaidShelter"),
                shortcut: (
                  <>
                    <Kbd>Alt</Kbd> + <Kbd>C</Kbd>
                  </>
                ),
              },
              {
                desc: t("pages.trilha.shortcuts.tableReturnWork"),
                shortcut: (
                  <>
                    {t("pages.trilha.shortcuts.tableGarrisonEmptyHint")} <Kbd>Alt</Kbd> + <Kbd>C</Kbd>
                  </>
                ),
              },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.groupingTitle")}
          </h2>
          <img src={atalhosImg("image 4.png")} alt="" className="mb-4 max-w-full rounded-lg border border-aom-border" />
          <p>{t("pages.trilha.shortcuts.groupingP1")}</p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-aom-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2">{thAction}</th>
                  <th className="px-3 py-2">{thShortcut}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">{t("pages.trilha.shortcuts.tableSelectGroup")}</td>
                  <td className="px-3 py-2">{t("pages.trilha.shortcuts.tableGroupNumber")}</td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">{t("pages.trilha.shortcuts.tableCreateGroup")}</td>
                  <td className="px-3 py-2">
                    <Kbd>Ctrl</Kbd> + {t("pages.trilha.shortcuts.tableGroupNumber").toLowerCase()}
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">{t("pages.trilha.shortcuts.tableAddToGroup")}</td>
                  <td className="px-3 py-2">
                    <Kbd>Shift</Kbd> + {t("pages.trilha.shortcuts.tableGroupNumber").toLowerCase()}
                  </td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-2">{t("pages.trilha.shortcuts.tableFocusGroup")}</td>
                  <td className="px-3 py-2">
                    <Kbd>Alt</Kbd> + {t("pages.trilha.shortcuts.tableGroupNumber").toLowerCase()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-zinc-100">{t("pages.trilha.shortcuts.quickSelectTitle")}</h3>
            <p>{t("pages.trilha.shortcuts.quickSelectP1")}</p>
            <p className="mt-2">{t("pages.trilha.shortcuts.quickSelectP2")}</p>
            <img src={atalhosImg("image 5.png")} alt="" className="mt-3 rounded-lg border border-aom-border" />
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-zinc-100">{t("pages.trilha.shortcuts.portraitsTitle")}</h3>
            <p>{t("pages.trilha.shortcuts.portraitsP1")}</p>
            <img src={atalhosImg("image 6.png")} alt="" className="mt-3 rounded-lg border border-aom-border" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.attackMoveTitle")}
          </h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <TrilhaTokenImg token="attackmove" className="h-auto w-24 shrink-0 object-contain" />
            <div className="space-y-2">
              <p>{t("pages.trilha.shortcuts.attackMoveP1")}</p>
            </div>
          </div>
          <video
            className="mt-4 max-h-[50vh] w-full max-w-lg rounded-lg border border-aom-border"
            controls
            src={atalhosImg("VID-20251119-WA0030.mp4")}
          >
            {t("pages.trilha.shortcuts.videoFallback")}
          </video>
          <div className="mt-4 aspect-video max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
            <iframe
              title={t("pages.trilha.shortcuts.attackMoveVideoTitle")}
              src={YT_ATTACK_MOVE}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.patrolTitle")}
          </h2>
          <p>{t("pages.trilha.shortcuts.patrolP1")}</p>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.militarySelectTitle")}
          </h2>
          <p className="mb-3">{t("pages.trilha.shortcuts.militarySelectP1")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <img src={atalhosImg("image 7.png")} alt="" className="rounded-lg border border-aom-border" />
            <img src={atalhosImg("image 8.png")} alt="" className="rounded-lg border border-aom-border" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-amber-100">
            {t("pages.trilha.shortcuts.productionQueueTitle")}
          </h2>
          <div className="flex flex-col gap-4 lg:flex-row">
            <img src={atalhosImg("image 9.png")} alt="" className="max-w-md rounded-lg border border-aom-border" />
            <div className="space-y-3">
              <p>{t("pages.trilha.shortcuts.productionQueueP1")}</p>
              <ShortcutTable
                headers={[thDesc, thShortcut]}
                rows={[
                  {
                    desc: t("pages.trilha.shortcuts.tableCancelLast"),
                    shortcut: <Kbd>Backspace</Kbd>,
                  },
                  {
                    desc: t("pages.trilha.shortcuts.tableCancelQueue"),
                    shortcut: (
                      <>
                        <Kbd>Shift</Kbd> + <Kbd>Backspace</Kbd>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <div className="aspect-video max-w-3xl overflow-hidden rounded-xl border border-aom-border bg-black/40">
          <iframe
            title={t("pages.trilha.shortcuts.videoTitle")}
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
