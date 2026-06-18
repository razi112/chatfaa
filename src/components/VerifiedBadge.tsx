import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Meta-style verified badge (blue checkmark).
 * Awarded when a user has ≥5 posts, ≥5 reels, and ≥5 stories.
 */
interface VerifiedBadgeProps {
  className?: string;
  /** px size of the badge icon. Default 14 */
  size?: number;
  /** Show tooltip on hover. Default true */
  tooltip?: boolean;
}

export function VerifiedBadge({
  className,
  size = 14,
  tooltip = true,
}: VerifiedBadgeProps) {
  const badge = (
    <span
      className={cn("inline-flex items-center justify-center shrink-0", className)}
      aria-label="Verified"
      role="img"
      style={{ width: size, height: size }}
    >
      {/* Instagram / Meta-style filled blue circle with white check */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        aria-hidden
      >
        {/* Outer blue circle */}
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        {/* Inner lighter ring for depth */}
        <circle cx="12" cy="12" r="10.5" fill="#3B9EFF" />
        {/* White checkmark */}
        <path
          d="M7 12.5l3.5 3.5 6.5-7"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  if (!tooltip) return badge;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span wrapper keeps tooltip working inside flex rows */}
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="rounded-xl px-3 py-1.5 text-xs font-medium"
          style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.28 0.018 268)", color: "white" }}
        >
          Verified · earned by sharing 5 posts, 5 reels &amp; 5 stories
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
