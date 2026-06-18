import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, r as useAuth } from "./utils-DsLFkheH.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Settings, E as Search, G as LoaderCircle, I as Music, N as Pause, O as Plus, T as Send, X as House, Y as ImagePlus, Z as Heart, _t as Bell, a as Volume2, at as Ellipsis, dt as ChevronLeft, f as UserCheck, g as Trash2, i as VolumeX, k as Play, l as User, mt as Camera, n as X, p as Upload, pt as Check, s as Users, u as UserPlus, ut as ChevronRight, z as MessageCircle } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, c as Textarea, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-CqBxy85j.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-D2ZxaxMO.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-Br-kiqFc.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as useNotifications, n as useFollowActions, t as VerifiedBadge } from "./VerifiedBadge-DI94ZqAf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feed-BapG6Mur.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_ITEMS = [
	{
		to: "/feed",
		icon: House,
		label: "Feed"
	},
	{
		to: "/people",
		icon: Search,
		label: "Discover"
	},
	{
		to: "/reels",
		icon: Play,
		label: "Reels"
	},
	{
		to: "/profile",
		icon: User,
		label: "Profile",
		isProfile: true
	}
];
function BottomNav({ active, avatarUrl, username, badge = {}, onCreate }) {
	const initials = (username ?? "?").slice(0, 1).toUpperCase();
	const leftItems = NAV_ITEMS.slice(0, 2);
	const rightItems = NAV_ITEMS.slice(2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none",
		style: { paddingBottom: "max(1rem, env(safe-area-inset-bottom))" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "pointer-events-auto flex items-center px-2 py-2 rounded-full gap-0.5",
			style: {
				background: "rgba(18, 18, 18, 0.82)",
				backdropFilter: "blur(28px) saturate(200%) brightness(0.9)",
				WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(0.9)",
				border: "1px solid rgba(255,255,255,0.11)",
				boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.09)",
				marginLeft: "max(0.5rem, env(safe-area-inset-left))",
				marginRight: "max(0.5rem, env(safe-area-inset-right))"
			},
			children: [
				leftItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavPill, {
					item,
					active,
					badge: badge[item.to]
				}, item.to)),
				onCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onCreate,
					className: "relative mx-1 h-12 w-12 rounded-full grid place-items-center transition-all duration-150 active:scale-90",
					style: {
						background: "rgba(255,255,255,0.08)",
						border: "1px solid rgba(255,255,255,0.10)"
					},
					"aria-label": "Create",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "h-[22px] w-[22px] text-white/80",
						strokeWidth: 2.2
					})
				}),
				rightItems.map((item) => {
					if (item.isProfile) {
						const isActive = active === item.to;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							"aria-label": item.label,
							className: "mx-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90", isActive ? "px-3.5" : "w-12"),
								style: isActive ? {
									background: "rgba(255,255,255,0.14)",
									boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.3)",
									border: "1px solid rgba(255,255,255,0.12)"
								} : {},
								children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: avatarUrl,
									alt: "",
									className: cn("rounded-full object-cover transition-all", isActive ? "h-8 w-8 ring-2 ring-white/80" : "h-7 w-7 opacity-70")
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("rounded-full grid place-items-center text-white font-bold transition-all", isActive ? "h-8 w-8 text-sm ring-2 ring-white/80" : "h-7 w-7 text-xs opacity-70"),
									style: { background: "var(--gradient-primary)" },
									children: initials
								})
							})
						}, item.to);
					}
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavPill, {
						item,
						active,
						badge: badge[item.to]
					}, item.to);
				})
			]
		})
	});
}
function NavPill({ item, active: activePath, badge }) {
	const isActive = activePath === item.to;
	const Icon = item.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: item.to,
		"aria-label": item.label,
		className: "mx-0.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("relative h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90", isActive ? "px-4" : "w-12"),
			style: isActive ? {
				background: "rgba(255,255,255,0.14)",
				boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.3)",
				border: "1px solid rgba(255,255,255,0.12)"
			} : {},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: cn("transition-all duration-200", isActive ? "h-[22px] w-[22px] text-white" : "h-[22px] w-[22px] text-white/45"),
				strokeWidth: isActive ? 2.4 : 1.8
			}), badge != null && badge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full",
				style: { background: "#ed4956" }
			})]
		})
	});
}
function timeAgo$1(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d}d`;
	return new Date(iso).toLocaleDateString();
}
function initials$1(name) {
	return name?.slice(0, 2).toUpperCase() ?? "?";
}
var NOTIF_ICONS = {
	new_follower: UserPlus,
	follow_request: UserPlus,
	follow_accept: UserCheck,
	post_like: Heart,
	post_comment: MessageCircle,
	reel_like: Heart
};
var NOTIF_LABELS = {
	new_follower: "started following you",
	follow_request: "requested to follow you",
	follow_accept: "accepted your follow request",
	post_like: "liked your post",
	post_comment: "commented on your post",
	reel_like: "liked your reel"
};
function NotificationBell({ meId }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [panelPos, setPanelPos] = (0, import_react.useState)(null);
	const buttonRef = (0, import_react.useRef)(null);
	const panelRef = (0, import_react.useRef)(null);
	const qc = useQueryClient();
	const { data: notifications = [], isLoading } = useNotifications(meId);
	const { acceptRequest, declineRequest } = useFollowActions(meId);
	const unreadCount = notifications.filter((n) => !n.read).length;
	(0, import_react.useEffect)(() => {
		if (open && unreadCount > 0) supabase.rpc("mark_notifications_read").then(() => {
			qc.invalidateQueries({ queryKey: ["notifications", meId] });
		});
	}, [
		open,
		unreadCount,
		meId,
		qc
	]);
	const channelRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const existing = channelRef.current;
		if (existing) {
			channelRef.current = null;
			supabase.removeChannel(existing).catch(() => {});
		}
		let active = true;
		try {
			const ch = supabase.channel(`rt-notifs-${meId}`);
			channelRef.current = ch;
			ch.on("postgres_changes", {
				event: "INSERT",
				schema: "public",
				table: "notifications",
				filter: `user_id=eq.${meId}`
			}, () => {
				if (active) qc.invalidateQueries({ queryKey: ["notifications", meId] });
			}).subscribe((status) => {
				if (status === "CHANNEL_ERROR") console.warn("[NotificationBell] Realtime unavailable");
			});
		} catch (err) {
			console.warn("[NotificationBell] Could not subscribe:", err);
		}
		return () => {
			active = false;
			const toRemove = channelRef.current;
			channelRef.current = null;
			if (toRemove) supabase.removeChannel(toRemove).catch(() => {});
		};
	}, [meId, qc]);
	function toggleOpen() {
		if (open) {
			setOpen(false);
			return;
		}
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const panelWidth = 320;
			const panelMaxHeight = 440;
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const gap = 8;
			let left = rect.left;
			if (left + panelWidth > viewportWidth - gap) left = viewportWidth - panelWidth - gap;
			if (left < gap) left = gap;
			const spaceBelow = viewportHeight - rect.bottom - gap;
			const spaceAbove = rect.top - gap;
			const openUpward = spaceBelow < Math.min(panelMaxHeight, 200) && spaceAbove > spaceBelow;
			setPanelPos({
				top: openUpward ? Math.max(gap, rect.top - Math.min(panelMaxHeight, spaceAbove) - gap) : rect.bottom + gap,
				left,
				maxHeight: openUpward ? Math.min(panelMaxHeight, spaceAbove) : Math.min(panelMaxHeight, spaceBelow)
			});
		}
		setOpen(true);
	}
	(0, import_react.useEffect)(() => {
		if (!open) return;
		function handle(e) {
			const target = e.target;
			const clickedButton = buttonRef.current?.contains(target);
			const clickedPanel = panelRef.current?.contains(target);
			if (!clickedButton && !clickedPanel) setOpen(false);
		}
		document.addEventListener("mousedown", handle);
		return () => document.removeEventListener("mousedown", handle);
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const close = () => setOpen(false);
		window.addEventListener("scroll", close, { passive: true });
		window.addEventListener("resize", close);
		return () => {
			window.removeEventListener("scroll", close);
			window.removeEventListener("resize", close);
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		ref: buttonRef,
		onClick: toggleOpen,
		className: cn("relative grid h-9 w-9 place-items-center rounded-xl transition-all", open ? "text-foreground bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"),
		"aria-label": "Notifications",
		"aria-expanded": open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-[17px] w-[17px]" }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center",
			style: { background: "var(--gradient-primary)" },
			children: unreadCount > 9 ? "9+" : unreadCount
		})]
	}), open && panelPos && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: panelRef,
		className: "fixed z-[9999] w-80 rounded-2xl shadow-2xl overflow-hidden",
		style: {
			top: panelPos.top,
			left: panelPos.left,
			background: "oklch(0.15 0.015 268 / 0.98)",
			border: "1px solid oklch(0.26 0.018 268)",
			backdropFilter: "blur(20px)",
			WebkitBackdropFilter: "blur(20px)",
			maxHeight: panelPos.maxHeight,
			display: "flex",
			flexDirection: "column"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-4 py-3 border-b shrink-0",
			style: { borderColor: "oklch(0.22 0.016 268)" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold text-sm text-foreground",
				children: "Notifications"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setOpen(false),
				className: "h-6 w-6 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all",
				"aria-label": "Close notifications",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-y-auto flex-1",
			children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" })
				}),
				!isLoading && notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center py-10 text-center px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 text-muted-foreground/40 mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No notifications yet"
					})]
				}),
				notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotifRow, {
					notif: n,
					onAccept: n.type === "follow_request" ? () => {
						acceptRequest.mutate(n.actor_id);
					} : void 0,
					onDecline: n.type === "follow_request" ? () => {
						declineRequest.mutate(n.actor_id);
					} : void 0
				}, n.id))
			]
		})]
	})] });
}
function NotifRow({ notif, onAccept, onDecline }) {
	const Icon = NOTIF_ICONS[notif.type] ?? Bell;
	const label = NOTIF_LABELS[notif.type] ?? notif.type;
	const actor = notif.actor;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-start gap-3 px-4 py-3 border-b transition-colors", !notif.read && "bg-primary/5"),
		style: { borderColor: "oklch(0.20 0.016 268)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
					className: "h-9 w-9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: actor?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "text-[10px] font-bold",
						style: {
							background: "var(--gradient-primary)",
							color: "white"
						},
						children: initials$1(actor?.username ?? "?")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full grid place-items-center",
					style: {
						background: "oklch(0.20 0.018 268)",
						border: "1px solid oklch(0.28 0.018 268)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-2.5 w-2.5 text-primary" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-relaxed text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold",
								children: ["@", actor?.username ?? "user"]
							}),
							" ",
							label
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground mt-0.5",
						children: timeAgo$1(notif.created_at)
					}),
					notif.type === "follow_request" && onAccept && onDecline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onAccept,
							className: "flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90",
							style: { background: "var(--gradient-primary)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), " Accept"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onDecline,
							className: "flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-semibold text-muted-foreground border border-white/10 hover:bg-white/5 transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" }), " Decline"]
						})]
					})
				]
			}),
			!notif.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2 w-2 rounded-full mt-1.5 shrink-0",
				style: { background: "oklch(0.65 0.22 280)" }
			})
		]
	});
}
function initials(name) {
	return name.slice(0, 2).toUpperCase();
}
function timeAgo(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d}d ago`;
	return new Date(iso).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function FeedPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const postsQ = useQuery({
		queryKey: ["feed-posts"],
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(60);
				if (error) return [];
				return data;
			} catch {
				return [];
			}
		}
	});
	const ownerIds = [...new Set((postsQ.data ?? []).map((p) => p.user_id))];
	const profilesQ = useQuery({
		queryKey: ["feed-profiles", ownerIds],
		enabled: ownerIds.length > 0,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("profiles").select("*").in("id", ownerIds);
				if (error) return {};
				const map = {};
				data.forEach((p) => {
					map[p.id] = p;
				});
				return map;
			} catch {
				return {};
			}
		}
	});
	const likesQ = useQuery({
		queryKey: ["feed-likes"],
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
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel("rt-feed").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "posts"
		}, () => {
			qc.invalidateQueries({ queryKey: ["feed-posts"] });
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "post_likes"
		}, () => {
			qc.invalidateQueries({ queryKey: ["feed-likes"] });
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "post_comments"
		}, () => {
			qc.invalidateQueries({ queryKey: ["post-comments"] });
			qc.invalidateQueries({ queryKey: ["post-comment-count"] });
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "stories"
		}, () => {
			qc.invalidateQueries({ queryKey: ["stories"] });
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [qc]);
	if (!user) return null;
	const posts = postsQ.data ?? [];
	const profiles = profilesQ.data ?? {};
	const likes = likesQ.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-[100dvh] w-full flex bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden md:flex w-[60px] xl:w-[220px] shrink-0 flex-col py-4 gap-1 border-r sticky top-0 h-[100dvh] safe-top",
				style: {
					background: "var(--color-sidebar)",
					borderColor: "oklch(0.18 0.016 268)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 px-3 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-9 w-9 shrink-0 place-items-center rounded-2xl shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]",
							style: { background: "var(--gradient-primary)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden xl:block font-bold text-sm tracking-tight",
							children: "chatfaa"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						to: "/feed",
						icon: House,
						label: "Feed",
						active: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						to: "/chat",
						icon: MessageCircle,
						label: "Chat"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						to: "/reels",
						icon: Play,
						label: "Reels"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						to: "/people",
						icon: Users,
						label: "People"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						to: "/profile",
						icon: AvatarIcon,
						label: "Profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						to: "/settings",
						icon: Settings,
						label: "Settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto px-2 pb-2 space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, { meId: user.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden xl:block text-xs text-muted-foreground",
								children: "Notifications"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setUploadOpen(true),
							className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
							"aria-label": "New post",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 shrink-0 rounded-xl grid place-items-center border-2 border-dashed",
								style: { borderColor: "oklch(0.35 0.018 268)" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden xl:block",
								children: "New post"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 min-w-0 flex flex-col items-center overflow-x-hidden",
				style: { paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "md:hidden sticky top-0 z-30 w-full flex items-center justify-between px-3 h-14 border-b safe-top",
						style: {
							background: "oklch(0.11 0.015 270 / 0.95)",
							borderColor: "oklch(0.20 0.016 268)",
							backdropFilter: "blur(16px)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-base tracking-tight",
							children: "chatfaa"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/people",
									className: "h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, { meId: user.id }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/settings",
									className: "h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
									title: "Settings",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setUploadOpen(true),
									className: "h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" })
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoriesRow, {
						meId: user.id,
						meProfile: profiles[user.id] ?? null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full max-w-[470px] px-4 mb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-px",
							style: { background: "oklch(0.22 0.016 268)" }
						})
					}),
					postsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full max-w-[470px] px-4 space-y-6 mt-4",
						children: [...Array(3)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {}, i))
					}) : posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedEmpty, { onUpload: () => setUploadOpen(true) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-[470px] space-y-0",
						children: [posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
							post,
							profile: profiles[post.user_id],
							likes: likes.filter((l) => l.post_id === post.id),
							meId: user.id
						}, post.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-10 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "You've seen all posts ✨"
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {
				active: "/feed",
				avatarUrl: profiles[user.id]?.avatar_url ?? null,
				username: profiles[user.id]?.username,
				onCreate: () => setUploadOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadPostDialog, {
				open: uploadOpen,
				onOpenChange: setUploadOpen,
				userId: user.id
			})
		]
	});
}
function StoriesRow({ meId, meProfile }) {
	const qc = useQueryClient();
	const [addStoryOpen, setAddStoryOpen] = (0, import_react.useState)(false);
	const [viewingGroup, setViewingGroup] = (0, import_react.useState)(null);
	const [viewingIndex, setViewingIndex] = (0, import_react.useState)(0);
	const storiesQ = useQuery({
		queryKey: ["stories"],
		queryFn: async () => {
			const { data, error } = await supabase.from("stories").select("*").order("created_at", { ascending: false });
			if (error) return [];
			return data ?? [];
		}
	});
	const ownerIds = [...new Set((storiesQ.data ?? []).map((s) => s.user_id))];
	const profilesQ = useQuery({
		queryKey: ["story-profiles", ownerIds],
		enabled: ownerIds.length > 0,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("*").in("id", ownerIds);
			const map = {};
			(data ?? []).forEach((p) => {
				map[p.id] = p;
			});
			return map;
		}
	});
	const seenIds = useQuery({
		queryKey: ["story-views", meId],
		queryFn: async () => {
			const { data } = await supabase.from("story_views").select("story_id").eq("viewer_id", meId);
			return new Set((data ?? []).map((v) => v.story_id));
		}
	}).data ?? /* @__PURE__ */ new Set();
	const profiles = profilesQ.data ?? {};
	const stories = storiesQ.data ?? [];
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		stories.forEach((s) => {
			if (!map.has(s.user_id)) map.set(s.user_id, []);
			map.get(s.user_id).push(s);
		});
		map.forEach((arr) => arr.sort((a, b) => a.created_at.localeCompare(b.created_at)));
		const result = [];
		if (map.has(meId)) {
			const myStories = map.get(meId);
			const hasUnseen = myStories.some((s) => !seenIds.has(s.id));
			result.push({
				userId: meId,
				profile: profiles[meId] ?? meProfile,
				stories: myStories,
				hasUnseen
			});
		}
		map.forEach((storyArr, uid) => {
			if (uid === meId) return;
			const p = profiles[uid];
			if (!p) return;
			const hasUnseen = storyArr.some((s) => !seenIds.has(s.id));
			result.push({
				userId: uid,
				profile: p,
				stories: storyArr,
				hasUnseen
			});
		});
		return result;
	}, [
		stories,
		profiles,
		seenIds,
		meId,
		meProfile
	]);
	function openGroup(group) {
		const firstUnseen = group.stories.findIndex((s) => !seenIds.has(s.id));
		setViewingIndex(firstUnseen >= 0 ? firstUnseen : 0);
		setViewingGroup(group);
	}
	const myGroup = groups.find((g) => g.userId === meId);
	const hasMyStory = (myGroup?.stories.length ?? 0) > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-[470px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 overflow-x-auto px-3 pt-4 pb-3 scrollbar-none stories-scroll",
				style: { scrollbarWidth: "none" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-1.5 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => hasMyStory && myGroup ? openGroup(myGroup) : setAddStoryOpen(true),
								className: cn("h-[62px] w-[62px] rounded-full transition-all", hasMyStory ? "ring-[2.5px] ring-offset-2 ring-offset-background ring-primary" : "ring-[2px] ring-offset-2 ring-offset-background ring-border"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
									className: "h-full w-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: meProfile?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "text-sm font-bold",
										style: {
											background: "var(--gradient-primary)",
											color: "white"
										},
										children: initials(meProfile?.username ?? "?")
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setAddStoryOpen(true),
								className: "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full grid place-items-center text-white shadow-md transition-all",
								style: { background: "var(--gradient-primary)" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground truncate w-[62px] text-center",
							children: hasMyStory ? "Your story" : "Add story"
						})]
					}),
					groups.filter((g) => g.userId !== meId).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => openGroup(group),
						className: "flex flex-col items-center gap-1.5 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-[62px] w-[62px] rounded-full p-[2.5px] transition-all", group.hasUnseen ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "bg-border"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full w-full rounded-full ring-2 ring-background overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
									className: "h-full w-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: group.profile?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "text-sm font-bold",
										style: {
											background: "var(--gradient-primary)",
											color: "white"
										},
										children: initials(group.profile?.username ?? "?")
									})]
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground truncate w-[62px] text-center",
							children: group.profile?.display_name || group.profile?.username
						})]
					}, group.userId)),
					groups.filter((g) => g.userId !== meId).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col items-center justify-center gap-1.5 shrink-0 px-4 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground/60",
							children: "Follow people to see their stories"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddStoryDialog, {
			open: addStoryOpen,
			onOpenChange: setAddStoryOpen,
			userId: meId,
			onUploaded: () => qc.invalidateQueries({ queryKey: ["stories"] })
		}),
		viewingGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryViewer, {
			group: viewingGroup,
			initialIndex: viewingIndex,
			meId,
			allGroups: groups,
			onClose: () => setViewingGroup(null),
			onNavigateGroup: (g) => {
				setViewingGroup(g);
				setViewingIndex(0);
			},
			onMarkSeen: (_storyId) => {
				qc.invalidateQueries({ queryKey: ["story-views", meId] });
			}
		})
	] });
}
function StoryViewer({ group, initialIndex, meId, allGroups, onClose, onNavigateGroup, onMarkSeen }) {
	const [idx, setIdx] = (0, import_react.useState)(initialIndex);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const intervalRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const story = group.stories[idx];
	const TICK = 50;
	(0, import_react.useEffect)(() => {
		if (!story) return;
		supabase.from("story_views").insert({
			story_id: story.id,
			viewer_id: meId
		}).then(() => onMarkSeen(story.id));
	}, [story?.id]);
	(0, import_react.useEffect)(() => {
		if (!story) return;
		setProgress(0);
		if (intervalRef.current) clearInterval(intervalRef.current);
		if (paused) return;
		const step = TICK / ((story.duration_sec ?? 5) * 1e3) * 100;
		intervalRef.current = setInterval(() => {
			setProgress((prev) => {
				if (prev + step >= 100) {
					clearInterval(intervalRef.current);
					goNext();
					return 100;
				}
				return prev + step;
			});
		}, TICK);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [
		idx,
		paused,
		story?.id
	]);
	function goNext() {
		if (idx < group.stories.length - 1) setIdx(idx + 1);
		else {
			const gIdx = allGroups.findIndex((g) => g.userId === group.userId);
			if (gIdx >= 0 && gIdx < allGroups.length - 1) onNavigateGroup(allGroups[gIdx + 1]);
			else onClose();
		}
	}
	function goPrev() {
		if (idx > 0) setIdx(idx - 1);
		else {
			const gIdx = allGroups.findIndex((g) => g.userId === group.userId);
			if (gIdx > 0) {
				const prevGroup = allGroups[gIdx - 1];
				onNavigateGroup(prevGroup);
			}
		}
	}
	async function deleteStory() {
		if (!story) return;
		await supabase.from("stories").delete().eq("id", story.id);
		toast.success("Story deleted");
		goNext();
	}
	if (!story) {
		onClose();
		return null;
	}
	const isVideo = story.media_type === "video";
	const isMyStory = group.userId === meId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] bg-black flex items-center justify-center",
		onClick: (e) => e.stopPropagation(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-full w-full flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "story-viewer-box relative overflow-hidden bg-black",
				style: {
					aspectRatio: "9/16",
					height: "100%",
					maxHeight: "100dvh",
					width: "auto",
					maxWidth: "100vw"
				},
				children: [
					isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						src: story.media_url,
						className: "absolute inset-0 w-full h-full object-cover",
						autoPlay: true,
						muted,
						loop: false,
						playsInline: true,
						onEnded: goNext
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: story.media_url,
						alt: "",
						className: "absolute inset-0 w-full h-full object-cover",
						draggable: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 top-0 h-32 pointer-events-none",
						style: { background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 h-32 pointer-events-none",
						style: { background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-0 inset-x-0 flex gap-1 px-2 pt-2 z-10",
						children: group.stories.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 h-[2.5px] rounded-full overflow-hidden bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-white rounded-full transition-none",
								style: { width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%" }
							})
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-5 inset-x-0 px-3 z-10 flex items-center gap-2.5 mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
								className: "h-9 w-9 ring-2 ring-white/50 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: group.profile?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "text-xs font-bold",
									style: {
										background: "var(--gradient-primary)",
										color: "white"
									},
									children: initials(group.profile?.username ?? "?")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white text-sm font-semibold leading-tight drop-shadow",
									children: group.profile?.display_name || group.profile?.username
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white/70 text-[11px]",
									children: timeAgo(story.created_at)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									isVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setMuted((m) => !m);
											if (videoRef.current) videoRef.current.muted = !muted;
										},
										className: "h-8 w-8 rounded-full grid place-items-center bg-black/30 text-white",
										children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-4 w-4" })
									}),
									isMyStory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: deleteStory,
										className: "h-8 w-8 rounded-full grid place-items-center bg-black/30 text-white",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: onClose,
										className: "h-8 w-8 rounded-full grid place-items-center bg-black/30 text-white",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})
								]
							})
						]
					}),
					story.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-8 inset-x-4 z-10 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white text-sm font-medium drop-shadow-lg",
							children: story.caption
						})
					}),
					story.music_preview_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryMusicOverlay, {
						title: story.music_title,
						artist: story.music_artist,
						artworkUrl: story.music_artwork_url ?? null,
						previewUrl: story.music_preview_url,
						startSec: story.music_start_sec ?? 0,
						paused
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex z-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "w-1/3 h-full",
								onPointerDown: () => setPaused(true),
								onPointerUp: () => setPaused(false),
								onPointerLeave: () => setPaused(false),
								onClick: goPrev
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "w-1/3 h-full",
								onPointerDown: () => setPaused(true),
								onPointerUp: () => setPaused(false),
								onPointerLeave: () => setPaused(false),
								onClick: goNext
							})
						]
					})
				]
			})
		})
	});
}
function StoryMusicOverlay({ title, artist, artworkUrl, previewUrl, startSec = 0, paused }) {
	const [muted, setMuted] = (0, import_react.useState)(false);
	const audioRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const audio = new Audio(previewUrl);
		audio.loop = false;
		audio.muted = false;
		audio.volume = .7;
		audio.currentTime = startSec;
		audio.play().catch(() => {});
		audio.ontimeupdate = () => {
			if (audio.currentTime >= startSec + CLIP_DURATION) audio.currentTime = startSec;
		};
		audioRef.current = audio;
		return () => {
			audio.pause();
			audio.src = "";
		};
	}, [previewUrl, startSec]);
	(0, import_react.useEffect)(() => {
		if (!audioRef.current) return;
		if (paused) audioRef.current.pause();
		else audioRef.current.play().catch(() => {});
	}, [paused]);
	function toggleMute(e) {
		e.stopPropagation();
		if (!audioRef.current) return;
		const next = !muted;
		audioRef.current.muted = next;
		setMuted(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute bottom-10 left-3 right-3 z-20 flex items-center gap-2.5 px-3 py-2 rounded-2xl",
		style: {
			background: "rgba(0,0,0,0.48)",
			backdropFilter: "blur(8px)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [artworkUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: artworkUrl,
					alt: "",
					className: cn("h-8 w-8 rounded-full object-cover border-2 border-white/30", !paused && "animate-spin-slow")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-8 w-8 rounded-full border-2 border-white/30 grid place-items-center", !paused && "animate-spin-slow"),
					style: { background: "oklch(0.65 0.22 280 / 0.6)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-3.5 w-3.5 text-white" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 m-auto h-2 w-2 rounded-full bg-black/60 pointer-events-none" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "whitespace-nowrap overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-white text-[11px] font-semibold inline-block animate-marquee",
						children: [
							title,
							" · ",
							artist
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 mt-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-2.5 w-2.5 text-white/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-white/60 text-[10px]",
						children: "Original audio"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: toggleMute,
				className: "h-8 w-8 rounded-full grid place-items-center shrink-0 transition-all active:scale-90",
				style: {
					background: "rgba(0,0,0,0.45)",
					border: "1px solid rgba(255,255,255,0.2)"
				},
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MuteIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnmuteIcon, {})
			})
		]
	});
}
function AddStoryDialog({ open, onOpenChange, userId, onUploaded }) {
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [musicPickerOpen, setMusicPickerOpen] = (0, import_react.useState)(false);
	const [selectedMusic, setSelectedMusic] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	function reset() {
		setFile(null);
		setPreview(null);
		setCaption("");
		setSelectedMusic(null);
		setMusicPickerOpen(false);
	}
	function pickFile(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > 50 * 1024 * 1024) {
			toast.error("File must be under 50 MB");
			return;
		}
		setFile(f);
		setPreview(URL.createObjectURL(f));
	}
	async function upload() {
		if (!file) {
			toast.error("Pick a photo or video first.");
			return;
		}
		setUploading(true);
		try {
			const isVideo = file.type.startsWith("video/");
			const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
			const path = `${userId}/${Date.now()}.${ext}`;
			const { error: upErr } = await supabase.storage.from("stories").upload(path, file, { upsert: false });
			if (upErr) {
				toast.error("Upload failed: " + upErr.message);
				return;
			}
			const { data: urlData } = supabase.storage.from("stories").getPublicUrl(path);
			const { error } = await supabase.from("stories").insert({
				user_id: userId,
				media_url: urlData.publicUrl,
				media_type: isVideo ? "video" : "image",
				caption: caption.trim() || null,
				duration_sec: isVideo ? 15 : 5,
				music_title: selectedMusic?.track.trackName ?? null,
				music_artist: selectedMusic?.track.artistName ?? null,
				music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
				music_preview_url: selectedMusic?.track.previewUrl ?? null,
				music_start_sec: selectedMusic?.startSec ?? 0
			});
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Story posted!");
			onUploaded();
			reset();
			onOpenChange(false);
		} finally {
			setUploading(false);
		}
	}
	const isVideo = file?.type.startsWith("video/") ?? false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: open && !musicPickerOpen,
		onOpenChange: (v) => {
			if (!uploading) {
				onOpenChange(v);
				if (!v) reset();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
					className: "h-5 w-5",
					style: { color: "oklch(0.75 0.18 280)" }
				}), "New story"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					!preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Tap to pick photo or video"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1",
									children: "JPEG, PNG, MP4 · max 50 MB"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: inputRef,
								type: "file",
								accept: "image/*,video/*",
								className: "hidden",
								onChange: pickFile
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative rounded-2xl overflow-hidden bg-black",
						style: { aspectRatio: "9/16" },
						children: [
							isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: preview,
								className: "absolute inset-0 w-full h-full object-cover",
								muted: true,
								autoPlay: true,
								loop: true,
								playsInline: true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: preview,
								alt: "",
								className: "absolute inset-0 w-full h-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: reset,
								className: "absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-all z-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-white" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: inputRef,
								type: "file",
								accept: "image/*,video/*",
								className: "hidden",
								onChange: pickFile
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: caption,
						onChange: (e) => setCaption(e.target.value),
						placeholder: "Add a caption… (optional)",
						maxLength: 200,
						rows: 2,
						className: "rounded-xl resize-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMusicPickerOpen(true),
						className: cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-sm", selectedMusic ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 bg-card"),
						children: selectedMusic ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: selectedMusic.track.artworkUrl100,
								alt: "",
								className: "h-9 w-9 rounded-lg object-cover shrink-0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium truncate text-xs leading-tight",
									children: selectedMusic.track.trackName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground truncate text-[11px]",
									children: [selectedMusic.track.artistName, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2 text-primary/70",
										children: ["· from ", formatSec(selectedMusic.startSec)]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									setSelectedMusic(null);
								},
								className: "shrink-0 h-6 w-6 rounded-full grid place-items-center hover:bg-white/10 transition-all",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 text-muted-foreground" })
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-xl grid place-items-center shrink-0",
								style: {
									background: "oklch(0.65 0.22 280 / 0.12)",
									border: "1px solid oklch(0.65 0.22 280 / 0.20)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-4 w-4 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left text-muted-foreground",
								children: "Add music"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground/50 shrink-0" })
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: upload,
						disabled: uploading || !file,
						className: "w-full h-10 rounded-xl font-semibold",
						style: { background: "var(--gradient-primary)" },
						children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Uploading…"]
						}) : "Share story"
					})
				]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicPickerDialog, {
		open: musicPickerOpen,
		onOpenChange: setMusicPickerOpen,
		onSelect: (music) => {
			setSelectedMusic(music);
			setMusicPickerOpen(false);
		}
	})] });
}
function NavItem({ to, icon: Icon, label, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all", active ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"),
		style: active ? {
			background: "var(--gradient-primary)",
			boxShadow: "0 4px 16px -4px oklch(0.65 0.22 280/0.5)"
		} : {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-[18px] w-[18px] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden xl:block",
			children: label
		})]
	});
}
function AvatarIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className,
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "8",
			r: "4"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M4 20c0-4 3.6-7 8-7s8 3 8 7",
			strokeLinecap: "round"
		})]
	});
}
function snapPostRatio(w, h) {
	const r = w / h;
	if (r >= 1.7) return "1080/566";
	if (r >= .9) return "1/1";
	return "4/5";
}
function PostCard({ post, profile, likes, meId }) {
	const qc = useQueryClient();
	const [commentsOpen, setCommentsOpen] = (0, import_react.useState)(false);
	const [imgLoaded, setImgLoaded] = (0, import_react.useState)(false);
	const [imgRatio, setImgRatio] = (0, import_react.useState)("4/5");
	const lastTapRef = (0, import_react.useRef)(0);
	const [heartBurst, setHeartBurst] = (0, import_react.useState)(null);
	const liked = likes.some((l) => l.user_id === meId);
	const likeCount = likes.length;
	async function toggleLike() {
		if (liked) await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", meId);
		else await supabase.from("post_likes").insert({
			post_id: post.id,
			user_id: meId
		});
		qc.invalidateQueries({ queryKey: ["feed-likes"] });
		qc.invalidateQueries({ queryKey: ["post-likes"] });
	}
	async function deletePost() {
		const { error } = await supabase.from("posts").delete().eq("id", post.id);
		if (error) toast.error(error.message);
		else {
			toast.success("Post deleted");
			qc.invalidateQueries({ queryKey: ["feed-posts"] });
		}
	}
	function handleImageTap(e) {
		const now = Date.now();
		const delta = now - lastTapRef.current;
		if (delta < 300 && delta > 0) {
			if (!liked) supabase.from("post_likes").insert({
				post_id: post.id,
				user_id: meId
			}).then(() => {
				qc.invalidateQueries({ queryKey: ["feed-likes"] });
				qc.invalidateQueries({ queryKey: ["post-likes"] });
			});
			const rect = e.currentTarget.getBoundingClientRect();
			setHeartBurst({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
				id: now
			});
			setTimeout(() => setHeartBurst(null), 900);
		}
		lastTapRef.current = now;
	}
	const name = profile?.display_name || profile?.username || "Unknown";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border-b",
		style: { borderColor: "oklch(0.20 0.016 268)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile",
						search: { userId: post.user_id },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "h-9 w-9 ring-2 ring-transparent hover:ring-primary/40 transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: profile?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "text-xs font-bold",
								style: {
									background: "var(--gradient-primary)",
									color: "white"
								},
								children: initials(profile?.username ?? "?")
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							search: { userId: post.user_id },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-sm font-semibold leading-tight hover:underline cursor-pointer",
								children: [name, profile?.is_verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, {
									size: 13,
									tooltip: false
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted-foreground",
							children: [
								"@",
								profile?.username,
								" · ",
								timeAgo(post.created_at)
							]
						})]
					}),
					post.user_id === meId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-8 w-8 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
						align: "end",
						className: "rounded-xl",
						style: {
							background: "oklch(0.16 0.016 268)",
							border: "1px solid oklch(0.24 0.018 268)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: deletePost,
							className: "text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Delete post"]
						})
					})] })
				]
			}),
			post.image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full cursor-pointer select-none overflow-hidden",
				style: {
					background: "oklch(0.14 0.015 268)",
					aspectRatio: imgRatio
				},
				onClick: handleImageTap,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: post.image_url,
						alt: post.caption ?? "post",
						className: "absolute inset-0 w-full h-full object-cover",
						onLoad: (e) => {
							const img = e.currentTarget;
							setImgRatio(snapPostRatio(img.naturalWidth, img.naturalHeight));
							setImgLoaded(true);
						},
						draggable: false
					}),
					heartBurst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute pointer-events-none z-20",
						style: {
							left: heartBurst.x,
							top: heartBurst.y,
							transform: "translate(-50%,-50%)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							className: "h-20 w-20 animate-heart-burst",
							style: {
								color: "#e6337e",
								fill: "#e6337e"
							}
						})
					}, heartBurst.id),
					post.music_preview_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostMusicOverlay, {
						title: post.music_title,
						artist: post.music_artist,
						artworkUrl: post.music_artwork_url,
						previewUrl: post.music_preview_url,
						startSec: post.music_start_sec ?? 0
					})
				]
			}),
			!post.image_url && post.music_preview_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostMusicOverlay, {
				title: post.music_title,
				artist: post.music_artist,
				artworkUrl: post.music_artwork_url,
				previewUrl: post.music_preview_url,
				startSec: post.music_start_sec ?? 0,
				standalone: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-3 pb-1 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: toggleLike,
						className: "group flex items-center gap-1.5 -ml-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-10 w-10 grid place-items-center rounded-xl transition-all active:scale-90", liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-6 w-6 transition-all", liked && "fill-red-500 scale-110") })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-sm font-medium", liked ? "text-red-400" : "text-muted-foreground"),
							children: likeCount > 0 ? likeCount : ""
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setCommentsOpen(true),
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-6 w-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCommentCount, { postId: post.id })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "flex items-center gap-1.5 ml-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-5 w-5" })
						})
					})
				]
			}),
			likeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm font-semibold",
					children: [
						likeCount.toLocaleString(),
						" ",
						likeCount === 1 ? "like" : "likes"
					]
				})
			}),
			post.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold mr-2",
					children: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: post.caption
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCommentPreview, {
				postId: post.id,
				onViewAll: () => setCommentsOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickComment, {
				postId: post.id,
				meId
			}),
			commentsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsDrawer, {
				post,
				meId,
				onClose: () => setCommentsOpen(false)
			})
		]
	});
}
function PostMusicOverlay({ title, artist, artworkUrl, previewUrl, startSec = 0, standalone }) {
	const [muted, setMuted] = (0, import_react.useState)(true);
	const audioRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const audio = new Audio(previewUrl);
		audio.loop = false;
		audio.muted = true;
		audio.volume = .7;
		audio.currentTime = startSec;
		audio.play().catch(() => {});
		audio.ontimeupdate = () => {
			if (audio.currentTime >= startSec + CLIP_DURATION) audio.currentTime = startSec;
		};
		audioRef.current = audio;
		return () => {
			audio.pause();
			audio.src = "";
		};
	}, [previewUrl, startSec]);
	function toggleMute(e) {
		e.stopPropagation();
		if (!audioRef.current) return;
		const next = !muted;
		audioRef.current.muted = next;
		setMuted(next);
	}
	if (standalone) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-0 flex items-center gap-3 px-4 py-3 overflow-hidden",
		style: { background: "oklch(0.13 0.014 268)" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 flex-1 min-w-0",
			children: [artworkUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: artworkUrl,
				alt: "",
				className: "h-9 w-9 rounded-lg object-cover shrink-0"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 mb-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-3 w-3 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-foreground truncate",
						children: title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground truncate",
					children: artist
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: toggleMute,
			className: "h-8 w-8 rounded-full grid place-items-center shrink-0 transition-all",
			style: { background: "oklch(0.22 0.016 268)" },
			children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MuteIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnmuteIcon, {})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2.5 px-3 py-2.5",
		style: {
			background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.0) 100%)",
			backdropFilter: "blur(0px)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [artworkUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: artworkUrl,
					alt: "",
					className: "h-8 w-8 rounded-full object-cover border-2 border-white/30 animate-spin-slow"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-8 rounded-full border-2 border-white/30 grid place-items-center animate-spin-slow",
					style: { background: "oklch(0.65 0.22 280 / 0.6)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-3.5 w-3.5 text-white" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 m-auto h-2 w-2 rounded-full bg-black/60 pointer-events-none" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "whitespace-nowrap overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-white text-[11px] font-semibold inline-block animate-marquee",
						children: [
							title,
							" · ",
							artist
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 mt-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-2.5 w-2.5 text-white/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-white/60 text-[10px]",
						children: "Original audio"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: toggleMute,
				className: "h-8 w-8 rounded-full grid place-items-center shrink-0 transition-all active:scale-90",
				style: {
					background: "rgba(0,0,0,0.45)",
					border: "1px solid rgba(255,255,255,0.2)"
				},
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MuteIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnmuteIcon, {})
			})
		]
	});
}
function MuteIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "h-4 w-4 fill-white",
		xmlns: "http://www.w3.org/2000/svg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" })
	});
}
function UnmuteIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "h-4 w-4 fill-white",
		xmlns: "http://www.w3.org/2000/svg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" })
	});
}
function PostCommentCount({ postId }) {
	const { data } = useQuery({
		queryKey: ["post-comment-count", postId],
		queryFn: async () => {
			const { count } = await supabase.from("post_comments").select("id", {
				count: "exact",
				head: true
			}).eq("post_id", postId);
			return count ?? 0;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm font-medium text-muted-foreground",
		children: data ? data : ""
	});
}
function PostCommentPreview({ postId, onViewAll }) {
	const { data: comments } = useQuery({
		queryKey: ["post-comment-preview", postId],
		queryFn: async () => {
			const { data } = await supabase.from("post_comments").select("id, content, user_id").eq("post_id", postId).order("created_at", { ascending: true }).limit(2);
			return data ?? [];
		}
	});
	const previewUserIds = [...new Set((comments ?? []).map((c) => c.user_id))];
	const { data: previewProfiles } = useQuery({
		queryKey: ["post-comment-preview-profiles", previewUserIds],
		enabled: previewUserIds.length > 0,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("id, username").in("id", previewUserIds);
			const map = {};
			(data ?? []).forEach((p) => {
				map[p.id] = p.username;
			});
			return map;
		}
	});
	const { data: count } = useQuery({
		queryKey: ["post-comment-count", postId],
		queryFn: async () => {
			const { count } = await supabase.from("post_comments").select("id", {
				count: "exact",
				head: true
			}).eq("post_id", postId);
			return count ?? 0;
		}
	});
	if (!comments || comments.length === 0) return null;
	const profiles = previewProfiles ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 pb-1 space-y-0.5",
		children: [count > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: onViewAll,
			className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
			children: [
				"View all ",
				count,
				" comments"
			]
		}), comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold mr-1.5",
				children: profiles[c.user_id] ?? "user"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-foreground/80",
				children: c.content
			})]
		}, c.id))]
	});
}
function QuickComment({ postId, meId }) {
	const qc = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [posting, setPosting] = (0, import_react.useState)(false);
	async function post() {
		if (!text.trim() || posting) return;
		setPosting(true);
		await supabase.from("post_comments").insert({
			post_id: postId,
			user_id: meId,
			content: text.trim()
		});
		setPosting(false);
		setText("");
		qc.invalidateQueries({ queryKey: ["post-comment-preview", postId] });
		qc.invalidateQueries({ queryKey: ["post-comment-count", postId] });
		qc.invalidateQueries({ queryKey: ["post-comments", postId] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 px-4 pb-3 pt-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: text,
			onChange: (e) => setText(e.target.value),
			onKeyDown: (e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					post();
				}
			},
			placeholder: "Add a comment…",
			maxLength: 500,
			className: "flex-1 h-9 rounded-xl bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring/50"
		}), text.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: post,
			disabled: posting,
			className: "text-sm font-semibold transition-colors",
			style: { color: "oklch(0.75 0.18 280)" },
			children: posting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Post"
		})]
	});
}
function CommentsDrawer({ post, meId, onClose }) {
	const qc = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [posting, setPosting] = (0, import_react.useState)(false);
	const bottomRef = (0, import_react.useRef)(null);
	const commentsQ = useQuery({
		queryKey: ["post-comments", post.id],
		queryFn: async () => {
			const { data } = await supabase.from("post_comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
			return data ?? [];
		}
	});
	const commentorIds = [...new Set((commentsQ.data ?? []).map((c) => c.user_id))];
	const profilesQ = useQuery({
		queryKey: ["post-comment-profiles", commentorIds],
		enabled: commentorIds.length > 0,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("*").in("id", commentorIds);
			const map = {};
			data.forEach((p) => {
				map[p.id] = p;
			});
			return map;
		}
	});
	async function postComment() {
		if (!text.trim() || posting) return;
		setPosting(true);
		const { error } = await supabase.from("post_comments").insert({
			post_id: post.id,
			user_id: meId,
			content: text.trim()
		});
		setPosting(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		setText("");
		qc.invalidateQueries({ queryKey: ["post-comments", post.id] });
		qc.invalidateQueries({ queryKey: ["post-comment-count", post.id] });
		qc.invalidateQueries({ queryKey: ["post-comment-preview", post.id] });
		setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
	}
	async function deleteComment(id) {
		await supabase.from("post_comments").delete().eq("id", id);
		qc.invalidateQueries({ queryKey: ["post-comments", post.id] });
		qc.invalidateQueries({ queryKey: ["post-comment-count", post.id] });
		qc.invalidateQueries({ queryKey: ["post-comment-preview", post.id] });
	}
	const comments = commentsQ.data ?? [];
	const profiles = profilesQ.data ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex flex-col justify-end bg-black/70",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col rounded-t-3xl overflow-hidden w-full max-w-lg mx-auto",
			style: {
				maxHeight: "85dvh",
				background: "oklch(0.14 0.015 268 / 0.98)",
				backdropFilter: "blur(20px)",
				border: "1px solid oklch(0.26 0.018 268)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-2 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-white/20" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 pb-3 border-b shrink-0",
					style: { borderColor: "oklch(0.24 0.016 268)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Comments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-muted-foreground hover:text-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0",
					children: [
						commentsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center py-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
						}),
						!commentsQ.isLoading && comments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-muted-foreground text-sm py-8",
							children: "No comments yet. Be the first!"
						}),
						comments.map((c) => {
							const p = profiles[c.user_id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/profile",
										search: { userId: c.user_id },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
											className: "h-8 w-8 shrink-0 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: p?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
												className: "text-[10px] font-bold",
												style: {
													background: "var(--gradient-primary)",
													color: "white"
												},
												children: initials(p?.username ?? "?")
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline gap-2 flex-wrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold",
												children: p?.display_name || p?.username || "user"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground",
												children: timeAgo(c.created_at)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm mt-0.5 leading-relaxed",
											children: c.content
										})]
									}),
									c.user_id === meId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => deleteComment(c.id),
										className: "opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-muted-foreground hover:text-destructive" })
									})
								]
							}, c.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-3 border-t flex items-center gap-2 shrink-0",
					style: { borderColor: "oklch(0.24 0.016 268)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: text,
						onChange: (e) => setText(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								postComment();
							}
						},
						placeholder: "Add a comment…",
						maxLength: 500,
						className: "flex-1 rounded-xl bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring/50"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						className: "h-10 w-10 rounded-xl shrink-0",
						style: { background: "var(--gradient-primary)" },
						disabled: posting || !text.trim(),
						onClick: postComment,
						children: posting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
					})]
				})
			]
		})
	});
}
function UploadPostDialog({ open, onOpenChange, userId }) {
	const qc = useQueryClient();
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [musicPickerOpen, setMusicPickerOpen] = (0, import_react.useState)(false);
	const [selectedMusic, setSelectedMusic] = (0, import_react.useState)(null);
	const [cropRatio, setCropRatio] = (0, import_react.useState)("4/5");
	const inputRef = (0, import_react.useRef)(null);
	function reset() {
		setFile(null);
		setPreview(null);
		setCaption("");
		setSelectedMusic(null);
		setMusicPickerOpen(false);
		setCropRatio("4/5");
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
		const img = new Image();
		img.onload = () => setCropRatio(snapPostRatio(img.naturalWidth, img.naturalHeight));
		img.src = URL.createObjectURL(f);
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
				caption: caption.trim() || null,
				music_title: selectedMusic?.track.trackName ?? null,
				music_artist: selectedMusic?.track.artistName ?? null,
				music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
				music_preview_url: selectedMusic?.track.previewUrl ?? null,
				music_start_sec: selectedMusic?.startSec ?? 0
			});
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Post shared!");
			qc.invalidateQueries({ queryKey: ["feed-posts"] });
			qc.invalidateQueries({ queryKey: ["posts", userId] });
			reset();
			onOpenChange(false);
		} finally {
			setUploading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: open && !musicPickerOpen,
		onOpenChange: (v) => {
			if (!uploading) {
				onOpenChange(v);
				if (!v) reset();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
					className: "h-5 w-5",
					style: { color: "oklch(0.75 0.18 280)" }
				}), "New post"]
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
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1.5 justify-center flex-wrap",
							children: [
								{
									ratio: "1/1",
									label: "1:1",
									icon: "⬛"
								},
								{
									ratio: "4/5",
									label: "4:5",
									icon: "▬"
								},
								{
									ratio: "1080/566",
									label: "1.91:1",
									icon: "▭"
								}
							].map(({ ratio, label, icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setCropRatio(ratio),
								className: cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border", cropRatio === ratio ? "border-primary/60 text-foreground bg-primary/10" : "border-border text-muted-foreground hover:border-primary/30"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px]",
									children: icon
								}), label]
							}, ratio))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full rounded-2xl overflow-hidden bg-black",
							style: { aspectRatio: cropRatio },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: preview,
								alt: "",
								className: "absolute inset-0 w-full h-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: reset,
								className: "absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-all z-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-white" })
							})]
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMusicPickerOpen(true),
						className: cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-sm", selectedMusic ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 bg-card"),
						children: selectedMusic ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: selectedMusic.track.artworkUrl100,
								alt: "",
								className: "h-9 w-9 rounded-lg object-cover shrink-0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium truncate text-xs leading-tight",
									children: selectedMusic.track.trackName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground truncate text-[11px]",
									children: [selectedMusic.track.artistName, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2 text-primary/70",
										children: ["· from ", formatSec(selectedMusic.startSec)]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									setSelectedMusic(null);
								},
								className: "shrink-0 h-6 w-6 rounded-full grid place-items-center hover:bg-white/10 transition-all",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 text-muted-foreground" })
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-xl grid place-items-center shrink-0",
								style: {
									background: "oklch(0.65 0.22 280 / 0.12)",
									border: "1px solid oklch(0.65 0.22 280 / 0.20)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-4 w-4 text-primary" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left text-muted-foreground",
								children: "Add music"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground/50 shrink-0" })
						] })
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
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicPickerDialog, {
		open: musicPickerOpen,
		onOpenChange: setMusicPickerOpen,
		onSelect: (music) => {
			setSelectedMusic(music);
			setMusicPickerOpen(false);
		}
	})] });
}
var CLIP_DURATION = 15;
var PREVIEW_DURATION = 30;
function formatSec(s) {
	return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}
