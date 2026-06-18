import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, r as useAuth } from "./utils-DsLFkheH.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { t as Label } from "./label-CsVfh20r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Grid3x3, G as LoaderCircle, U as Lock, W as LockOpen, X as House, Y as ImagePlus, Z as Heart, at as Ellipsis, g as Trash2, k as Play, mt as Camera, n as X, o as Video, p as Upload, pt as Check, tt as Flag, u as UserPlus, x as Shield, xt as ArrowLeft, z as MessageCircle } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, c as Textarea, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-CqBxy85j.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-D2ZxaxMO.mjs";
import { a as DropdownMenuTrigger, i as DropdownMenuSeparator, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-Br-kiqFc.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-wX8RxjBC.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useFollowRequests, i as useFollowRelationship, n as useFollowActions, o as useFollowers, r as useFollowCounts, s as useFollowing, t as VerifiedBadge } from "./VerifiedBadge-DI94ZqAf.mjs";
import { t as FollowButton } from "./FollowButton-CUmywuFW.mjs";
import { t as Route } from "./profile-5OcV-a7P.mjs";
import { t as Switch } from "./switch-ByjIL8e5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-DdA3zya-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function initials$1(name) {
	return name?.slice(0, 2).toUpperCase() ?? "?";
}
function FollowListModal({ userId, meId, isOwnProfile, initialTab = "followers", onClose, requestCount = 0 }) {
	const [tab, setTab] = (0, import_react.useState)(initialTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden",
			style: {
				maxHeight: "75dvh",
				background: "oklch(0.14 0.015 268 / 0.98)",
				backdropFilter: "blur(20px)",
				border: "1px solid oklch(0.26 0.018 268)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-1 shrink-0 sm:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-white/20" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-3 border-b shrink-0",
					style: { borderColor: "oklch(0.22 0.016 268)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1",
						children: [
							"followers",
							"following",
							...isOwnProfile ? ["requests"] : []
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab(t),
							className: cn("px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize relative", tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"),
							style: tab === t ? { background: "var(--gradient-primary)" } : {},
							children: [t, t === "requests" && requestCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center",
								style: { background: "oklch(0.62 0.22 25)" },
								children: requestCount
							})]
						}, t))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-muted-foreground hover:text-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto min-h-0",
					children: [
						tab === "followers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowersList, {
							userId,
							meId,
							isOwnProfile,
							onClose
						}),
						tab === "following" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowingList, {
							userId,
							meId,
							onClose
						}),
						tab === "requests" && isOwnProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestsList, {
							meId,
							onClose
						})
					]
				})
			]
		})
	});
}
function FollowersList({ userId, meId, isOwnProfile, onClose }) {
	const { data: followers = [], isLoading } = useFollowers(userId);
	const { removeFollower } = useFollowActions(meId);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListLoader, {});
	if (followers.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListEmpty, { label: "No followers yet" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y",
		style: { borderColor: "oklch(0.20 0.016 268)" },
		children: followers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserListRow, {
			user: u,
			meId,
			onClose,
			rightSlot: isOwnProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => removeFollower.mutate(u.id),
				disabled: removeFollower.isPending,
				className: "h-8 px-3 rounded-xl text-xs font-medium border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all",
				style: { borderColor: "oklch(0.28 0.018 268)" },
				children: removeFollower.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : "Remove"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowButton, {
				targetId: u.id,
				meId,
				size: "sm"
			})
		}, u.id))
	});
}
function FollowingList({ userId, meId, onClose }) {
	const { data: following = [], isLoading } = useFollowing(userId);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListLoader, {});
	if (following.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListEmpty, { label: "Not following anyone yet" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y",
		style: { borderColor: "oklch(0.20 0.016 268)" },
		children: following.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserListRow, {
			user: u,
			meId,
			onClose,
			rightSlot: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowButton, {
				targetId: u.id,
				meId,
				size: "sm"
			})
		}, u.id))
	});
}
function RequestsList({ meId, onClose }) {
	const { data: requests = [], isLoading } = useFollowRequests();
	const { acceptRequest, declineRequest } = useFollowActions(meId);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListLoader, {});
	if (requests.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListEmpty, { label: "No pending requests" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y",
		style: { borderColor: "oklch(0.20 0.016 268)" },
		children: requests.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserListRow, {
			user: u,
			meId,
			onClose,
			rightSlot: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => acceptRequest.mutate(u.id),
					disabled: acceptRequest.isPending,
					className: "h-8 w-8 rounded-xl grid place-items-center text-white transition-all hover:opacity-90",
					style: { background: "var(--gradient-primary)" },
					children: acceptRequest.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => declineRequest.mutate(u.id),
					disabled: declineRequest.isPending,
					className: "h-8 w-8 rounded-xl grid place-items-center text-muted-foreground border hover:text-destructive hover:border-destructive/40 transition-all",
					style: { borderColor: "oklch(0.28 0.018 268)" },
					children: declineRequest.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})]
			})
		}, u.id))
	});
}
function UserListRow({ user, meId, onClose, rightSlot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/profile",
				search: { userId: user.id },
				onClick: onClose,
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
					className: "h-9 w-9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: user.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "text-[10px] font-bold",
						style: {
							background: "var(--gradient-primary)",
							color: "white"
						},
						children: initials$1(user.username)
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/profile",
				search: { userId: user.id },
				onClick: onClose,
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold leading-tight truncate",
						children: user.display_name || user.username
					}), user.is_mutual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
						style: {
							background: "oklch(0.76 0.19 152 / 0.2)",
							color: "oklch(0.76 0.19 152)",
							border: "1px solid oklch(0.76 0.19 152 / 0.3)"
						},
						children: "Mutual"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: ["@", user.username]
				})]
			}),
			user.id !== meId && rightSlot
		]
	});
}
function ListLoader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" })
	});
}
function ListEmpty({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col items-center py-12 text-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: label
		})
	});
}
function initials(name) {
	return name.slice(0, 2).toUpperCase();
}
function timeAgo(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d}d`;
	return new Date(iso).toLocaleDateString();
}
function ProfilePage() {
	const { user } = useAuth();
	const { userId } = Route.useSearch();
	const qc = useQueryClient();
	const targetId = userId ?? user?.id ?? "";
	const isOwnProfile = !userId || userId === user?.id;
	const [uploadPostOpen, setUploadPostOpen] = (0, import_react.useState)(false);
	const [lightboxPost, setLightboxPost] = (0, import_react.useState)(null);
	const [lightboxReel, setLightboxReel] = (0, import_react.useState)(null);
	const [followListOpen, setFollowListOpen] = (0, import_react.useState)(false);
	const [followListTab, setFollowListTab] = (0, import_react.useState)("followers");
	const relQ = useFollowRelationship(targetId, user?.id ?? "");
	const profileQ = useQuery({
		queryKey: ["profile", targetId],
		enabled: !!targetId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("profiles").select("*").eq("id", targetId).maybeSingle();
				if (error) return null;
				return data;
			} catch {
				return null;
			}
		}
	});
	const postsQ = useQuery({
		queryKey: ["posts", targetId],
		enabled: !!targetId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("posts").select("*").eq("user_id", targetId).order("created_at", { ascending: false });
				if (error) return [];
				return data;
			} catch {
				return [];
			}
		}
	});
	const postLikesQ = useQuery({
		queryKey: ["post-likes"],
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("post_likes").select("*");
				if (error) return [];
				return data;
			} catch {
				return [];
			}
		}
	});
	const reelsQ = useQuery({
		queryKey: ["reels-profile", targetId],
		enabled: !!targetId,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("reels").select("*").eq("user_id", targetId).order("created_at", { ascending: false });
				if (error) return [];
				return data;
			} catch {
				return [];
			}
		}
	});
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel("rt-profile-" + targetId).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "posts"
		}, () => qc.invalidateQueries({ queryKey: ["posts", targetId] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "post_likes"
		}, () => qc.invalidateQueries({ queryKey: ["post-likes"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "follows"
		}, () => {
			qc.invalidateQueries({ queryKey: ["follow-counts", targetId] });
			qc.invalidateQueries({ queryKey: [
				"follow-rel",
				user?.id,
				targetId
			] });
			if (isOwnProfile) qc.invalidateQueries({ queryKey: ["follow-requests"] });
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [
		targetId,
		qc,
		user?.id,
		isOwnProfile
	]);
	async function togglePostLike(postId) {
		if (!user) return;
		if ((postLikesQ.data ?? []).some((l) => l.post_id === postId && l.user_id === user.id)) await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
		else await supabase.from("post_likes").insert({
			post_id: postId,
			user_id: user.id
		});
		qc.invalidateQueries({ queryKey: ["post-likes"] });
	}
	async function deletePost(postId) {
		if (!confirm("Delete this post?")) return;
		const { error } = await supabase.from("posts").delete().eq("id", postId);
		if (error) toast.error(error.message);
		else {
			toast.success("Post deleted");
			qc.invalidateQueries({ queryKey: ["posts", targetId] });
		}
	}
	if (!user) return null;
	const profile = profileQ.data;
	const posts = postsQ.data ?? [];
	const reels = reelsQ.data ?? [];
	const likes = postLikesQ.data ?? [];
	const isFollowing = relQ.data?.i_follow === "accepted";
	const isBlocked = relQ.data?.is_blocked;
	const isPrivate = profile?.is_private && !isOwnProfile && !isFollowing;
	function openFollowList(tab) {
		setFollowListTab(tab);
		setFollowListOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b safe-top",
				style: {
					background: "oklch(0.13 0.015 268 / 0.95)",
					borderColor: "oklch(0.20 0.016 268)",
					backdropFilter: "blur(16px)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/feed",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-sm flex items-center gap-1.5",
						children: [
							profile ? `@${profile.username}` : "Profile",
							profile?.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, { size: 13 }),
							profile?.is_private && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5 text-muted-foreground" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/feed",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
									title: "Feed",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-[17px] w-[17px]" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/chat",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
									title: "Chat",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-[17px] w-[17px]" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/reels",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
									title: "Reels",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "h-[17px] w-[17px]" })
								})
							}),
							!isOwnProfile && profile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtherUserMenu, {
								targetId,
								meId: user.id,
								username: profile.username
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-2xl mx-auto px-3 sm:px-4 pb-bottom-nav md:pb-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-8 pb-6",
						children: profileQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileHeaderSkeleton, {}) : profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileHeader, {
							profile,
							isOwnProfile,
							postCount: posts.length,
							reelCount: reels.length,
							meId: user.id,
							onOpenFollowers: () => openFollowList("followers"),
							onOpenFollowing: () => openFollowList("following"),
							onOpenRequests: () => openFollowList("requests")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-muted-foreground py-12",
							children: "User not found."
						})
					}),
					isOwnProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setUploadPostOpen(true),
							className: "w-full flex items-center justify-center gap-2.5 h-11 rounded-2xl border-2 border-dashed text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all",
							style: { borderColor: "oklch(0.28 0.018 268)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-4 w-4" }), "Upload a post"]
						})
					}),
					isPrivate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateAccountGate, { username: profile?.username ?? "" }) : isBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockedGate, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "posts",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "w-full rounded-2xl mb-6 h-11",
								style: { background: "oklch(0.16 0.016 268)" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "posts",
									className: "flex-1 gap-2 rounded-xl data-[state=active]:text-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "h-4 w-4" }),
										" Posts (",
										posts.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "reels",
									className: "flex-1 gap-2 rounded-xl data-[state=active]:text-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }),
										" Reels (",
										reels.length,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "posts",
								children: postsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridSkeleton, {}) : posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-8 w-8" }),
									title: "No posts yet",
									sub: isOwnProfile ? "Upload your first post above." : "This user hasn't posted yet."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 min-[360px]:grid-cols-3 gap-1",
									children: posts.map((post) => {
										const likeCount = likes.filter((l) => l.post_id === post.id).length;
										const liked = likes.some((l) => l.post_id === post.id && l.user_id === user.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative aspect-square rounded-xl overflow-hidden cursor-pointer group",
											style: { background: "oklch(0.16 0.016 268)" },
											onClick: () => setLightboxPost(post),
											children: [post.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: post.image_url,
												alt: "",
												className: "w-full h-full object-cover"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-full h-full flex items-center justify-center p-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-white/60 text-center line-clamp-4",
													children: post.caption
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-1 text-white text-sm font-semibold",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "") }),
														" ",
														likeCount
													]
												})
											})]
										}, post.id);
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "reels",
								children: reelsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridSkeleton, {}) : reels.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8" }),
									title: "No reels yet",
									sub: isOwnProfile ? "Upload a reel from the Reels page." : "This user hasn't uploaded reels yet."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 min-[360px]:grid-cols-3 gap-1",
									children: reels.map((reel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group",
										style: { background: "oklch(0.16 0.016 268)" },
										onClick: () => setLightboxReel(reel),
										children: [
											reel.thumbnail_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: reel.thumbnail_url,
												alt: "",
												className: "w-full h-full object-cover"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
												src: reel.video_url,
												className: "w-full h-full object-cover",
												muted: true,
												playsInline: true
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-0 bg-black/30 flex items-end p-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5 text-white fill-white drop-shadow" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8 text-white fill-white" })
											})
										]
									}, reel.id))
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadPostDialog, {
				open: uploadPostOpen,
				onOpenChange: setUploadPostOpen,
				userId: user.id,
				onUploaded: () => qc.invalidateQueries({ queryKey: ["posts", targetId] })
			}),
			lightboxPost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostLightbox, {
				post: lightboxPost,
				likes: likes.filter((l) => l.post_id === lightboxPost.id),
				meId: user.id,
				isOwner: lightboxPost.user_id === user.id,
				onClose: () => setLightboxPost(null),
				onLike: () => togglePostLike(lightboxPost.id),
				onDelete: () => {
					deletePost(lightboxPost.id);
					setLightboxPost(null);
				}
			}),
			lightboxReel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelLightbox, {
				reel: lightboxReel,
				onClose: () => setLightboxReel(null)
			}),
			followListOpen && profile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowListModal, {
				userId: targetId,
				meId: user.id,
				isOwnProfile,
				initialTab: followListTab,
				onClose: () => setFollowListOpen(false),
				requestCount: isOwnProfile ? void 0 : 0
			})
		]
	});
}
function OtherUserMenu({ targetId, meId, username }) {
	const { follow, unfollow } = useFollowActions(meId);
	async function handleBlock() {
		if (!confirm(`Block @${username}? They won't be able to follow you or see your profile.`)) return;
		const { error } = await supabase.rpc("block_user", { _target: targetId });
		if (error) toast.error(error.message);
		else toast.success(`@${username} blocked`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-[17px] w-[17px]" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "rounded-xl w-44",
		style: {
			background: "oklch(0.16 0.016 268)",
			border: "1px solid oklch(0.24 0.018 268)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleBlock,
				className: "text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }),
					" Block @",
					username
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { style: { background: "oklch(0.22 0.016 268)" } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				className: "text-muted-foreground focus:text-foreground cursor-pointer rounded-lg gap-2",
				onClick: () => toast.info("Report submitted. Thank you."),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-4 w-4" }), " Report"]
			})
		]
	})] });
}
function ProfileHeader({ profile, isOwnProfile, postCount, reelCount, meId, onOpenFollowers, onOpenFollowing, onOpenRequests }) {
	const qc = useQueryClient();
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const countsQ = useFollowCounts(profile.id);
	const requestsQ = useFollowRequests();
	const pendingCount = isOwnProfile ? requestsQ.data?.length ?? 0 : 0;
	const counts = countsQ.data ?? {
		followers: 0,
		following: 0
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-4 sm:gap-5 mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
					className: "h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-white/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: profile.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "text-xl font-bold",
						style: {
							background: "var(--gradient-primary)",
							color: "white"
						},
						children: initials(profile.username)
					})]
				}), isOwnProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setEditOpen(true),
					className: "absolute -bottom-1 -right-1 h-7 w-7 rounded-full grid place-items-center text-white transition-all hover:scale-110",
					style: {
						background: "var(--gradient-primary)",
						boxShadow: "0 2px 8px oklch(0.65 0.22 280 / 0.5)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-3.5 w-3.5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 sm:gap-4 pt-2 flex-wrap min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBtn, {
						label: "Posts",
						value: postCount,
						onClick: () => {}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBtn, {
						label: "Followers",
						value: counts.followers,
						onClick: onOpenFollowers,
						badge: pendingCount > 0 ? pendingCount : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatBtn, {
						label: "Following",
						value: counts.following,
						onClick: onOpenFollowing
					}),
					isOwnProfile && pendingCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onOpenRequests,
						className: "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all hover:opacity-90",
						style: {
							background: "oklch(0.62 0.22 25 / 0.2)",
							color: "oklch(0.72 0.20 25)",
							border: "1px solid oklch(0.62 0.22 25 / 0.4)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3 w-3" }),
							pendingCount,
							" request",
							pendingCount !== 1 ? "s" : ""
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold text-base leading-tight",
							children: profile.display_name || profile.username
						}),
						profile.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, { size: 16 }),
						profile.is_private && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full text-muted-foreground",
							style: {
								background: "oklch(0.20 0.016 268)",
								border: "1px solid oklch(0.28 0.018 268)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-2.5 w-2.5" }), " Private"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-muted-foreground",
					children: ["@", profile.username]
				}),
				profile.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed whitespace-pre-wrap",
					children: profile.bio
				})
			]
		}),
		isOwnProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setEditOpen(true),
				className: "flex-1 h-9 rounded-xl text-sm font-medium border transition-all hover:bg-white/5",
				style: {
					borderColor: "oklch(0.30 0.018 268)",
					color: "oklch(0.80 0.010 268)"
				},
				children: "Edit profile"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/settings",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "h-9 px-3 rounded-xl",
					style: { borderColor: "oklch(0.30 0.018 268)" },
					title: "Settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 24 24",
						className: "h-4 w-4 fill-none stroke-current stroke-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" })]
					})
				})
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowButton, {
				targetId: profile.id,
				meId,
				className: "flex-1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/chat",
				search: { userId: profile.id },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "h-9 px-4 rounded-xl text-sm font-medium",
					style: { borderColor: "oklch(0.30 0.018 268)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" })
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProfileDialog, {
			open: editOpen,
			onOpenChange: setEditOpen,
			profile,
			meId,
			onSaved: () => qc.invalidateQueries({ queryKey: ["profile", profile.id] })
		})
	] });
}
function StatBtn({ label, value, onClick, badge }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "text-center relative group hover:opacity-80 transition-opacity",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-lg font-bold",
				children: value.toLocaleString()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			badge != null && badge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -top-1 -right-2 h-4 min-w-4 px-0.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center",
				style: { background: "oklch(0.62 0.22 25)" },
				children: badge
			})
		]
	});
}
function PrivateAccountGate({ username }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 py-16 text-center px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-14 w-14 rounded-2xl grid place-items-center",
				style: {
					background: "oklch(0.18 0.016 268)",
					border: "1px solid oklch(0.28 0.018 268)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-7 w-7 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold text-sm",
				children: "This account is private"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground max-w-[220px]",
				children: [
					"Follow @",
					username,
					" to see their photos and videos."
				]
			})
		]
	});
}
function BlockedGate() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 py-16 text-center px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-14 w-14 rounded-2xl grid place-items-center",
			style: {
				background: "oklch(0.18 0.016 268)",
				border: "1px solid oklch(0.28 0.018 268)"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-7 w-7 text-muted-foreground" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold text-sm",
			children: "Content not available"
		})]
	});
}
function EditProfileDialog({ open, onOpenChange, profile, meId, onSaved }) {
	const [displayName, setDisplayName] = (0, import_react.useState)(profile.display_name ?? "");
	const [bio, setBio] = (0, import_react.useState)(profile.bio ?? "");
	const [isPrivate, setIsPrivate] = (0, import_react.useState)(profile.is_private ?? false);
	const [avatarFile, setAvatarFile] = (0, import_react.useState)(null);
	const [avatarPreview, setAvatarPreview] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const avatarInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (open) {
			setDisplayName(profile.display_name ?? "");
			setBio(profile.bio ?? "");
			setIsPrivate(profile.is_private ?? false);
			setAvatarFile(null);
			setAvatarPreview(null);
		}
	}, [open, profile]);
	function pickAvatar(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > 5 * 1024 * 1024) {
			toast.error("Image must be under 5 MB");
			return;
		}
		setAvatarFile(f);
		setAvatarPreview(URL.createObjectURL(f));
	}
	async function save() {
		setSaving(true);
		try {
			let avatar_url = profile.avatar_url;
			if (avatarFile) {
				const ext = avatarFile.name.split(".").pop() ?? "jpg";
				const path = `${meId}/${Date.now()}.${ext}`;
				const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
				if (upErr) {
					toast.error("Avatar upload failed: " + upErr.message);
					return;
				}
				const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
				avatar_url = urlData.publicUrl;
			}
			const { error } = await supabase.from("profiles").update({
				display_name: displayName.trim() || null,
				bio: bio.trim() || null,
				avatar_url,
				is_private: isPrivate,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", meId);
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Profile updated");
			onSaved();
			onOpenChange(false);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit profile" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative cursor-pointer",
							onClick: () => avatarInputRef.current?.click(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
									className: "h-20 w-20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatarPreview ?? profile.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "text-xl font-bold",
										style: {
											background: "var(--gradient-primary)",
											color: "white"
										},
										children: initials(profile.username)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5 text-white" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: avatarInputRef,
									type: "file",
									accept: "image/*",
									className: "hidden",
									onChange: pickAvatar
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm font-medium",
							children: "Display name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: displayName,
							onChange: (e) => setDisplayName(e.target.value),
							placeholder: profile.username,
							maxLength: 50,
							className: "rounded-xl"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-sm font-medium",
								children: "Bio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: bio,
								onChange: (e) => setBio(e.target.value),
								placeholder: "Tell people about yourself…",
								maxLength: 150,
								rows: 3,
								className: "rounded-xl resize-none"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground text-right",
								children: [bio.length, "/150"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl px-4 py-3",
						style: {
							background: "oklch(0.17 0.016 268)",
							border: "1px solid oklch(0.26 0.018 268)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "private-toggle",
							className: "text-sm font-medium cursor-pointer flex items-center gap-2",
							children: [isPrivate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-amber-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-4 w-4 text-muted-foreground" }), "Private account"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: isPrivate ? "Only approved followers see your content" : "Anyone can follow and see your posts"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "private-toggle",
							checked: isPrivate,
							onCheckedChange: setIsPrivate
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						disabled: saving,
						className: "w-full h-10 rounded-xl font-semibold",
						style: { background: "var(--gradient-primary)" },
						children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save changes"
					})
				]
			})]
		})
	});
}
function UploadPostDialog({ open, onOpenChange, userId, onUploaded }) {
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	function reset() {
		setFile(null);
		setPreview(null);
		setCaption("");
	}
	function pickFile(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > 20 * 1024 * 1024) {
			toast.error("Image must be under 20 MB");
			return;
		}
		setFile(f);
		setPreview(URL.createObjectURL(f));
	}
	function onDrop(e) {
		e.preventDefault();
		const f = e.dataTransfer.files[0];
		if (f && f.type.startsWith("image/")) {
			setFile(f);
			setPreview(URL.createObjectURL(f));
		}
	}
	async function upload() {
		setUploading(true);
		try {
			let image_url = null;
			if (file) {
				const ext = file.name.split(".").pop() ?? "jpg";
				const path = `${userId}/${Date.now()}.${ext}`;
				const { error: upErr } = await supabase.storage.from("posts").upload(path, file, { upsert: false });
				if (upErr) {
					toast.error("Upload failed: " + upErr.message);
					return;
				}
				const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
				image_url = urlData.publicUrl;
			}
			if (!image_url && !caption.trim()) {
				toast.error("Add an image or write a caption.");
				return;
			}
			const { error } = await supabase.from("posts").insert({
				user_id: userId,
				image_url,
				caption: caption.trim() || null
			});
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Post uploaded!");
			onUploaded();
			reset();
			onOpenChange(false);
		} finally {
			setUploading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => {
			if (!uploading) {
				onOpenChange(v);
				if (!v) reset();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
					className: "h-5 w-5",
					style: { color: "oklch(0.75 0.18 280)" }
				}), " New post"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					!preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onDrop,
						onDragOver: (e) => e.preventDefault(),
						onClick: () => inputRef.current?.click(),
						className: "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer py-10 transition-all hover:border-primary/50",
						style: { borderColor: "oklch(0.28 0.018 268)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-12 rounded-2xl grid place-items-center",
								style: {
									background: "oklch(0.65 0.22 280 / 0.12)",
									border: "1px solid oklch(0.65 0.22 280 / 0.25)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Drop image here or click to browse"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1",
									children: "JPEG, PNG, WebP · max 20 MB"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: inputRef,
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: pickFile
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative rounded-2xl overflow-hidden aspect-square",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: preview,
							alt: "",
							className: "w-full h-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: reset,
							className: "absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-white" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: caption,
						onChange: (e) => setCaption(e.target.value),
						placeholder: "Write a caption… (optional)",
						maxLength: 2200,
						rows: 3,
						className: "rounded-xl resize-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: upload,
						disabled: uploading || !file && !caption.trim(),
						className: "w-full h-10 rounded-xl font-semibold",
						style: { background: "var(--gradient-primary)" },
						children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Uploading…"]
						}) : "Share post"
					})
				]
			})]
		})
	});
}
function PostLightbox({ post, likes, meId, isOwner, onClose, onLike, onDelete }) {
	const liked = likes.some((l) => l.user_id === meId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm rounded-3xl overflow-hidden",
			style: { background: "oklch(0.14 0.015 268)" },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "absolute top-3 right-3 z-10 h-8 w-8 rounded-full grid place-items-center bg-black/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-white" })
				}),
				post.image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: post.image_url,
					alt: "",
					className: "w-full object-contain max-h-[60vh]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-3",
					children: [post.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed",
						children: post.caption
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: onLike,
								className: "flex items-center gap-1.5 text-sm font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-5 w-5 transition-all", liked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: liked ? "text-red-400" : "text-muted-foreground",
									children: likes.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: timeAgo(post.created_at)
							}),
							isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: onDelete,
								className: "text-muted-foreground hover:text-destructive transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						]
					})]
				})
			]
		})
	});
}
function ReelLightbox({ reel, onClose }) {
	const vidRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		vidRef.current?.play();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/95",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative rounded-3xl overflow-hidden",
			style: {
				width: "min(100vw, calc(100dvh * 9 / 16))",
				height: "min(100dvh, 600px)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: vidRef,
					src: reel.video_url,
					loop: true,
					muted: true,
					playsInline: true,
					className: "w-full h-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center bg-black/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-white" })
				}),
				reel.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-0 left-0 right-0 px-4 pb-6 pt-16",
					style: { background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-white text-sm",
						children: reel.caption
					})
				})
			]
		})
	});
}
function ProfileHeaderSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-5 animate-pulse",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 w-20 rounded-full bg-white/10 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-3 pt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-32 rounded-lg bg-white/10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-24 rounded-lg bg-white/8" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-full rounded-lg bg-white/8" })
			]
		})]
	});
}
function GridSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-1",
		children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square rounded-xl bg-white/8 animate-pulse" }, i))
	});
}
function EmptyState({ icon, title, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-14 w-14 rounded-2xl grid place-items-center text-muted-foreground",
				style: { background: "oklch(0.18 0.016 268)" },
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold text-sm",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground max-w-[200px]",
				children: sub
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
