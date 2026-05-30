import { useCatalog } from "@/hooks/useCatalog";
import { getPantheonWatermarkUrl } from "@/lib/pantheonAssetUrl";

const imgClass =
  "notion-token-inline mr-0.5 inline-block h-[1em] max-h-[1.1em] w-auto shrink-0 align-[-0.12em] object-contain";

type PantheonMetaIconProps = {
  panteaoId: number;
};

/** Ícone da civilização (`assets/pantheons`) antes do texto da meta — recebe o id numérico do panteão (ex. `firstNumId(unidade.panteao)` ou `firstNumId(tecnologia.panteoes)`). */
export function PantheonMetaIcon({ panteaoId }: PantheonMetaIconProps) {
  const { panteaoById } = useCatalog();
  const p = panteaoById.get(panteaoId);
  const src = p ? getPantheonWatermarkUrl(p) : undefined;
  if (!src) return null;
  const nome = panteaoById.get(panteaoId)?.nome;
  return <img src={src} alt="" aria-hidden title={nome} className={imgClass} />;
}
