import { PageHeader } from "@/components/ui/PageHeader";
import { clans } from "@/data/clans";
import { cn } from "@/lib/cn";

function logoInitials(tag: string) {
  const t = tag.replace(/[^a-zA-Z0-9]/g, "");
  if (t.length <= 2) return t.toUpperCase() || "?";
  return (t.slice(0, 1) + t.slice(-1)).toUpperCase();
}

function ClanLogo({ tag, logoSrc, name }: { tag: string; logoSrc?: string; name: string }) {
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-lg border border-zinc-600/80 bg-zinc-900 object-cover shadow-inner shadow-black/40"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-600/90 bg-zinc-950/80 font-mono text-xs font-semibold uppercase tracking-tight text-zinc-500 shadow-inner shadow-black/30"
      title={`Logo de ${name} — em breve`}
      aria-hidden
    >
      {logoInitials(tag)}
    </div>
  );
}

export function ClansPage() {
  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Clãs"
        description="Nossos clãs do Age of Mythology da comunidade BR!."
      />

      <div className="overflow-hidden rounded-2xl border border-aom-border/60 bg-[#141414] shadow-lg shadow-black/40">
        <div className="border-b border-zinc-800/90 px-4 py-3 sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Comunidade</p>
          <p className="mt-1 text-sm text-zinc-400">
            Alguns dados sobre os clãs do Age of Mythology da comunidade BR.
          </p>
        </div>

        {/* Desktop: tabela */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Lista de clãs com sigla, nome e logo</caption>
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th scope="col" className="w-14 px-4 py-3 text-center font-medium">
                  #
                </th>
                <th scope="col" className="w-16 px-2 py-3 font-medium">
                  Logo
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Sigla
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Nome
                </th>
              </tr>
            </thead>
            <tbody>
              {clans.map((c, i) => (
                <tr
                  key={c.slug}
                  className={cn(
                    "border-b border-zinc-800/90 transition-colors hover:bg-zinc-900/50",
                    i % 2 === 0 ? "bg-zinc-950/25" : "bg-zinc-900/20",
                  )}
                >
                  <td className="px-4 py-3 text-center tabular-nums text-zinc-500">{i + 1}</td>
                  <td className="px-2 py-3">
                    <ClanLogo tag={c.tag} logoSrc={c.logoSrc} name={c.name} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-mono text-sm font-medium text-sky-400/95">{c.tag}</span>
                  </td>
                  <td className="px-3 py-3 text-zinc-100">{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: cartões */}
        <ul className="divide-y divide-zinc-800/90 md:hidden" aria-label="Lista de clãs">
          {clans.map((c, i) => (
            <li
              key={c.slug}
              className={cn("flex items-center gap-4 px-4 py-4", i % 2 === 0 ? "bg-zinc-950/30" : "bg-zinc-900/15")}
            >
              <span className="w-6 shrink-0 text-center text-xs tabular-nums text-zinc-500">{i + 1}</span>
              <ClanLogo tag={c.tag} logoSrc={c.logoSrc} name={c.name} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium text-sky-400/95">{c.tag}</p>
                <p className="truncate text-sm text-zinc-200">{c.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
