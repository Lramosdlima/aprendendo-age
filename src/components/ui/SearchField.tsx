type SearchFieldProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

export function SearchField({ value, onChange, placeholder, id = "search", className }: SearchFieldProps) {
  return (
    <div className={className ?? "relative max-w-md"}>
      <label htmlFor={id} className="sr-only">
        Buscar
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Buscar…"}
        className="w-full rounded-xl border border-aom-border bg-aom-card px-4 py-2.5 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/25"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden>
        ⌕
      </span>
    </div>
  );
}
