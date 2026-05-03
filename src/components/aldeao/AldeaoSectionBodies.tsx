import type { ReactNode } from "react";

import { InfoRow } from "@/components/ui/InfoRow";
import { InfoRowPortraitOrText } from "@/components/ui/InfoRowPortraitCluster";
import { NotionText } from "@/components/ui/NotionText";
import { PortraitHeaderActions } from "@/components/ui/PortraitHeaderActions";
import { aldeoes, panteaoById, panteaoSlugById } from "@/data/catalog";
import { firstNome, firstNumId } from "@/lib/entityRefs";
import type { ListIndexLinkState } from "@/lib/listIndexReturnState";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

type A = (typeof aldeoes)[number];

export function AldeaoGeralBody({ a, linkState }: { a: A; linkState?: ListIndexLinkState }) {
  const panteaoId = firstNumId(a.panteao);
  const panteao = panteaoId != null ? panteaoById.get(panteaoId) : undefined;

  return (
    <div className="space-y-0">
      {panteao ? (
        <InfoRow label="Panteão">
          <InfoRowPortraitOrText
            portraits={
              <PortraitHeaderActions
                items={[
                  {
                    key: String(panteao.id),
                    to: `/panteoes/${panteaoSlugById.get(panteao.id) ?? panteao.id}`,
                    nome: panteao.nome,
                    src: getPantheonWatermarkUrl(panteao),
                  },
                ]}
                linkState={linkState ?? {}}
                size="sm"
                justify="start"
              />
            }
            textFallback={null}
          />
        </InfoRow>
      ) : firstNome(a.panteao) ? (
        <InfoRow label="Panteão">
          <InfoRowPortraitOrText portraits={null} textFallback={<NotionText text={firstNome(a.panteao)!} />} />
        </InfoRow>
      ) : null}
      <InfoRow label="Vida" icon="aomr_hit_points_icon">
        {a.vida ?? "—"}
      </InfoRow>
      <InfoRow label="População" icon="aomr_population_provision_icon">
        {a.populacao ?? "—"}
      </InfoRow>
      <InfoRow label="Recursos (custo)" icon="aomr_type_villager_icon">
        {a.recursos ?? "—"}
      </InfoRow>
      {a.carne != null && (
        <InfoRow label="Recursos (custo) - comida" icon="foodaom">
          {a.carne}
        </InfoRow>
      )}
      {a.madeira != null && (
        <InfoRow label="Recursos (custo) - madeira" icon="woodaom">
          {a.madeira}
        </InfoRow>
      )}
      {a.ouro != null && (
        <InfoRow label="Recursos (custo) - ouro" icon="aomr_gold_icon">
          {a.ouro}
        </InfoRow>
      )}
      <InfoRow label="Treino (s)" icon="aomr_time_icon">
        {a.tempo_de_treinamento ?? "—"}
      </InfoRow>
      <InfoRow label="Treino patch (s)" icon="aomr_time_icon">
        {a.tempo_de_treinamento_patch_18_65484 ?? "—"}
      </InfoRow>
    </div>
  );
}

function coletaRow(label: string, icon: string, value: ReactNode) {
  return (
    <InfoRow label={label} icon={icon}>
      {value}
    </InfoRow>
  );
}

export function AldeaoColetaBody({ a }: { a: A }) {
  return (
    <div className="space-y-0">
      {coletaRow("Caçar", "aomr_caribou_icon", a.cacar ?? "—")}
      {coletaRow("Gado / galinhas", "aomr_cow_icon", a.gado_galinhas ?? "—")}
      {coletaRow("Frutinhas", "aomr_berry_bush_icon", a.frutinhas ?? "—")}
      {coletaRow("Fazenda", "aomr_farm_icon", a.fazenda ?? "—")}
      {coletaRow("Árvore", "aomr_tree_oak_icon", a.arvore ?? "—")}
      {coletaRow("Mina", "aomr_gold_mine_icon", a.mina ?? "—")}
      {coletaRow("Velocidade construção", "aomr_type_building_icon", a.velocidade_construcao ?? "—")}
    </div>
  );
}

export function AldeaoBonusBody({ a }: { a: A }) {
  return (
    <div className="space-y-0">
      <InfoRow label="Caçar %" icon="aomr_caribou_icon">
        {a.cacar_porcento ?? 0}
      </InfoRow>
      <InfoRow label="Gado %" icon="aomr_cow_icon">
        {a.gado_porcento ?? 0}
      </InfoRow>
      <InfoRow label="Frutinhas %" icon="aomr_berry_bush_icon">
        {a.frutinhas_porcento ?? 0}
      </InfoRow>
      <InfoRow label="Fazenda %" icon="aomr_farm_icon">
        {a.fazenda_porcento ?? 0}
      </InfoRow>
      <InfoRow label="Árvore %" icon="aomr_tree_oak_icon">
        {a.arvore_porcento ?? 0}
      </InfoRow>
      <InfoRow label="Mina %" icon="aomr_gold_mine_icon">
        {a.mina_porcento ?? 0}
      </InfoRow>
      <InfoRow label="Construção %" icon="aomr_type_building_icon">
        {a.velocidade_construcao_porcento ?? 0}
      </InfoRow>
    </div>
  );
}
