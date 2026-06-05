import { Link, type To } from "react-router-dom";

import { CommunityVideoTagBadge } from "@/components/community/CommunityVideoTagBadge";
import { cn } from "@/lib/cn";
import type { CommunityVideoTag } from "@/lib/communityVideosApi";

type Props = {
  to: To;
  linkState?: unknown;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  channelAvatarUrl?: string | null;
  tags?: CommunityVideoTag[];
  className?: string;
};

export function CommunityVideoCard({
  to,
  linkState,
  title,
  description,
  thumbnailUrl,
  channelAvatarUrl,
  tags = [],
  className,
}: Props) {
  return (
    <Link
      to={to}
      state={linkState}
      className={cn(
        "group flex min-h-0 flex-col overflow-hidden rounded-xl border border-aom-border bg-zinc-950/60 shadow-sm shadow-black/25 transition",
        "hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-950/20",
        className,
      )}
    >
      <div className="relative z-10 shrink-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950/80 px-3 pb-2.5 pt-3">
        <div className="flex items-start gap-2.5">
          {channelAvatarUrl ? (
            <img
              src={channelAvatarUrl}
              alt=""
              className="mt-0.5 size-8 shrink-0 rounded-full border border-zinc-700/80 bg-zinc-900 object-cover shadow-md shadow-black/50"
            />
          ) : (
            <span
              aria-hidden
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-600 bg-zinc-900/80 text-xs text-zinc-500"
            >
              ▶
            </span>
          )}
          <h2 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-sm font-semibold leading-snug text-amber-50 [text-shadow:0_1px_8px_rgba(0,0,0,0.85),0_0_1px_rgba(0,0,0,1)] line-clamp-2 group-hover:text-amber-50/95">
            {title}
          </h2>
        </div>
        {tags.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <CommunityVideoTagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-zinc-900/90">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="size-full object-contain object-center"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-zinc-600">
            <span className="text-4xl opacity-40" aria-hidden>
              ▶
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 shrink-0 border-t border-zinc-800/80 bg-zinc-950/95 px-3 py-2.5 min-h-[3.75rem]">
        {description ? (
          <p className="overflow-hidden text-xs leading-relaxed text-zinc-400 line-clamp-2 [overflow-wrap:anywhere]">
            {description.replace(/\s+/g, " ").trim()}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
