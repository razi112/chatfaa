import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
export type FollowStatus = "none" | "pending" | "accepted";

export interface FollowRelationship {
  i_follow: FollowStatus;
  they_follow: FollowStatus;
  is_mutual: boolean;
  is_blocked: boolean;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

export interface FollowUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_mutual?: boolean;
}

export interface SuggestedUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  mutual_count: number;
}

export interface SearchUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  follow_status: FollowStatus;
}

// Safe fallbacks so UI never crashes even if migration hasn't run yet
const DEFAULT_COUNTS: FollowCounts = { followers: 0, following: 0 };
const DEFAULT_REL: FollowRelationship = {
  i_follow: "none", they_follow: "none", is_mutual: false, is_blocked: false,
};

// ─── useFollowCounts ──────────────────────────────────────────
export function useFollowCounts(userId: string) {
  return useQuery({
    queryKey: ["follow-counts", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_follow_counts", { _user_id: userId });
        if (error) return DEFAULT_COUNTS;
        const row = (data as any)?.[0];
        return {
          followers: Number(row?.followers ?? 0),
          following: Number(row?.following ?? 0),
        } as FollowCounts;
      } catch {
        return DEFAULT_COUNTS;
      }
    },
  });
}

// ─── useFollowRelationship ────────────────────────────────────
export function useFollowRelationship(targetId: string, meId: string) {
  return useQuery({
    queryKey: ["follow-rel", meId, targetId],
    // Only fetch when both IDs are present and different
    enabled: !!targetId && !!meId && targetId !== meId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_follow_relationship", { _target: targetId });
        if (error) return DEFAULT_REL;
        const row = (data as any)?.[0];
        return {
          i_follow: (row?.i_follow ?? "none") as FollowStatus,
          they_follow: (row?.they_follow ?? "none") as FollowStatus,
          is_mutual: row?.is_mutual ?? false,
          is_blocked: row?.is_blocked ?? false,
        } as FollowRelationship;
      } catch {
        return DEFAULT_REL;
      }
    },
  });
}

// ─── useFollowActions ─────────────────────────────────────────
export function useFollowActions(meId: string) {
  const qc = useQueryClient();

  const invalidate = (targetId: string) => {
    qc.invalidateQueries({ queryKey: ["follow-rel", meId, targetId] });
    qc.invalidateQueries({ queryKey: ["follow-counts", targetId] });
    qc.invalidateQueries({ queryKey: ["follow-counts", meId] });
    qc.invalidateQueries({ queryKey: ["suggested-users"] });
    qc.invalidateQueries({ queryKey: ["notifications", meId] });
  };

  const follow = useMutation({
    mutationFn: async (targetId: string) => {
      const { data, error } = await supabase.rpc("follow_user", { _target: targetId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (result, targetId) => {
      if (result === "accepted") toast.success("Following!");
      else if (result === "pending") toast.success("Follow request sent");
      else if (result === "blocked") toast.error("Cannot follow this user");
      invalidate(targetId);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to follow"),
  });

  const unfollow = useMutation({
    mutationFn: async (targetId: string) => {
      const { error } = await supabase.rpc("unfollow_user", { _target: targetId });
      if (error) throw error;
    },
    onSuccess: (_, targetId) => {
      toast.success("Unfollowed");
      invalidate(targetId);
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to unfollow"),
  });

  const acceptRequest = useMutation({
    mutationFn: async (followerId: string) => {
      const { error } = await supabase.rpc("accept_follow_request", { _follower: followerId });
      if (error) throw error;
    },
    onSuccess: (_, followerId) => {
      toast.success("Follow request accepted");
      qc.invalidateQueries({ queryKey: ["follow-requests"] });
      qc.invalidateQueries({ queryKey: ["follow-counts", meId] });
      qc.invalidateQueries({ queryKey: ["followers", meId] });
      qc.invalidateQueries({ queryKey: ["notifications", meId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to accept"),
  });

  const declineRequest = useMutation({
    mutationFn: async (followerId: string) => {
      const { error } = await supabase.rpc("decline_follow_request", { _follower: followerId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-requests"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to decline"),
  });

  const removeFollower = useMutation({
    mutationFn: async (followerId: string) => {
      const { error } = await supabase.rpc("remove_follower", { _follower: followerId });
      if (error) throw error;
    },
    onSuccess: (_, followerId) => {
      toast.success("Follower removed");
      qc.invalidateQueries({ queryKey: ["followers", meId] });
      qc.invalidateQueries({ queryKey: ["follow-counts", meId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to remove follower"),
  });

  return { follow, unfollow, acceptRequest, declineRequest, removeFollower };
}

// ─── useFollowers ─────────────────────────────────────────────
export function useFollowers(userId: string) {
  return useQuery({
    queryKey: ["followers", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_followers", { _user_id: userId });
        if (error) return [] as FollowUser[];
        return (data ?? []) as FollowUser[];
      } catch {
        return [] as FollowUser[];
      }
    },
  });
}

// ─── useFollowing ─────────────────────────────────────────────
export function useFollowing(userId: string) {
  return useQuery({
    queryKey: ["following", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_following", { _user_id: userId });
        if (error) return [] as FollowUser[];
        return (data ?? []) as FollowUser[];
      } catch {
        return [] as FollowUser[];
      }
    },
  });
}

// ─── useFollowRequests ────────────────────────────────────────
export function useFollowRequests() {
  return useQuery({
    queryKey: ["follow-requests"],
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_follow_requests");
        if (error) return [] as Array<FollowUser & { requested_at: string }>;
        return (data ?? []) as Array<FollowUser & { requested_at: string }>;
      } catch {
        return [] as Array<FollowUser & { requested_at: string }>;
      }
    },
  });
}

// ─── useSuggestedUsers ────────────────────────────────────────
export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggested-users"],
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_suggested_users");
        if (error) return [] as SuggestedUser[];
        return (data ?? []) as SuggestedUser[];
      } catch {
        return [] as SuggestedUser[];
      }
    },
  });
}

// ─── useNotifications ─────────────────────────────────────────
export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  entity_id: string | null;
  read: boolean;
  created_at: string;
  actor?: { username: string; display_name: string | null; avatar_url: string | null };
};

export function useNotifications(meId: string) {
  return useQuery({
    queryKey: ["notifications", meId],
    enabled: !!meId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("notifications")
          .select("*")
          .eq("user_id", meId)
          .order("created_at", { ascending: false })
          .limit(50);

        // If table doesn't exist yet, return empty gracefully
        if (error) return [] as Notification[];

        const notifs = (data ?? []) as Notification[];
        if (notifs.length === 0) return notifs;

        // Fetch actor profiles
        const actorIds = [...new Set(notifs.map((n) => n.actor_id))];
        const { data: actors } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", actorIds);

        const actorMap: Record<string, any> = {};
        (actors ?? []).forEach((a: any) => { actorMap[a.id] = a; });

        return notifs.map((n) => ({ ...n, actor: actorMap[n.actor_id] }));
      } catch {
        return [] as Notification[];
      }
    },
  });
}
