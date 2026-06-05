import { CommunityVideoTagBadge } from "@/components/community/CommunityVideoTagBadge";
import { cn } from "@/lib/cn";
import { hexToRgba } from "@/lib/tagColorUtils";
import type { CommunityVideoTag } from "@/lib/communityVideosApi";

type Props = {
  tags: CommunityVideoTag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  label: string;
};

export function CommunityVideoTagMultiselect({
  tags,
  selectedIds,
  onChange,
  disabled,
  label,
}: Props) {
  function toggle(tagId: string) {
    if (disabled) return;
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  }

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm text-zinc-400">{label}</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {tags.map((tag) => {
          const selected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={cn(
                "cursor-pointer rounded-full transition focus:outline-none focus:ring-2 focus:ring-amber-500/35",
                selected ? "ring-2 ring-offset-1 ring-offset-zinc-950" : "opacity-75 hover:opacity-100",
              )}
              style={selected ? { boxShadow: `0 0 0 2px ${hexToRgba(tag.colorHex, 0.55)}` } : undefined}
              aria-pressed={selected}
            >
              <CommunityVideoTagBadge tag={tag} size="sm" />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
