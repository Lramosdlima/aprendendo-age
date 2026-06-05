import { cn } from "@/lib/cn";
import { hexToRgba, tagBadgeTextColor } from "@/lib/tagColorUtils";
import type { CommunityVideoTag } from "@/lib/communityVideosApi";

type Props = {
  tag: CommunityVideoTag;
  className?: string;
  size?: "sm" | "xs";
};

export function CommunityVideoTagBadge({ tag, className, size = "xs" }: Props) {
  const borderColor = tag.colorHex;
  const bgColor = hexToRgba(tag.colorHex, 0.18);
  const textColor = tagBadgeTextColor(tag.colorHex);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border font-medium capitalize",
        size === "xs" ? "px-2 py-0.5 text-[10px] leading-tight" : "px-2.5 py-0.5 text-xs",
        className,
      )}
      style={{
        borderColor,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <span className="truncate">{tag.name}</span>
    </span>
  );
}