function MusicPickerDialog({ open, onOpenChange, onSelect }) {
	const [step, setStep] = (0, import_react.useState)("search");
	const [query, setQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [pendingTrack, setPendingTrack] = (0, import_react.useState)(null);
	const [previewId, setPreviewId] = (0, import_react.useState)(null);
	const audioRef = (0, import_react.useRef)(null);
	const debounceRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) {
			audioRef.current?.pause();
			setPreviewId(null);
			setQuery("");
			setResults([]);
			setStep("search");
			setPendingTrack(null);
		}
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (!query.trim()) {
			setResults([]);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setSearching(true);
			try {
				setResults(((await (await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`)).json()).results ?? []).filter((t) => t.previewUrl));
			} catch {
				toast.error("Music search failed");
			} finally {
				setSearching(false);
			}
		}, 400);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query]);
	function togglePreview(track) {
		if (previewId === track.trackId) {
			audioRef.current?.pause();
			setPreviewId(null);
		} else {
			if (audioRef.current) audioRef.current.pause();
			const a = new Audio(track.previewUrl);
			a.play().catch(() => {});
			a.onended = () => setPreviewId(null);
			audioRef.current = a;
			setPreviewId(track.trackId);
		}
	}
	function goToTrim(track) {
		audioRef.current?.pause();
		setPreviewId(null);
		setPendingTrack(track);
		setStep("trim");
	}
	function confirmTrim(startSec) {
		if (!pendingTrack) return;
		onSelect({
			track: pendingTrack,
			startSec
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)] flex flex-col max-h-[92dvh] p-0 overflow-hidden",
			children: [step === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 pt-5 pb-3 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-5 w-5 text-primary" }), " Add Music"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search songs, artists…",
						className: "pl-9 rounded-xl",
						autoFocus: true
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto px-3 pb-3 space-y-1 min-h-0",
				children: [
					searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center py-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
					}),
					!searching && query && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground py-8",
						children: "No songs found"
					}),
					!searching && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-2 py-10 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-12 w-12 rounded-2xl grid place-items-center",
							style: {
								background: "oklch(0.65 0.22 280 / 0.10)",
								border: "1px solid oklch(0.65 0.22 280 / 0.20)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-5 w-5 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Search for a song to add"
						})]
					}),
					results.map((track) => {
						const isPlaying = previewId === track.trackId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-2 py-2 rounded-xl transition-all hover:bg-white/5 cursor-pointer",
							onClick: () => goToTrim(track),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: track.artworkUrl100,
										alt: "",
										className: "h-11 w-11 rounded-lg object-cover"
									}), isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-3 w-3 rounded-full bg-white animate-spin",
											style: { animationDuration: "1.2s" }
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium truncate",
										children: track.trackName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground truncate",
										children: track.artistName
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: (e) => {
										e.stopPropagation();
										togglePreview(track);
									},
									className: cn("h-8 w-8 rounded-full shrink-0 grid place-items-center transition-all", isPlaying ? "bg-primary text-white" : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"),
									children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5 ml-0.5" })
								})
							]
						}, track.trackId);
					})
				]
			})] }), step === "trim" && pendingTrack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicTrimStep, {
				track: pendingTrack,
				onBack: () => {
					setStep("search");
					setPendingTrack(null);
				},
				onConfirm: confirmTrim
			})]
		})
	});
}
function MusicTrimStep({ track, onBack, onConfirm }) {
	const CLIP = CLIP_DURATION;
	const TOTAL = PREVIEW_DURATION;
	const MAX_START = TOTAL - CLIP;
	const startSecRef = (0, import_react.useRef)(0);
	const [startSec, setStartSec] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [currentTime, setCurrentTime] = (0, import_react.useState)(0);
	const audioRef = (0, import_react.useRef)(null);
	const trackRef = (0, import_react.useRef)(null);
	const isDragging = (0, import_react.useRef)(false);
	const dragStartX = (0, import_react.useRef)(0);
	const dragStartSec = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const a = new Audio(track.previewUrl);
		a.currentTime = 0;
		a.ontimeupdate = () => {
			setCurrentTime(a.currentTime);
			if (a.currentTime >= startSecRef.current + CLIP) a.currentTime = startSecRef.current;
		};
		a.play().catch(() => {});
		audioRef.current = a;
		setPlaying(true);
		return () => {
			a.pause();
			a.src = "";
		};
	}, [track.previewUrl]);
	function seekTo(sec) {
		const clamped = Math.max(0, Math.min(sec, MAX_START));
		startSecRef.current = clamped;
		setStartSec(clamped);
		if (audioRef.current) audioRef.current.currentTime = clamped;
	}
	function togglePlay() {
		if (!audioRef.current) return;
		if (playing) {
			audioRef.current.pause();
			setPlaying(false);
		} else {
			audioRef.current.play().catch(() => {});
			setPlaying(true);
		}
	}
	function onPointerDown(e) {
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		isDragging.current = true;
		dragStartX.current = e.clientX;
		dragStartSec.current = startSecRef.current;
	}
	function onPointerMove(e) {
		if (!isDragging.current) return;
		const trackW = trackRef.current?.getBoundingClientRect().width ?? 1;
		const dx = e.clientX - dragStartX.current;
		const secPerPx = TOTAL / trackW;
		seekTo(dragStartSec.current + dx * secPerPx);
	}
	function onPointerUp(e) {
		e.currentTarget.releasePointerCapture(e.pointerId);
		isDragging.current = false;
	}
	function onTrackClick(e) {
		if (isDragging.current) return;
		const rect = trackRef.current?.getBoundingClientRect();
		if (!rect) return;
		seekTo((e.clientX - rect.left) / rect.width * TOTAL - CLIP / 2);
	}
	const playheadRatio = Math.min(currentTime / TOTAL, 1);
	const selLeft = startSec / TOTAL * 100;
	const selWidth = CLIP / TOTAL * 100;
	const bars = Array.from({ length: 52 }, (_, i) => {
		return .25 + (Math.sin(i * .6) * .3 + Math.sin(i * 1.3 + 1) * .25 + Math.sin(i * .3 + 2) * .2 + .75) * .4;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-4 pt-5 pb-4 shrink-0 border-b",
			style: { borderColor: "oklch(0.22 0.016 268)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onBack,
					className: "h-8 w-8 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: track.artworkUrl100,
					alt: "",
					className: "h-10 w-10 rounded-xl object-cover shrink-0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold truncate",
						children: track.trackName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground truncate",
						children: track.artistName
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: togglePlay,
					className: "h-9 w-9 rounded-full shrink-0 grid place-items-center transition-all bg-primary text-white",
					children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 ml-0.5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col justify-center px-4 py-4 gap-4 music-trim-body overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-semibold",
						children: [
							"Select a ",
							CLIP,
							"s clip"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Drag the highlighted window · or tap anywhere to jump"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: trackRef,
					className: "relative select-none touch-none",
					style: { userSelect: "none" },
					onClick: onTrackClick,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-[2px] h-16 rounded-xl overflow-hidden px-0.5",
							children: bars.map((h, i) => {
								const barRatio = i / bars.length;
								const inSel = barRatio * 100 >= selLeft && barRatio * 100 < selLeft + selWidth;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1 rounded-sm transition-colors duration-75",
									style: {
										height: `${h * 100}%`,
										background: inSel ? "oklch(0.65 0.22 280)" : "oklch(0.30 0.018 268)"
									}
								}, i);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-0 bottom-0 rounded-xl touch-none",
							style: {
								left: `${selLeft}%`,
								width: `${selWidth}%`,
								background: "oklch(0.65 0.22 280 / 0.18)",
								border: "2px solid oklch(0.65 0.22 280)",
								cursor: isDragging.current ? "grabbing" : "grab",
								touchAction: "none"
							},
							onPointerDown,
							onPointerMove,
							onPointerUp,
							onPointerCancel: onPointerUp,
							onClick: (e) => e.stopPropagation(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-[3px] rounded-full bg-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute right-0 top-0 bottom-0 w-5 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-[3px] rounded-full bg-primary" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none",
							style: {
								left: `${playheadRatio * 100}%`,
								background: "white",
								opacity: .85,
								transition: "left 0.08s linear"
							}
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-[11px] -mt-2 px-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "0:00"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-primary font-semibold tabular-nums",
							children: [
								formatSec(startSec),
								" – ",
								formatSec(Math.min(startSec + CLIP, TOTAL))
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: formatSec(TOTAL)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => onConfirm(startSec),
					className: "w-full h-11 rounded-xl font-semibold text-white",
					style: { background: "var(--gradient-primary)" },
					children: "Use this clip"
				})
			]
		})]
	});
}
function PostSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b pb-4",
		style: { borderColor: "oklch(0.20 0.016 268)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-9 rounded-full shimmer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-28 rounded shimmer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2.5 w-16 rounded shimmer" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/5] shimmer" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-3 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-16 rounded shimmer" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-48 rounded shimmer" })]
			})
		]
	});
}
function FeedEmpty({ onUpload }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center py-24 px-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-16 w-16 rounded-3xl grid place-items-center mb-5",
				style: {
					background: "var(--gradient-primary)",
					boxShadow: "var(--shadow-glow)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-7 w-7 text-white" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-bold mb-2",
				children: "No posts yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mb-6",
				children: "Be the first to share something."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: onUpload,
				className: "gap-2",
				style: { background: "var(--gradient-primary)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Upload a post"]
			})
		]
	});
}
//#endregion
export { FeedPage as component };
