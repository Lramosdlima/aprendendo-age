/** Evita expandir de novo se já houver :aomr_*: logo após a palavra. */
export const NOT_IF_ICON = String.raw`(?!\s*:aomr_)`;
/** Não expandir logo após letra/número nem após «>» de tag. */
export const B = String.raw`(?<![\p{L}\p{M}\p{N}_<>])`;
export const A = String.raw`(?![\p{L}\p{M}\p{N}_])`;
export const U = "giu" as const;
