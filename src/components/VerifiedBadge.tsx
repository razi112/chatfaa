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
      {/* Meta / Instagram exact verified badge shape */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        aria-hidden
      >
        {/* Meta's badge: rounded star / shield shape in blue */}
        <path
          d="M20 2.5
             L23.6 5.8 L28.5 4.9 L30.5 9.5 L35.2 11.4
             L34.4 16.3 L37.5 20 L34.4 23.7
             L35.2 28.6 L30.5 30.5 L28.5 35.1
             L23.6 34.2 L20 37.5 L16.4 34.2
             L11.5 35.1 L9.5 30.5 L4.8 28.6
             L5.6 23.7 L2.5 20 L5.6 16.3
             L4.8 11.4 L9.5 9.5 L11.5 4.9
             L16.4 5.8 Z"
          fill="#0095F6"
        />
        {/* White checkmark — Meta style */}
        <path
          d="M13.5 20.5 L17.5 24.5 L27 15"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
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
