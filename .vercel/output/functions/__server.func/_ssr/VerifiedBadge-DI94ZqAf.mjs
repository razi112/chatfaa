import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn } from "./utils-DsLFkheH.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VerifiedBadge-DI94ZqAf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_COUNTS = {
	followers: 0,
	following: 0
};
var DEFAULT_REL = {
	i_follow: "none",
	they_follow: "none",
	is_mutual: false,
	is_blocked: false
};
function useFollowCounts(userId) {
	return useQuery({
		queryKey: ["follow-counts", userId],
		enabled: !!userId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("get_follow_counts", { _user_id: userId });
				if (error) return DEFAULT_COUNTS;
				const row = data?.[0];
				return {
					followers: Number(row?.followers ?? 0),
					following: Number(row?.following ?? 0)
				};
			} catch {
				return DEFAULT_COUNTS;
			}
		}
	});
}
function useFollowRelationship(targetId, meId) {
	return useQuery({
		queryKey: [
			"follow-rel",
			meId,
			targetId
		],
		enabled: !!targetId && !!meId && targetId !== meId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("get_follow_relationship", { _target: targetId });
				if (error) return DEFAULT_REL;
				const row = data?.[0];
				return {
					i_follow: row?.i_follow ?? "none",
					they_follow: row?.they_follow ?? "none",
					is_mutual: row?.is_mutual ?? false,
					is_blocked: row?.is_blocked ?? false
				};
			} catch {
				return DEFAULT_REL;
			}
		}
	});
}
function useFollowActions(meId) {
	const qc = useQueryClient();
	const invalidate = (targetId) => {
		qc.invalidateQueries({ queryKey: [
			"follow-rel",
			meId,
			targetId
		] });
		qc.invalidateQueries({ queryKey: ["follow-counts", targetId] });
		qc.invalidateQueries({ queryKey: ["follow-counts", meId] });
		qc.invalidateQueries({ queryKey: ["suggested-users"] });
		qc.invalidateQueries({ queryKey: ["notifications", meId] });
	};
	return {
		follow: useMutation({
			mutationFn: async (targetId) => {
				const { data, error } = await supabase.rpc("follow_user", { _target: targetId });
				if (error) throw error;
				return data;
			},
			onSuccess: (result, targetId) => {
				if (result === "accepted") toast.success("Following!");
				else if (result === "pending") toast.success("Follow request sent");
				else if (result === "blocked") toast.error("Cannot follow this user");
				invalidate(targetId);
			},
			onError: (e) => toast.error(e.message ?? "Failed to follow")
		}),
		unfollow: useMutation({
			mutationFn: async (targetId) => {
				const { error } = await supabase.rpc("unfollow_user", { _target: targetId });
				if (error) throw error;
			},
			onSuccess: (_, targetId) => {
				toast.success("Unfollowed");
				invalidate(targetId);
			},
			onError: (e) => toast.error(e.message ?? "Failed to unfollow")
		}),
		acceptRequest: useMutation({
			mutationFn: async (followerId) => {
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
			onError: (e) => toast.error(e.message ?? "Failed to accept")
		}),
		declineRequest: useMutation({
			mutationFn: async (followerId) => {
				const { error } = await supabase.rpc("decline_follow_request", { _follower: followerId });
				if (error) throw error;
			},
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: ["follow-requests"] });
			},
			onError: (e) => toast.error(e.message ?? "Failed to decline")
		}),
		removeFollower: useMutation({
			mutationFn: async (followerId) => {
				const { error } = await supabase.rpc("remove_follower", { _follower: followerId });
				if (error) throw error;
			},
			onSuccess: (_, followerId) => {
				toast.success("Follower removed");
				qc.invalidateQueries({ queryKey: ["followers", meId] });
				qc.invalidateQueries({ queryKey: ["follow-counts", meId] });
			},
			onError: (e) => toast.error(e.message ?? "Failed to remove follower")
		})
	};
}
function useFollowers(userId) {
	return useQuery({
		queryKey: ["followers", userId],
		enabled: !!userId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("get_followers", { _user_id: userId });
				if (error) return [];
				return data ?? [];
			} catch {
				return [];
			}
		}
	});
}
function useFollowing(userId) {
	return useQuery({
		queryKey: ["following", userId],
		enabled: !!userId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("get_following", { _user_id: userId });
				if (error) return [];
				return data ?? [];
			} catch {
				return [];
			}
		}
	});
}
function useFollowRequests() {
	return useQuery({
		queryKey: ["follow-requests"],
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("get_follow_requests");
				if (error) return [];
				return data ?? [];
			} catch {
				return [];
			}
		}
	});
}
function useSuggestedUsers() {
	return useQuery({
		queryKey: ["suggested-users"],
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("get_suggested_users");
				if (error) return [];
				return data ?? [];
			} catch {
				return [];
			}
		}
	});
}
function useNotifications(meId) {
	return useQuery({
		queryKey: ["notifications", meId],
		enabled: !!meId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("notifications").select("*").eq("user_id", meId).order("created_at", { ascending: false }).limit(50);
				if (error) return [];
				const notifs = data ?? [];
				if (notifs.length === 0) return notifs;
				const actorIds = [...new Set(notifs.map((n) => n.actor_id))];
				const { data: actors } = await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", actorIds);
				const actorMap = {};
				(actors ?? []).forEach((a) => {
					actorMap[a.id] = a;
				});
				return notifs.map((n) => ({
					...n,
					actor: actorMap[n.actor_id]
				}));
			} catch {
				return [];
			}
		}
	});
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
function VerifiedBadge({ className, size = 14, tooltip = true }) {
	const badge = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center justify-center shrink-0", className),
		"aria-label": "Verified",
		role: "img",
		style: {
			width: size,
			height: size
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 24 24",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg",
			width: size,
			height: size,
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "12",
					r: "12",
					fill: "#1877F2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "12",
					r: "10.5",
					fill: "#3B9EFF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M7 12.5l3.5 3.5 6.5-7",
					stroke: "white",
					strokeWidth: "2.2",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			]
		})
	});
	if (!tooltip) return badge;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 200,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex",
				children: badge
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "top",
			className: "rounded-xl px-3 py-1.5 text-xs font-medium",
			style: {
				background: "oklch(0.16 0.016 268)",
				border: "1px solid oklch(0.28 0.018 268)",
				color: "white"
			},
			children: "Verified · earned by sharing 5 posts, 5 reels & 5 stories"
		})] })
	});
}
//#endregion
export { useFollowRequests as a, useNotifications as c, useFollowRelationship as i, useSuggestedUsers as l, useFollowActions as n, useFollowers as o, useFollowCounts as r, useFollowing as s, VerifiedBadge as t };
