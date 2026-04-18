type NotionTextProps = {
  text: string;
  className?: string;
};

/**
 * Exibe texto exportado do Notion; trechos `:token:` viram etiquetas discretas.
 */
export function NotionText({ text, className }: NotionTextProps) {
  if (!text) return null;
  const parts = text.split(/(:[a-z0-9_]+:)/gi);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        /^:[a-z0-9_]+:$/i.test(part) ? (
          <span
            key={i}
            className="mx-0.5 inline rounded bg-zinc-800/90 px-1 py-0.5 align-baseline font-mono text-[0.65rem] text-amber-200/95"
            title={part}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
