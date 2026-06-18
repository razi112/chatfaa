import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, r as useAuth } from "./utils-DsLFkheH.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as PanelLeftClose, G as LoaderCircle, O as Plus, P as PanelLeftOpen, T as Send, X as House, Z as Heart, a as Volume2, g as Trash2, i as VolumeX, k as Play, n as X, o as Video, p as Upload, xt as ArrowLeft, z as MessageCircle } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, c as Textarea, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-CqBxy85j.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-D2ZxaxMO.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reels-Ba0d2EmP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function ReelsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(0);
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(true);
	const containerRef = (0, import_react.useRef)(null);
	const reelsQ = useQuery({
		queryKey: ["reels"],
		queryFn: async () => {
			const { data, error } = await supabase.from("reels").select("*").order("created_at", { ascending: false }).limit(50);
			if (error) throw error;
			return data;
		}
	});
	const ownerIds = [...new Set((reelsQ.data ?? []).map((r) => r.user_id))];
	const profilesQ = useQuery({
		queryKey: ["reel-profiles", ownerIds],
		enabled: ownerIds.length > 0,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").in("id", ownerIds);
			if (error) throw error;
			const map = {};
			data.forEach((p) => {
				map[p.id] = p;
			});
			return map;
		}
	});
	const likesQ = useQuery({
		queryKey: ["reel-likes"],
		queryFn: async () => {
			const { data, error } = await supabase.from("reel_likes").select("*");
			if (error) throw error;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel("rt-reels").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "reels"
		}, () => qc.invalidateQueries({ queryKey: ["reels"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "reel_likes"
		}, () => qc.invalidateQueries({ queryKey: ["reel-likes"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "reel_comments"
		}, () => qc.invalidateQueries({ queryKey: ["reel-comments"] })).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [qc]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((i) => {
					const max = (reelsQ.data?.length ?? 1) - 1;
					return e.key === "ArrowDown" ? Math.min(i + 1, max) : Math.max(i - 1, 0);
				});
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [reelsQ.data]);
	if (!user) return null;
	const reels = reelsQ.data ?? [];
	const profiles = profilesQ.data ?? {};
	const likes = likesQ.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-[100dvh] w-full bg-black flex items-center justify-center overflow-hidden relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: (e) => {
					e.stopPropagation();
					navigate({ to: "/feed" });
				},
				className: "absolute z-50 flex items-center justify-center h-10 w-10 rounded-full transition-all active:scale-90",
				style: {
					top: "calc(0.75rem + env(safe-area-inset-top))",
					left: "1rem",
					background: "rgba(0,0,0,0.45)",
					backdropFilter: "blur(6px)",
					WebkitBackdropFilter: "blur(6px)",
					border: "none",
					outline: "none"
				},
				"aria-label": "Back to feed",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5 text-white drop-shadow" })
			}),
			reels.length === 0 && !reelsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center px-6 z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto h-16 w-16 rounded-3xl grid place-items-center mb-5",
						style: {
							background: "var(--gradient-primary)",
							boxShadow: "var(--shadow-glow)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8 text-white fill-white" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-bold text-white mb-2",
						children: "No reels yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-white/50 mb-6",
						children: "Be the first to share a reel."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setUploadOpen(true),
						className: "gap-2",
						style: { background: "var(--gradient-primary)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Upload reel"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/chat",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-white/50 hover:text-white gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to chat"]
							})
						})
					})
				]
			}),
			reels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: containerRef,
				className: "relative overflow-y-scroll snap-y snap-mandatory no-overscroll",
				style: {
					width: "min(100vw, calc(100dvh * 9 / 16))",
					height: "100dvh",
					scrollbarWidth: "none"
				},
				onScroll: (e) => {
					const el = e.currentTarget;
					setActiveIndex(Math.round(el.scrollTop / el.clientHeight));
				},
				children: reels.map((reel, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelCard, {
					reel,
					profile: profiles[reel.user_id],
					likes: likes.filter((l) => l.reel_id === reel.id),
					meId: user.id,
					isActive: i === activeIndex
				}, reel.id))
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "reels-sidebar absolute left-0 top-0 h-full z-30 flex flex-col items-center py-4 gap-2 border-r overflow-hidden transition-all duration-300",
				style: {
					width: sidebarOpen ? "60px" : "0px",
					opacity: sidebarOpen ? 1 : 0,
					borderColor: "oklch(0.18 0.016 268)",
					background: "var(--color-sidebar)",
					pointerEvents: sidebarOpen ? "auto" : "none"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-9 w-9 place-items-center rounded-2xl mb-2 shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)] shrink-0",
					style: { background: "var(--gradient-primary)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 text-white fill-white" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/feed",
							"aria-label": "Feed",
							title: "Feed",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-[17px] w-[17px]" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/chat",
							"aria-label": "Chats",
							title: "Chats",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-[17px] w-[17px]" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Reels",
							title: "Reels",
							className: "relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 text-white shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]",
							style: { background: "var(--gradient-primary)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "h-[17px] w-[17px]" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setUploadOpen(true),
							"aria-label": "Upload reel",
							title: "Upload reel",
							className: "relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-[17px] w-[17px]" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setSidebarOpen((v) => !v),
				"aria-label": sidebarOpen ? "Hide sidebar" : "Show sidebar",
				title: sidebarOpen ? "Hide sidebar" : "Show sidebar",
				className: "reels-toggle absolute z-40 top-4 flex items-center justify-center h-7 w-7 rounded-full transition-all duration-300 text-white/70 hover:text-white hover:bg-white/15",
				style: { left: sidebarOpen ? "68px" : "8px" },
				children: sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftClose, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftOpen, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollToActive, {
				containerRef,
				index: activeIndex
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadReelDialog, {
				open: uploadOpen,
				onOpenChange: setUploadOpen,
				userId: user.id
			})
		]
	});
}
function ScrollToActive({ containerRef, index }) {
	(0, import_react.useEffect)(() => {
		const el = containerRef.current;
		if (!el) return;
		el.scrollTo({
			top: index * el.clientHeight,
			behavior: "smooth"
		});
	}, [index, containerRef]);
	return null;
}
function ReelCard({ reel, profile, likes, meId, isActive }) {
	const qc = useQueryClient();
	const videoRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(true);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [commentsOpen, setCommentsOpen] = (0, import_react.useState)(false);
	const lastTapRef = (0, import_react.useRef)(0);
	const [heartBurst, setHeartBurst] = (0, import_react.useState)(null);
	const liked = likes.some((l) => l.user_id === meId);
	const likeCount = likes.length;
	(0, import_react.useEffect)(() => {
		const vid = videoRef.current;
		if (!vid) return;
		if (isActive) vid.play().then(() => setPlaying(true)).catch(() => {});
		else {
			vid.pause();
			vid.currentTime = 0;
			setPlaying(false);
		}
	}, [isActive]);
	function togglePlay() {
		const vid = videoRef.current;
		if (!vid) return;
		if (playing) {
			vid.pause();
			setPlaying(false);
		} else vid.play().then(() => setPlaying(true)).catch(() => {});
	}
	function handleTap(e) {
		const now = Date.now();
		const delta = now - lastTapRef.current;
		if (delta < 300 && delta > 0) {
			if (!liked) supabase.from("reel_likes").insert({
				reel_id: reel.id,
				user_id: meId
			}).then(() => qc.invalidateQueries({ queryKey: ["reel-likes"] }));
			const rect = e.currentTarget.getBoundingClientRect();
			setHeartBurst({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
				id: now
			});
			setTimeout(() => setHeartBurst(null), 900);
		} else {
			const t = window.setTimeout(() => {
				if (Date.now() - now >= 280) togglePlay();
			}, 300);
			handleTap._t && clearTimeout(handleTap._t);
			handleTap._t = t;
		}
		lastTapRef.current = now;
	}
	async function toggleLike() {
		if (liked) await supabase.from("reel_likes").delete().eq("reel_id", reel.id).eq("user_id", meId);
		else await supabase.from("reel_likes").insert({
			reel_id: reel.id,
			user_id: meId
		});
		qc.invalidateQueries({ queryKey: ["reel-likes"] });
	}
	async function deleteReel() {
		if (!confirm("Delete this reel?")) return;
		const { error } = await supabase.from("reels").delete().eq("id", reel.id);
		if (error) toast.error(error.message);
		else {
			toast.success("Reel deleted");
			qc.invalidateQueries({ queryKey: ["reels"] });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative snap-start snap-always flex-shrink-0 overflow-hidden bg-black",
		style: {
			width: "100%",
			height: "100dvh"
		},
		onClick: handleTap,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				src: reel.video_url,
				loop: true,
				muted,
				playsInline: true,
				className: "absolute inset-0 w-full h-full",
				style: {
					objectFit: "cover",
					objectPosition: "center"
				},
				onTimeUpdate: (e) => {
					const vid = e.currentTarget;
					if (vid.duration) setProgress(vid.currentTime / vid.duration * 100);
				}
			}),
			heartBurst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute pointer-events-none z-20",
				style: {
					left: heartBurst.x,
					top: heartBurst.y,
					transform: "translate(-50%, -50%)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
					className: "h-16 w-16 animate-heart-burst",
					style: {
						color: "#e6337e",
						fill: "#e6337e"
					}
				})
			}, heartBurst.id),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 pointer-events-none",
				style: { background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 100%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full transition-all duration-100",
					style: {
						width: `${progress}%`,
						background: "var(--gradient-primary)"
					}
				})
			}),
			!playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center pointer-events-none z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-16 w-16 rounded-full grid place-items-center bg-black/50 backdrop-blur-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8 text-white fill-white ml-1" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-0 right-0 z-10 px-4 pt-16",
				style: {
					bottom: 0,
					paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
					background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile",
						search: { userId: reel.user_id },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "h-9 w-9 ring-2 ring-white/40 shrink-0 cursor-pointer hover:ring-white/70 transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: profile?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "text-xs font-bold bg-primary/30 text-white",
								children: initials(profile?.username ?? "?")
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-white font-semibold text-sm leading-tight drop-shadow",
						children: profile?.display_name || profile?.username || "Unknown"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-white/60 text-xs",
						children: [
							"@",
							profile?.username,
							" · ",
							timeAgo(reel.created_at)
						]
					})] })]
				}), reel.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white text-sm leading-relaxed line-clamp-2 drop-shadow",
					children: reel.caption
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 z-10 flex flex-col items-center gap-5 reel-action-rail",
				style: { bottom: "calc(5.5rem + env(safe-area-inset-bottom))" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: toggleLike,
						className: "flex flex-col items-center gap-1 group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-11 w-11 rounded-full grid place-items-center transition-all active:scale-90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-6 w-6 transition-all", liked ? "fill-red-500 text-red-500 scale-110" : "text-white") })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white text-xs font-semibold drop-shadow",
							children: likeCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setCommentsOpen(true),
						className: "flex flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-11 w-11 rounded-full grid place-items-center bg-black/40 hover:bg-black/60 transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-6 w-6 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white text-xs font-semibold drop-shadow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentCount, { reelId: reel.id })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMuted((v) => !v),
						className: "h-11 w-11 rounded-full grid place-items-center bg-black/40 hover:bg-black/60 transition-all",
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-6 w-6 text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-6 w-6 text-white" })
					}),
					reel.user_id === meId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: deleteReel,
						className: "h-11 w-11 rounded-full grid place-items-center bg-black/40 hover:bg-red-500/30 transition-all",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5 text-white/70 hover:text-red-400" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSheet, {
				open: commentsOpen,
				onClose: () => setCommentsOpen(false),
				reel,
				meId
			})
		]
	});
}
function CommentCount({ reelId }) {
	const { data } = useQuery({
		queryKey: ["reel-comment-count", reelId],
		queryFn: async () => {
			const { count, error } = await supabase.from("reel_comments").select("id", {
				count: "exact",
				head: true
			}).eq("reel_id", reelId);
			if (error) return 0;
			return count ?? 0;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: data ?? 0 });
}
function CommentsSheet({ open, onClose, reel, meId }) {
	const qc = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [posting, setPosting] = (0, import_react.useState)(false);
	const commentsQ = useQuery({
		queryKey: ["reel-comments", reel.id],
		enabled: open,
		queryFn: async () => {
			const { data, error } = await supabase.from("reel_comments").select("*").eq("reel_id", reel.id).order("created_at", { ascending: true });
			if (error) throw error;
			return data;
		}
	});
	const commentorIds = [...new Set((commentsQ.data ?? []).map((c) => c.user_id))];
	const profilesQ = useQuery({
		queryKey: ["reel-comment-profiles", commentorIds],
		enabled: commentorIds.length > 0,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").in("id", commentorIds);
			if (error) throw error;
			const map = {};
			data.forEach((p) => {
				map[p.id] = p;
			});
			return map;
		}
	});
	async function post() {
		if (!text.trim() || posting) return;
		setPosting(true);
		const { error } = await supabase.from("reel_comments").insert({
			reel_id: reel.id,
			user_id: meId,
			content: text.trim()
		});
		setPosting(false);
		if (error) toast.error(error.message);
		else {
			setText("");
			qc.invalidateQueries({ queryKey: ["reel-comments", reel.id] });
			qc.invalidateQueries({ queryKey: ["reel-comment-count", reel.id] });
		}
	}
	async function deleteComment(id) {
		await supabase.from("reel_comments").delete().eq("id", id);
		qc.invalidateQueries({ queryKey: ["reel-comments", reel.id] });
		qc.invalidateQueries({ queryKey: ["reel-comment-count", reel.id] });
	}
	if (!open) return null;
	const comments = commentsQ.data ?? [];
	const profiles = profilesQ.data ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex flex-col justify-end",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col rounded-t-3xl overflow-hidden",
			style: {
				maxHeight: "70dvh",
				background: "oklch(0.14 0.015 268 / 0.97)",
				backdropFilter: "blur(20px)",
				border: "1px solid oklch(0.28 0.018 268)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-white/20" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 pb-3 border-b",
					style: { borderColor: "oklch(0.24 0.016 268)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-white text-sm",
						children: "Comments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-white/50" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0",
					children: [
						commentsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center py-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-white/30" })
						}),
						!commentsQ.isLoading && comments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-white/30 text-sm py-8",
							children: "No comments yet. Be the first!"
						}),
						comments.map((c) => {
							const p = profiles[c.user_id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
										className: "h-8 w-8 shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: p?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
											className: "text-[10px] font-bold",
											style: {
												background: "oklch(0.65 0.22 280 / 0.3)",
												color: "oklch(0.80 0.15 280)"
											},
											children: initials(p?.username ?? "?")
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-semibold text-white/80",
												children: ["@", p?.username ?? "user"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-white/30",
												children: timeAgo(c.created_at)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-white/90 mt-0.5 leading-relaxed",
											children: c.content
										})]
									}),
									c.user_id === meId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => deleteComment(c.id),
										className: "opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-white/30 hover:text-red-400" })
									})
								]
							}, c.id);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-3 border-t flex items-center gap-2",
					style: { borderColor: "oklch(0.24 0.016 268)" },
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
						className: "flex-1 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						className: "h-10 w-10 rounded-xl shrink-0",
						style: { background: "var(--gradient-primary)" },
						disabled: posting || !text.trim(),
						onClick: post,
						children: posting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
					})]
				})
			]
		})
	});
}
function UploadReelDialog({ open, onOpenChange, userId }) {
	const qc = useQueryClient();
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const inputRef = (0, import_react.useRef)(null);
	function handleFile(f) {
		if (f.size > 100 * 1024 * 1024) {
			toast.error("Video must be under 100 MB");
			return;
		}
		setFile(f);
		setPreview(URL.createObjectURL(f));
	}
	function onDrop(e) {
		e.preventDefault();
		const f = e.dataTransfer.files[0];
		if (f && f.type.startsWith("video/")) handleFile(f);
	}
	async function upload() {
		if (!file) return;
		setUploading(true);
		setProgress(10);
		const ext = file.name.split(".").pop() ?? "mp4";
		const path = `${userId}/${Date.now()}.${ext}`;
		const { error: upErr } = await supabase.storage.from("reels").upload(path, file, { upsert: false });
		if (upErr) {
			toast.error("Upload failed: " + upErr.message);
			setUploading(false);
			return;
		}
		setProgress(70);
		const { data: urlData } = supabase.storage.from("reels").getPublicUrl(path);
		const videoUrl = urlData.publicUrl;
		const { error: dbErr } = await supabase.from("reels").insert({
			user_id: userId,
			video_url: videoUrl,
			caption: caption.trim() || null
		});
		setProgress(100);
		setUploading(false);
		if (dbErr) {
			toast.error(dbErr.message);
			return;
		}
		toast.success("Reel uploaded!");
		qc.invalidateQueries({ queryKey: ["reels"] });
		setFile(null);
		setPreview(null);
		setCaption("");
		setProgress(0);
		onOpenChange(false);
	}
	function reset() {
		setFile(null);
		setPreview(null);
		setCaption("");
		setProgress(0);
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
			className: "rounded-2xl w-[calc(100vw-2rem)] max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
					className: "h-5 w-5",
					style: { color: "oklch(0.75 0.18 280)" }
				}), "Upload reel"]
			}) }), !file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onDrop,
				onDragOver: (e) => e.preventDefault(),
				onClick: () => inputRef.current?.click(),
				className: "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer py-12 transition-colors hover:border-primary/50",
				style: { borderColor: "oklch(0.28 0.018 268)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-12 w-12 rounded-2xl grid place-items-center",
						style: { background: "oklch(0.65 0.22 280 / 0.15)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
							className: "h-6 w-6",
							style: { color: "oklch(0.75 0.18 280)" }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: "Drop video here or click to browse"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "MP4, WebM, MOV · Max 100 MB"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						accept: "video/mp4,video/webm,video/quicktime",
						className: "hidden",
						onChange: (e) => {
							const f = e.target.files?.[0];
							if (f) handleFile(f);
						}
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative rounded-2xl overflow-hidden mx-auto bg-black",
						style: {
							aspectRatio: "9/16",
							maxHeight: "55dvh",
							width: "auto"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: preview ?? void 0,
							className: "w-full h-full object-cover",
							controls: true,
							muted: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: reset,
							className: "absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-white" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-sm font-medium",
								children: "Caption"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: caption,
								onChange: (e) => setCaption(e.target.value),
								placeholder: "Write a caption…",
								maxLength: 2200,
								rows: 3,
								className: "rounded-xl resize-none text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground text-right",
								children: [caption.length, "/2200"]
							})
						]
					}),
					uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 rounded-full overflow-hidden",
							style: { background: "oklch(0.20 0.016 268)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full transition-all duration-300",
								style: {
									width: `${progress}%`,
									background: "var(--gradient-primary)"
								}
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground text-center",
							children: [
								"Uploading… ",
								progress,
								"%"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: upload,
						disabled: uploading,
						className: "w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]",
						style: { background: "var(--gradient-primary)" },
						children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Uploading…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), " Post reel"] })
					})
				]
			})]
		})
	});
}
//#endregion
export { ReelsPage as component };
