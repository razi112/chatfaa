/**
 * SharedPostCard — renders inside a DM message bubble when the content
 * is a share envelope (starts with SHARE_PREFIX).
 *
 * Tapping the card navigates the user to the original post or reel.
 */

import { Play, Film, ImageIcon, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { decodeShareMessage } from "@/components/ShareModal";
import { cn } from "@/lib/utils";

interface SharedPostCardProps {
  content: string;
  mine: boolean;
}

export function SharedPostCard({ content, mine }: SharedPostCardProps) {
  const data = decodeShareMessage(content);
  if (!data) return null;

  const isReel = data.type === "reel";
  const hasThumbnail = !!data.thumbnailUrl;

  // Route to the correct page
  const linkTo = isReel ? "/reels" : "/feed";
  const linkHash = isReel ? `reel-${data.id}` : `post-${data.id}`;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl w-[220px] sm:w-[260px] transition-all",
        mine ? "rounded-tr-sm" : "rounded-tl-sm"
      )}
      style={{
        background: mine
          ? "oklch(0.55 0.22 280 / 0.35)"
          : "oklch(0.18 0.016 268)",
        border: mine
          ? "1px solid oklch(0.65 0.22 280 / 0.4)"
          : "1px solid oklch(0.26 0.018 268)",
        boxShadow: mine
          ? "0 4px 16px -4px oklch(0.65 0.22 280 / 0.3)"
          : "0 2px 8px -2px oklch(0 0 0 / 0.3)",
      }}
    >
      {/* Thumbnail / placeholder */}
      <a
        href={`${linkTo}#${linkHash}`}
        onClick={(e) => {
          // Use anchor navigation so TanStack Router handles it cleanly
          e.preventDefault();
          window.location.href = `${linkTo}#${linkHash}`;
        }}
        className="block relative overflow-hidden"
        style={{ aspectRatio: isReel ? "9/16" : "4/5", maxHeight: 220 }}
      >
        {hasThumbnail ? (
          <img
            src={data.thumbnailUrl!}
            alt={data.caption ?? (isReel ? "Reel" : "Post")}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "oklch(0.16 0.016 268)" }}
          >
            {isReel
              ? <Film className="h-8 w-8 text-muted-foreground/50" />
              : <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
            }
          </div>
        )}

        {/* Reel play icon overlay */}
        {isReel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="h-10 w-10 rounded-full grid place-items-center"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        />

        {/* Author tag */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <span className="text-white text-[11px] font-semibold drop-shadow truncate block">
            @{data.authorUsername}
          </span>
        </div>
      </a>

      {/* Footer */}
      <div className="px-3 py-2.5 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Caption */}
          {data.caption ? (
            <p
              className={cn(
                "text-xs leading-relaxed line-clamp-2",
                mine ? "text-white/90" : "text-foreground"
              )}
            >
              {data.caption}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {isReel ? "Reel" : "Post"} by @{data.authorUsername}
            </p>
          )}

          {/* Optional personal message */}
          {data.message && (
            <p
              className={cn(
                "text-[11px] mt-1 italic",
                mine ? "text-white/60" : "text-muted-foreground"
              )}
            >
              "{data.message}"
            </p>
          )}
        </div>

        {/* External link icon */}
        <a
          href={`${linkTo}#${linkHash}`}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `${linkTo}#${linkHash}`;
          }}
          className={cn(
            "shrink-0 h-6 w-6 grid place-items-center rounded-lg transition-all hover:opacity-70",
            mine ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`Open ${isReel ? "reel" : "post"}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

/** Quick check — is this message content a share card? */
export function isShareMessage(content: string): boolean {
  return content.startsWith("__share__:");
}
