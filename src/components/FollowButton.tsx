import { useState } from "react";
import { UserPlus, UserCheck, Clock, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useFollowRelationship, useFollowActions } from "@/hooks/use-follow";

interface FollowButtonProps {
  targetId: string;
  meId: string;
  size?: "sm" | "default";
  className?: string;
}

export function FollowButton({ targetId, meId, size = "default", className }: FollowButtonProps) {
  const relQ = useFollowRelationship(targetId, meId);
  const { follow, unfollow } = useFollowActions(meId);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);

  if (targetId === meId) return null;

  const rel = relQ.data;
  const isLoading = relQ.isLoading || follow.isPending || unfollow.isPending;

  // Not following yet
  if (!rel || rel.i_follow === "none") {
    return (
      <Button
        size={size}
        disabled={isLoading}
        onClick={() => follow.mutate(targetId)}
        className={cn(
          "gap-1.5 font-semibold rounded-xl",
          size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-5 text-sm",
          className
        )}
        style={{ background: "var(--gradient-primary)" }}
      >
        {isLoading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <UserPlus className="h-3.5 w-3.5" />
        }
        Follow
      </Button>
    );
  }

  // Pending request
  if (rel.i_follow === "pending") {
    return (
      <Button
        size={size}
        variant="outline"
        disabled={isLoading}
        onClick={() => unfollow.mutate(targetId)}
        className={cn(
          "gap-1.5 font-semibold rounded-xl border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
          size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-5 text-sm",
          className
        )}
      >
        {isLoading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Clock className="h-3.5 w-3.5" />
        }
        Requested
      </Button>
    );
  }

  // Following — dropdown to unfollow
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant="outline"
          disabled={isLoading}
          className={cn(
            "gap-1.5 font-semibold rounded-xl",
            size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-5 text-sm",
            rel.is_mutual && "border-green-500/40 text-green-400",
            className
          )}
          style={{ borderColor: rel.is_mutual ? undefined : "oklch(0.35 0.018 268)" }}
        >
          {isLoading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <UserCheck className="h-3.5 w-3.5" />
          }
          {rel.is_mutual ? "Mutual" : "Following"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xl"
        style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.24 0.018 268)" }}
      >
        <DropdownMenuItem
          onClick={() => unfollow.mutate(targetId)}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg gap-2"
        >
          <UserMinus className="h-4 w-4" />
          Unfollow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
