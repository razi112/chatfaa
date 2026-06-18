import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn, r as useAuth } from "./utils-DsLFkheH.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { t as Label } from "./label-CsVfh20r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Menu, D as Save, E as Search, G as LoaderCircle, H as LogOut, I as Music, J as Inbox, N as Pause, O as Plus, Q as Hash, S as ShieldOff, T as Send, X as House, b as Smile, c as UsersRound, dt as ChevronLeft, g as Trash2, h as Trash, it as Eraser, j as Pencil, k as Play, l as User, m as TriangleAlert, mt as Camera, n as X, ot as EllipsisVertical, pt as Check, q as KeyRound, s as Users, u as UserPlus, v as Star, vt as Ban, w as Settings2, x as Shield, xt as ArrowLeft, z as MessageCircle } from "../_libs/lucide-react.mjs";
import { a as Portal, i as Overlay, n as Content, o as Root, r as Description, s as Title, t as Close } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as DialogHeader, c as Textarea, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-CqBxy85j.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-D2ZxaxMO.mjs";
import { a as DropdownMenuTrigger, i as DropdownMenuSeparator, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-Br-kiqFc.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-wX8RxjBC.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root$1, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as Root$2 } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-CWlGA8yy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root$1.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Sheet = Root;
var SheetPortal = Portal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = Title.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = Description.displayName;
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$2, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root$2.displayName;
function initials$1(n) {
	return (n ?? "?").slice(0, 2).toUpperCase();
}
var CLIP = 15;
var PREVIEW_TOTAL = 30;
function timeLeft(exp) {
	const ms = new Date(exp).getTime() - Date.now();
	if (ms <= 0) return "expired";
	const h = Math.floor(ms / 36e5);
	if (h >= 1) return `${h}h`;
	const m = Math.floor(ms / 6e4);
	return m < 1 ? "just now" : `${m}m`;
}
function NotesTray({ meId, meProfile, friendIds }) {
	const qc = useQueryClient();
	const [composerOpen, setComposerOpen] = (0, import_react.useState)(false);
	const [viewingNote, setViewingNote] = (0, import_react.useState)(null);
	const [replyNote, setReplyNote] = (0, import_react.useState)(null);
	const allIds = [meId, ...friendIds];
	const notesQ = useQuery({
		queryKey: ["notes", allIds.join(",")],
		queryFn: async () => {
			const { data, error } = await supabase.from("notes").select("*").in("user_id", allIds).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: false });
			if (error) return [];
			return data ?? [];
		}
	});
	const noteOwnerIds = [...new Set((notesQ.data ?? []).map((n) => n.user_id))];
	const profilesQ = useQuery({
		queryKey: ["note-profiles", noteOwnerIds],
		enabled: noteOwnerIds.length > 0,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("*").in("id", noteOwnerIds);
			const map = {};
			(data ?? []).forEach((p) => {
				map[p.id] = p;
			});
			return map;
		}
	});
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel("rt-notes").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "notes"
		}, () => {
			qc.invalidateQueries({ queryKey: ["notes"] });
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [qc]);
	const notes = notesQ.data ?? [];
	const profiles = profilesQ.data ?? {};
	const myNote = notes.find((n) => n.user_id === meId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 pt-3 pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 overflow-x-auto scrollbar-none pb-1",
				style: { scrollbarWidth: "none" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MyNoteBubble, {
					meId,
					meProfile,
					myNote,
					onOpen: () => setComposerOpen(true)
				}), notes.filter((n) => n.user_id !== meId).map((note) => {
					const p = profiles[note.user_id];
					if (!p) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendNoteBubble, {
						note,
						profile: p,
						onTap: () => setViewingNote({
							note,
							profile: p
						})
					}, note.id);
				})]
			})
		}),
		composerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteComposer, {
			meId,
			existingNote: myNote,
			onClose: () => setComposerOpen(false),
			onSaved: () => {
				qc.invalidateQueries({ queryKey: ["notes"] });
				setComposerOpen(false);
			}
		}),
		viewingNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteViewer, {
			note: viewingNote.note,
			profile: viewingNote.profile,
			meId,
			onClose: () => setViewingNote(null),
			onReply: (note) => {
				setViewingNote(null);
				setReplyNote(note);
			}
		}),
		replyNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteReplySheet, {
			note: replyNote,
			profile: profiles[replyNote.user_id] ?? null,
			meId,
			onClose: () => setReplyNote(null)
		})
	] });
}
function MyNoteBubble({ meId, meProfile, myNote, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: onOpen,
		className: "flex flex-col items-center gap-1.5 shrink-0 w-[62px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				myNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute -top-8 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-xl text-[10px] font-medium whitespace-nowrap max-w-[80px] truncate text-center",
					style: {
						background: "var(--card)",
						border: "1px solid var(--border)",
						color: "var(--foreground)"
					},
					children: [myNote.emoji ? myNote.emoji + " " : "", myNote.text]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-[54px] w-[54px] rounded-full ring-[2px] ring-offset-2 ring-offset-background", myNote ? "ring-primary" : "ring-border"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "h-full w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: meProfile?.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "text-xs font-bold",
							style: {
								background: "var(--gradient-primary)",
								color: "white"
							},
							children: initials$1(meProfile?.username ?? "?")
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full grid place-items-center text-white shadow",
					style: { background: "var(--gradient-primary)" },
					children: myNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-2.5 w-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-bold leading-none",
						children: "+"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-muted-foreground truncate w-full text-center",
			children: myNote ? "Your note" : "Add note"
		})]
	});
}
function FriendNoteBubble({ note, profile, onTap }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: onTap,
		className: "flex flex-col items-center gap-1.5 shrink-0 w-[62px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute -top-8 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-xl text-[10px] font-medium whitespace-nowrap max-w-[80px] truncate text-center",
					style: {
						background: "var(--card)",
						border: "1px solid var(--border)",
						color: "var(--foreground)"
					},
					children: [note.emoji ? note.emoji + " " : "", note.text]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[54px] w-[54px] rounded-full p-[2px]",
					style: { background: "var(--gradient-primary)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full w-full rounded-full ring-2 ring-background overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "h-full w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: profile.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "text-xs font-bold",
								style: {
									background: "var(--gradient-primary)",
									color: "white"
								},
								children: initials$1(profile.username)
							})]
						})
					})
				}),
				note.music_preview_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full grid place-items-center bg-card border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-2.5 w-2.5 text-primary" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-muted-foreground truncate w-full text-center",
			children: profile.display_name || profile.username
		})]
	});
}
function NoteViewer({ note, profile, meId, onClose, onReply }) {
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const audioRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!note.music_preview_url) return;
		const a = new Audio(note.music_preview_url);
		a.currentTime = note.music_start_sec ?? 0;
		a.muted = true;
		a.ontimeupdate = () => {
			if (a.currentTime >= (note.music_start_sec ?? 0) + CLIP) a.currentTime = note.music_start_sec ?? 0;
		};
		a.onended = () => setPlaying(false);
		audioRef.current = a;
		return () => {
			a.pause();
			a.src = "";
		};
	}, [note.music_preview_url, note.music_start_sec]);
	function togglePlay() {
		const a = audioRef.current;
		if (!a) return;
		if (playing) {
			a.pause();
			setPlaying(false);
		} else {
			a.muted = muted;
			a.play().catch(() => {});
			setPlaying(true);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/60",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden pb-safe",
			style: {
				background: "var(--card)",
				border: "1px solid var(--border)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 w-10 rounded-full",
						style: { background: "var(--border)" }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-5 pt-2 pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "h-10 w-10 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: profile.avatar_url ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "text-xs font-bold",
								style: {
									background: "var(--gradient-primary)",
									color: "white"
								},
								children: initials$1(profile.username)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: profile.display_name || profile.username
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [timeLeft(note.expires_at), " left"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-muted-foreground" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-5 mb-4 px-4 py-3 rounded-2xl text-center",
					style: { background: "var(--accent)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-base font-semibold leading-snug",
						children: [note.emoji && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-1",
							children: note.emoji
						}), note.text]
					})
				}),
				note.music_preview_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-5 mb-5 flex items-center gap-3 px-3 py-2.5 rounded-2xl",
					style: {
						background: "var(--accent)",
						border: "1px solid var(--border)"
					},
					children: [
						note.music_artwork_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: note.music_artwork_url,
							alt: "",
							className: "h-10 w-10 rounded-xl object-cover shrink-0"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 rounded-xl grid place-items-center shrink-0",
							style: { background: "var(--card)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-4 w-4 text-primary" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold truncate",
									children: note.music_title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground truncate",
									children: note.music_artist
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-muted-foreground/60",
									children: [CLIP, "s preview"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: togglePlay,
							className: "h-9 w-9 rounded-full grid place-items-center shrink-0 transition-all",
							style: { background: "var(--gradient-primary)" },
							children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4 text-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 text-white ml-0.5" })
						})
					]
				}),
				note.user_id !== meId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 pb-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => onReply(note),
						className: "w-full h-11 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2",
						style: { background: "var(--gradient-primary)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), " Reply"]
					})
				})
			]
		})
	});
}
function NoteReplySheet({ note, profile, meId, onClose }) {
	const [text, setText] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	async function send() {
		if (!text.trim() || sending) return;
		setSending(true);
		const { error } = await supabase.from("messages").insert({
			sender_id: meId,
			receiver_id: note.user_id,
			content: `↩ Note: "${note.text}" — ${text.trim()}`
		});
		setSending(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Reply sent!");
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[70] flex items-end justify-center bg-black/60",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden pb-safe",
			style: {
				background: "var(--card)",
				border: "1px solid var(--border)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 w-10 rounded-full",
						style: { background: "var(--border)" }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3 border-b",
					style: { borderColor: "var(--border)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mb-1",
						children: "Replying to note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [note.emoji && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-1",
							children: note.emoji
						}), note.text]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: text,
						onChange: (e) => setText(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								send();
							}
						},
						placeholder: `Reply to ${profile?.username ?? "note"}…`,
						className: "flex-1 rounded-2xl",
						autoFocus: true,
						maxLength: 500
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: send,
						disabled: sending || !text.trim(),
						size: "icon",
						className: "h-10 w-10 rounded-xl shrink-0 text-white",
						style: { background: "var(--gradient-primary)" },
						children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
					})]
				})
			]
		})
	});
}
function NoteComposer({ meId, existingNote, onClose, onSaved }) {
	const [text, setText] = (0, import_react.useState)(existingNote?.text ?? "");
	const [emoji, setEmoji] = (0, import_react.useState)(existingNote?.emoji ?? "");
	const [audience, setAudience] = (0, import_react.useState)(existingNote?.audience ?? "followers_back");
	const [selectedMusic, setSelectedMusic] = (0, import_react.useState)(existingNote?.music_preview_url ? {
		track: {
			trackId: 0,
			trackName: existingNote.music_title,
			artistName: existingNote.music_artist,
			artworkUrl100: existingNote.music_artwork_url,
			previewUrl: existingNote.music_preview_url
		},
		startSec: existingNote.music_start_sec
	} : null);
	const [musicPickerOpen, setMusicPickerOpen] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const [showEmoji, setShowEmoji] = (0, import_react.useState)(false);
	const QUICK_EMOJIS = [
		"😊",
		"😂",
		"❤️",
		"🔥",
		"🎵",
		"⚽",
		"🎮",
		"📚",
		"☕",
		"🌙",
		"✨",
		"🥳",
		"😎",
		"🤔",
		"💪",
		"🙏",
		"🎉",
		"🌸",
		"🍕",
		"🎸"
	];
	async function save() {
		if (!text.trim()) {
			toast.error("Write something first!");
			return;
		}
		setSaving(true);
		try {
			if (existingNote) {
				const { error } = await supabase.from("notes").update({
					text: text.trim(),
					emoji: emoji || null,
					audience,
					music_title: selectedMusic?.track.trackName ?? null,
					music_artist: selectedMusic?.track.artistName ?? null,
					music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
					music_preview_url: selectedMusic?.track.previewUrl ?? null,
					music_start_sec: selectedMusic?.startSec ?? 0,
					expires_at: new Date(Date.now() + 24 * 3600 * 1e3).toISOString()
				}).eq("id", existingNote.id);
				if (error) {
					toast.error(error.message);
					return;
				}
				toast.success("Note updated!");
			} else {
				const { error } = await supabase.from("notes").insert({
					user_id: meId,
					text: text.trim(),
					emoji: emoji || null,
					audience,
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
				toast.success("Note shared!");
			}
			onSaved();
		} finally {
			setSaving(false);
		}
	}
	async function deleteNote() {
		if (!existingNote) return;
		setDeleting(true);
		const { error } = await supabase.from("notes").delete().eq("id", existingNote.id);
		setDeleting(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Note deleted");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/60",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden",
			style: {
				background: "var(--card)",
				border: "1px solid var(--border)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 w-10 rounded-full",
						style: { background: "var(--border)" }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: existingNote ? "Edit note" : "New note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-muted-foreground" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 space-y-4 pb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative rounded-2xl px-4 py-3",
							style: {
								background: "var(--accent)",
								border: "1px solid var(--border)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-1",
								children: [emoji && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg",
									children: emoji
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground",
									value: text,
									onChange: (e) => setText(e.target.value.slice(0, 60)),
									placeholder: "What's on your mind?",
									maxLength: 60,
									autoFocus: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setShowEmoji((v) => !v),
									className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "h-3.5 w-3.5" }), " Emoji"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] text-muted-foreground",
									children: [text.length, "/60"]
								})]
							})]
						}),
						showEmoji && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setEmoji("");
									setShowEmoji(false);
								},
								className: "text-xs text-muted-foreground px-2 py-1 rounded-lg",
								style: { background: "var(--accent)" },
								children: "None"
							}), QUICK_EMOJIS.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setEmoji(e);
									setShowEmoji(false);
								},
								className: cn("h-8 w-8 rounded-xl text-base grid place-items-center transition-all", emoji === e ? "ring-2 ring-primary" : ""),
								style: { background: "var(--accent)" },
								children: e
							}, e))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMusicPickerOpen(true),
							className: cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all text-sm", selectedMusic ? "border-primary/50" : "border-border"),
							style: { background: "var(--accent)" },
							children: selectedMusic ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: selectedMusic.track.artworkUrl100,
									alt: "",
									className: "h-9 w-9 rounded-xl object-cover shrink-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium truncate text-xs",
										children: selectedMusic.track.trackName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground text-[11px] truncate",
										children: selectedMusic.track.artistName
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										setSelectedMusic(null);
									},
									className: "h-6 w-6 rounded-full grid place-items-center hover:bg-white/10 shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 text-muted-foreground" })
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-xl grid place-items-center shrink-0",
								style: { background: "var(--card)" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "h-4 w-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left text-muted-foreground text-sm",
								children: "Add music"
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: [{
								value: "followers_back",
								label: "Followers",
								icon: Users
							}, {
								value: "close_friends",
								label: "Close Friends",
								icon: Star
							}].map(({ value, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setAudience(value),
								className: cn("flex-1 flex items-center justify-center gap-2 h-9 rounded-2xl text-xs font-medium border transition-all", audience === value ? "border-primary/60 text-foreground" : "border-border text-muted-foreground"),
								style: { background: audience === value ? "var(--card)" : "var(--accent)" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }),
									" ",
									label
								]
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: save,
							disabled: saving || !text.trim(),
							className: "w-full h-11 rounded-2xl font-semibold text-white",
							style: { background: "var(--gradient-primary)" },
							children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : existingNote ? "Update note" : "Share note"
						}),
						existingNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: deleteNote,
							disabled: deleting,
							className: "w-full h-10 rounded-2xl text-sm font-medium text-destructive flex items-center justify-center gap-2 border border-destructive/30 hover:bg-destructive/5 transition-all",
							children: deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Delete note"] })
						})
					]
				})
			]
		})
	}), musicPickerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesMusicPicker, {
		open: musicPickerOpen,
		onOpenChange: setMusicPickerOpen,
		onSelect: (m) => {
			setSelectedMusic(m);
			setMusicPickerOpen(false);
		}
	})] });
}
function NotesMusicPicker({ open, onOpenChange, onSelect }) {
	const [step, setStep] = (0, import_react.useState)("search");
	const [query, setQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [pendingTrack, setPendingTrack] = (0, import_react.useState)(null);
	const [previewId, setPreviewId] = (0, import_react.useState)(null);
	const audioRef = (0, import_react.useRef)(null);
	const debounceRef = (0, import_react.useRef)(null);
	const TRENDING_QUERIES = [
		"Taylor Swift",
		"Ed Sheeran",
		"The Weeknd",
		"Sabrina Carpenter",
		"Drake"
	];
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
			return;
		}
		audioRef.current?.pause();
		const a = new Audio(track.previewUrl);
		a.play().catch(() => {});
		a.onended = () => setPreviewId(null);
		audioRef.current = a;
		setPreviewId(track.trackId);
	}
	function goTrim(track) {
		audioRef.current?.pause();
		setPreviewId(null);
		setPendingTrack(track);
		setStep("trim");
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[80] flex items-end justify-center bg-black/70",
		onClick: () => onOpenChange(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden flex flex-col",
			style: {
				maxHeight: "88dvh",
				background: "var(--card)",
				border: "1px solid var(--border)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center pt-3 pb-1 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1 w-10 rounded-full",
					style: { background: "var(--border)" }
				})
			}), step === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 pt-2 pb-3 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm",
						children: "Add music"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onOpenChange(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5 text-muted-foreground" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-2xl px-3",
					style: {
						background: "var(--accent)",
						border: "1px solid var(--border)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search songs, artists…",
						className: "flex-1 py-2.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
						autoFocus: true
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto px-3 pb-4 min-h-0",
				children: [
					!query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-muted-foreground px-2 mb-2",
							children: "TRENDING"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2 px-2",
							children: TRENDING_QUERIES.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQuery(q),
								className: "px-3 py-1.5 rounded-2xl text-xs font-medium border transition-all hover:border-primary/50",
								style: {
									background: "var(--accent)",
									border: "1px solid var(--border)"
								},
								children: q
							}, q))
						})]
					}),
					searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center py-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
					}),
					!searching && query && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground py-8",
						children: "No songs found"
					}),
					results.map((track) => {
						const isPlaying = previewId === track.trackId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-2 py-2 rounded-2xl transition-all hover:bg-accent cursor-pointer",
							onClick: () => goTrim(track),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: track.artworkUrl100,
									alt: "",
									className: "h-11 w-11 rounded-xl object-cover shrink-0"
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
									onClick: (e) => {
										e.stopPropagation();
										togglePreview(track);
									},
									className: cn("h-8 w-8 rounded-full grid place-items-center shrink-0 border transition-all", isPlaying ? "text-white border-transparent" : "text-muted-foreground border-border"),
									style: isPlaying ? { background: "var(--gradient-primary)" } : {},
									children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5 ml-0.5" })
								})
							]
						}, track.trackId);
					})
				]
			})] }) : pendingTrack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesMusicTrim, {
				track: pendingTrack,
				onBack: () => {
					setStep("search");
					setPendingTrack(null);
				},
				onConfirm: (startSec) => onSelect({
					track: pendingTrack,
					startSec
				})
			}) : null]
		})
	});
}
function NotesMusicTrim({ track, onBack, onConfirm }) {
	const MAX_START = PREVIEW_TOTAL - CLIP;
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
		const c = Math.max(0, Math.min(sec, MAX_START));
		startSecRef.current = c;
		setStartSec(c);
		if (audioRef.current) audioRef.current.currentTime = c;
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
		const w = trackRef.current?.getBoundingClientRect().width ?? 1;
		seekTo(dragStartSec.current + (e.clientX - dragStartX.current) * (PREVIEW_TOTAL / w));
	}
	function onPointerUp(e) {
		e.currentTarget.releasePointerCapture(e.pointerId);
		isDragging.current = false;
	}
	function onTrackClick(e) {
		if (isDragging.current) return;
		const rect = trackRef.current?.getBoundingClientRect();
		if (!rect) return;
		seekTo((e.clientX - rect.left) / rect.width * PREVIEW_TOTAL - CLIP / 2);
	}
	const bars = Array.from({ length: 40 }, (_, i) => .25 + (Math.sin(i * .6) * .3 + Math.sin(i * 1.3 + 1) * .25 + .75) * .4);
	const selLeft = startSec / PREVIEW_TOTAL * 100;
	const selWidth = CLIP / PREVIEW_TOTAL * 100;
	const playheadRatio = Math.min(currentTime / PREVIEW_TOTAL, 1);
	function fmt(s) {
		return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col flex-1 min-h-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-4 pt-3 pb-4 border-b shrink-0",
			style: { borderColor: "var(--border)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onBack,
					className: "h-8 w-8 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0",
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
					className: "h-9 w-9 rounded-full shrink-0 grid place-items-center text-white",
					style: { background: "var(--gradient-primary)" },
					children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 ml-0.5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col justify-center px-5 py-5 gap-4",
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
						children: "Drag to choose your snippet"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: trackRef,
					className: "relative select-none touch-none",
					onClick: onTrackClick,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-[2px] h-14 rounded-2xl overflow-hidden px-0.5",
							children: bars.map((h, i) => {
								const inSel = i / bars.length * 100 >= selLeft && i / bars.length * 100 < selLeft + selWidth;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1 rounded-sm",
									style: {
										height: `${h * 100}%`,
										background: inSel ? "var(--primary)" : "var(--border)"
									}
								}, i);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-0 bottom-0 rounded-2xl touch-none",
							style: {
								left: `${selLeft}%`,
								width: `${selWidth}%`,
								background: "rgba(225,48,108,0.15)",
								border: "2px solid var(--primary)",
								cursor: isDragging.current ? "grabbing" : "grab",
								touchAction: "none"
							},
							onPointerDown,
							onPointerMove,
							onPointerUp,
							onPointerCancel: onPointerUp,
							onClick: (e) => e.stopPropagation(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-[3px] rounded-full bg-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-[3px] rounded-full bg-primary" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none bg-white/70",
							style: {
								left: `${playheadRatio * 100}%`,
								transition: "left 0.08s linear"
							}
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-[11px] -mt-1 px-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "0:00"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							style: { color: "var(--primary)" },
							children: [
								fmt(startSec),
								" – ",
								fmt(Math.min(startSec + CLIP, PREVIEW_TOTAL))
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: fmt(PREVIEW_TOTAL)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => onConfirm(startSec),
					className: "w-full h-11 rounded-2xl font-semibold text-white",
					style: { background: "var(--gradient-primary)" },
					children: "Use this clip"
				})
			]
		})]
	});
}
var STICKER_CATEGORIES = [
	{
		label: "Faces",
		stickers: [
			"😀",
			"😂",
			"🥹",
			"😍",
			"🤩",
			"😎",
			"🥺",
			"😭",
			"😤",
			"🤯",
			"🥳",
			"😴",
			"🤔",
			"🫠",
			"😇",
			"🤗",
			"😈",
			"👻",
			"💀",
			"🤡"
		]
	},
	{
		label: "Gestures",
		stickers: [
			"👍",
			"👎",
			"🙌",
			"👏",
			"🤝",
			"🫶",
			"❤️",
			"🔥",
			"✨",
			"💯",
			"🎉",
			"🎊",
			"💪",
			"🤞",
			"✌️",
			"🤙",
			"👌",
			"🫡",
			"🤟",
			"🤘"
		]
	},
	{
		label: "Animals",
		stickers: [
			"🐶",
			"🐱",
			"🐭",
			"🐹",
			"🐰",
			"🦊",
			"🐻",
			"🐼",
			"🐨",
			"🐯",
			"🦁",
			"🐮",
			"🐷",
			"🐸",
			"🐵",
			"🐔",
			"🐧",
			"🐦",
			"🦄",
			"🐉"
		]
	},
	{
		label: "Food",
		stickers: [
			"🍕",
			"🍔",
			"🌮",
			"🍜",
			"🍣",
			"🍩",
			"🍪",
			"🎂",
			"🍦",
			"🧋",
			"🍷",
			"🥂",
			"☕",
			"🧃",
			"🍿",
			"🧁",
			"🍫",
			"🍓",
			"🥑",
			"🍉"
		]
	},
	{
		label: "Activities",
		stickers: [
			"⚽",
			"🏀",
			"🎮",
			"🎵",
			"🎸",
			"🎤",
			"🎨",
			"📚",
			"💻",
			"🚀",
			"🌍",
			"⛺",
			"🏖️",
			"🎭",
			"🎬",
			"🎯",
			"🏆",
			"🥇",
			"🎲",
			"🎰"
		]
	}
];
function initials(name) {
	return name.slice(0, 2).toUpperCase();
}
function UserAvatar({ src, name, size = "md", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
		className: cn(size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: src ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
			className: "font-semibold",
			style: {
				background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.3), oklch(0.70 0.18 310 / 0.3))",
				color: "oklch(0.80 0.15 280)",
				border: "1px solid oklch(0.65 0.22 280 / 0.2)"
			},
			children: initials(name)
		})]
	});
}
function OnlineDot({ size = "md" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("absolute rounded-full border-2 online-pulse", size === "sm" ? "-bottom-0.5 -right-0.5 h-2.5 w-2.5" : "-bottom-0.5 -right-0.5 h-3 w-3"),
		style: {
			background: "var(--color-online)",
			borderColor: "var(--color-background)"
		}
	});
}
function ChatApp() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const isMobile = useIsMobile();
	const [tab, setTab] = (0, import_react.useState)("chats");
	const [active, setActive] = (0, import_react.useState)(null);
	const [presence, setPresence] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const [profileOpen, setProfileOpen] = (0, import_react.useState)(false);
	const profileQ = useQuery({
		queryKey: ["me", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const friendshipsQ = useQuery({
		queryKey: ["friendships", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("friendships").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const groupsQ = useQuery({
		queryKey: ["groups", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const blockedQ = useQuery({
		queryKey: ["blocked", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("blocked_users").select("*").eq("blocker_id", user.id);
			if (error) throw error;
			return data;
		}
	});
	const groupIds = (0, import_react.useMemo)(() => (groupsQ.data ?? []).map((g) => g.id), [groupsQ.data]);
	const allMembersQ = useQuery({
		queryKey: ["group-members", groupIds],
		enabled: groupIds.length > 0,
		queryFn: async () => {
			const { data, error } = await supabase.from("group_members").select("*").in("group_id", groupIds);
			if (error) throw error;
			return data;
		}
	});
	const involvedIds = (0, import_react.useMemo)(() => {
		const ids = /* @__PURE__ */ new Set();
		(friendshipsQ.data ?? []).forEach((f) => {
			ids.add(f.sender_id);
			ids.add(f.receiver_id);
		});
		(allMembersQ.data ?? []).forEach((m) => {
			ids.add(m.user_id);
		});
		if (user) ids.delete(user.id);
		return Array.from(ids);
	}, [
		friendshipsQ.data,
		allMembersQ.data,
		user
	]);
	const profilesQ = useQuery({
		queryKey: ["profiles", involvedIds],
		enabled: involvedIds.length > 0,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").in("id", involvedIds);
			if (error) throw error;
			const map = {};
			data.forEach((p) => {
				map[p.id] = p;
			});
			return map;
		}
	});
	const blockedIds = (0, import_react.useMemo)(() => new Set((blockedQ.data ?? []).map((b) => b.blocked_id)), [blockedQ.data]);
	const acceptedFriends = (0, import_react.useMemo)(() => {
		const list = friendshipsQ.data ?? [];
		const map = profilesQ.data ?? {};
		return list.filter((f) => f.status === "accepted").map((f) => {
			return map[f.sender_id === user?.id ? f.receiver_id : f.sender_id];
		}).filter(Boolean);
	}, [
		friendshipsQ.data,
		profilesQ.data,
		user
	]);
	const pendingIncoming = (0, import_react.useMemo)(() => {
		const list = friendshipsQ.data ?? [];
		const map = profilesQ.data ?? {};
		return list.filter((f) => f.status === "pending" && f.receiver_id === user?.id).map((f) => ({
			friendship: f,
			profile: map[f.sender_id]
		})).filter((x) => x.profile);
	}, [
		friendshipsQ.data,
		profilesQ.data,
		user
	]);
	const pendingOutgoing = (0, import_react.useMemo)(() => {
		const list = friendshipsQ.data ?? [];
		const map = profilesQ.data ?? {};
		return list.filter((f) => f.status === "pending" && f.sender_id === user?.id).map((f) => ({
			friendship: f,
			profile: map[f.receiver_id]
		})).filter((x) => x.profile);
	}, [
		friendshipsQ.data,
		profilesQ.data,
		user
	]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const msgCh = supabase.channel("rt-messages-" + user.id).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "messages",
			filter: `receiver_id=eq.${user.id}`
		}, () => qc.invalidateQueries({ queryKey: ["messages"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "messages",
			filter: `sender_id=eq.${user.id}`
		}, () => qc.invalidateQueries({ queryKey: ["messages"] })).subscribe();
		const friendCh = supabase.channel("rt-friendships-" + user.id).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "friendships"
		}, () => qc.invalidateQueries({ queryKey: ["friendships"] })).subscribe();
		const groupCh = supabase.channel("rt-groups-" + user.id).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "groups"
		}, () => qc.invalidateQueries({ queryKey: ["groups"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "group_members"
		}, () => {
			qc.invalidateQueries({ queryKey: ["group-members"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "group_messages"
		}, () => qc.invalidateQueries({ queryKey: ["group-messages"] })).subscribe();
		const blockedCh = supabase.channel("rt-blocked-" + user.id).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "blocked_users",
			filter: `blocker_id=eq.${user.id}`
		}, () => qc.invalidateQueries({ queryKey: ["blocked"] })).subscribe();
		const presenceCh = supabase.channel("online-users", { config: { presence: { key: user.id } } });
		presenceCh.on("presence", { event: "sync" }, () => setPresence(new Set(Object.keys(presenceCh.presenceState())))).subscribe(async (s) => {
			if (s === "SUBSCRIBED") await presenceCh.track({ online_at: (/* @__PURE__ */ new Date()).toISOString() });
		});
		return () => {
			supabase.removeChannel(msgCh);
			supabase.removeChannel(friendCh);
			supabase.removeChannel(groupCh);
			supabase.removeChannel(blockedCh);
			supabase.removeChannel(presenceCh);
		};
	}, [user, qc]);
	async function handleSignOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	if (!user) return null;
	const me = profileQ.data;
	const profiles = profilesQ.data ?? {};
	const groups = groupsQ.data ?? [];
	const allMembers = allMembersQ.data ?? [];
	const activeFriend = active?.type === "dm" ? profiles[active.id] ?? null : null;
	const activeGroup = active?.type === "group" ? groups.find((g) => g.id === active.id) ?? null : null;
	function handleSelect(a) {
		setActive(a);
		if (isMobile) setSidebarOpen(false);
	}
	const sidebarContent = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		style: { background: "oklch(0.13 0.015 268)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "px-4 h-14 flex items-center justify-between border-b shrink-0",
				style: { borderColor: "oklch(0.20 0.016 268)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold text-sm tracking-wide text-muted-foreground uppercase",
					children: tab === "chats" ? "Conversations" : tab === "friends" ? "Friends" : "Find people"
				}), tab === "chats" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateGroupDialog, {
					friends: acceptedFriends,
					meId: user.id,
					onCreated: (id) => handleSelect({
						type: "group",
						id
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex border-b shrink-0",
				style: { borderColor: "oklch(0.20 0.016 268)" },
				children: [
					"chats",
					"friends",
					"search"
				].map((t) => {
					const Icon = {
						chats: MessageCircle,
						friends: Users,
						search: Search
					}[t];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setTab(t),
						className: cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium uppercase tracking-wide transition-colors relative", tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
							t,
							t === "friends" && pendingIncoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute top-1.5 right-1/4 h-4 w-4 text-[9px] font-bold grid place-items-center rounded-full text-white",
								style: { background: "oklch(0.62 0.22 25)" },
								children: pendingIncoming.length
							}),
							tab === t && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full",
								style: { background: "var(--gradient-primary)" }
							})
						]
					}, t);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
				className: "flex-1 min-h-0",
				children: [
					tab === "chats" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesTray, {
							meId: user.id,
							meProfile: me ?? null,
							friendIds: acceptedFriends.map((f) => f.id)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-px mx-4 mb-1",
							style: { background: "var(--border)" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatsList, {
							friends: acceptedFriends,
							groups,
							active,
							onSelect: handleSelect,
							presence,
							blockedIds,
							meId: user.id
						})
					] }),
					tab === "friends" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendsList, {
						accepted: acceptedFriends,
						incoming: pendingIncoming,
						outgoing: pendingOutgoing,
						presence,
						onMessage: (id) => {
							handleSelect({
								type: "dm",
								id
							});
							setTab("chats");
						}
					}),
					tab === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchUsers, { meId: user.id })
				]
			}),
			me && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t px-4 py-3 flex items-center gap-3 shrink-0",
				style: { borderColor: "oklch(0.20 0.016 268)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setProfileOpen(true),
						className: "relative shrink-0 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all",
						"aria-label": "Profile settings",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							src: me.avatar_url,
							name: me.username,
							size: "sm"
						}), presence.has(user.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnlineDot, { size: "sm" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs font-semibold truncate",
							style: { color: "oklch(0.80 0.15 280)" },
							children: ["@", me.username]
						}), me.display_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground truncate",
							children: me.display_name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/8",
						onClick: () => setProfileOpen(true),
						"aria-label": "Settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
						onClick: handleSignOut,
						"aria-label": "Sign out",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
					})
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-[100dvh] w-full flex bg-background text-foreground overflow-hidden",
		children: [
			!isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "w-[60px] shrink-0 flex flex-col items-center py-4 gap-2 border-r",
				style: {
					background: "var(--color-sidebar)",
					borderColor: "oklch(0.18 0.016 268)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-9 w-9 place-items-center rounded-2xl mb-2 shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]",
						style: { background: "var(--gradient-primary)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4 text-white" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/feed",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailButton, {
									icon: House,
									active: false,
									onClick: () => {},
									label: "Feed"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailButton, {
								icon: MessageCircle,
								active: true,
								onClick: () => setTab("chats"),
								label: "Chat"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/reels",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailButton, {
									icon: Play,
									active: false,
									onClick: () => {},
									label: "Reels"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-2 pt-2 border-t w-full",
						style: { borderColor: "oklch(0.18 0.016 268)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setProfileOpen(true),
								className: "relative rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all",
								"aria-label": "Profile settings",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
									src: me?.avatar_url,
									name: me?.username ?? "?",
									size: "sm"
								}), presence.has(user.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnlineDot, { size: "sm" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
								onClick: () => setProfileOpen(true),
								"aria-label": "Settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
								onClick: handleSignOut,
								"aria-label": "Sign out",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "w-[260px] xl:w-[300px] shrink-0 flex flex-col border-r overflow-hidden",
				style: {
					background: "oklch(0.13 0.015 268)",
					borderColor: "oklch(0.20 0.016 268)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "px-4 h-14 flex items-center justify-between border-b shrink-0",
						style: { borderColor: "oklch(0.20 0.016 268)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-sm tracking-wide text-muted-foreground uppercase",
							children: tab === "chats" ? "Conversations" : tab === "friends" ? "Friends" : "Find people"
						}), tab === "chats" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateGroupDialog, {
							friends: acceptedFriends,
							meId: user.id,
							onCreated: (id) => setActive({
								type: "group",
								id
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex border-b shrink-0",
						style: { borderColor: "oklch(0.20 0.016 268)" },
						children: [
							"chats",
							"friends",
							"search"
						].map((t) => {
							const Icon = {
								chats: MessageCircle,
								friends: Users,
								search: Search
							}[t];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setTab(t),
								className: cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium uppercase tracking-wide transition-colors relative", tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
									t,
									t === "friends" && pendingIncoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute top-1.5 right-1/4 h-4 w-4 text-[9px] font-bold grid place-items-center rounded-full text-white",
										style: { background: "oklch(0.62 0.22 25)" },
										children: pendingIncoming.length
									}),
									tab === t && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full",
										style: { background: "var(--gradient-primary)" }
									})
								]
							}, t);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
						className: "flex-1 min-h-0",
						children: [
							tab === "chats" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesTray, {
									meId: user.id,
									meProfile: me ?? null,
									friendIds: acceptedFriends.map((f) => f.id)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-px mx-4 mb-1",
									style: { background: "var(--border)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatsList, {
									friends: acceptedFriends,
									groups,
									active,
									onSelect: setActive,
									presence,
									blockedIds,
									meId: user.id
								})
							] }),
							tab === "friends" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendsList, {
								accepted: acceptedFriends,
								incoming: pendingIncoming,
								outgoing: pendingOutgoing,
								presence,
								onMessage: (id) => {
									setActive({
										type: "dm",
										id
									});
									setTab("chats");
								}
							}),
							tab === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchUsers, { meId: user.id })
						]
					}),
					me && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t px-4 py-3 flex items-center gap-2 shrink-0",
						style: { borderColor: "oklch(0.20 0.016 268)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setProfileOpen(true),
								className: "relative shrink-0 rounded-full",
								"aria-label": "Settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
									src: me.avatar_url,
									name: me.username,
									size: "sm"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground flex-1 truncate min-w-0 font-semibold",
								style: { color: "oklch(0.80 0.15 280)" },
								children: ["@", me.username]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground",
								onClick: () => setProfileOpen(true),
								"aria-label": "Settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-3.5 w-3.5" })
							})
						]
					})
				]
			})] }),
			isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: sidebarOpen,
				onOpenChange: setSidebarOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "left",
					className: "p-0 w-[85vw] max-w-[340px] border-r",
					style: { borderColor: "oklch(0.20 0.016 268)" },
					children: sidebarContent
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 min-w-0 flex flex-col",
				style: { background: "oklch(0.12 0.014 268)" },
				children: activeFriend ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWindow, {
					friend: activeFriend,
					meId: user.id,
					online: presence.has(activeFriend.id),
					isBlocked: blockedIds.has(activeFriend.id),
					onChatClosed: () => setActive(null),
					onBack: isMobile ? () => setSidebarOpen(true) : void 0
				}) : activeGroup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupChatWindow, {
					group: activeGroup,
					meId: user.id,
					members: allMembers.filter((m) => m.group_id === activeGroup.id),
					profiles,
					friends: acceptedFriends,
					presence,
					onLeft: () => setActive(null),
					onBack: isMobile ? () => setSidebarOpen(true) : void 0
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					onAdd: () => {
						setTab("search");
						if (isMobile) setSidebarOpen(true);
					},
					isMobile,
					onOpenSidebar: () => setSidebarOpen(true)
				})
			}),
			isMobile && !active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed bottom-0 left-0 right-0 flex border-t z-40 bottom-nav",
				style: {
					background: "var(--color-sidebar)",
					borderColor: "oklch(0.22 0.016 268)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/feed",
						className: "flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium text-muted-foreground hover:text-white transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" }), "Feed"]
					}),
					[
						"chats",
						"friends",
						"search"
					].map((t) => {
						const icons = {
							chats: MessageCircle,
							friends: Users,
							search: Search
						};
						const labels = {
							chats: "Chats",
							friends: "Friends",
							search: "Find"
						};
						const Icon = icons[t];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setTab(t);
								setSidebarOpen(true);
							},
							className: cn("flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors relative", tab === t ? "text-white" : "text-muted-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" }),
								labels[t],
								t === "friends" && pendingIncoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute top-2 left-1/2 ml-2 h-4 w-4 text-[9px] font-bold grid place-items-center rounded-full text-white",
									style: { background: "oklch(0.62 0.22 25)" },
									children: pendingIncoming.length
								})
							]
						}, t);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/reels",
						className: "flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium text-muted-foreground hover:text-white transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-5 w-5" }), "Reels"]
					})
				]
			}),
			me && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSettingsDialog, {
				open: profileOpen,
				onOpenChange: setProfileOpen,
				profile: me,
				userId: user.id,
				onSignOut: handleSignOut
			})
		]
	});
}
function ProfileSettingsDialog({ open, onOpenChange, profile, userId, onSignOut }) {
	const qc = useQueryClient();
	const [displayName, setDisplayName] = (0, import_react.useState)(profile.display_name ?? "");
	const [bio, setBio] = (0, import_react.useState)(profile.bio ?? "");
	const [savingProfile, setSavingProfile] = (0, import_react.useState)(false);
	const [avatarPreview, setAvatarPreview] = (0, import_react.useState)(null);
	const [avatarFile, setAvatarFile] = (0, import_react.useState)(null);
	const [uploadingAvatar, setUploadingAvatar] = (0, import_react.useState)(false);
	const avatarInputRef = (0, import_react.useRef)(null);
	const [newUsername, setNewUsername] = (0, import_react.useState)("");
	const [savingUsername, setSavingUsername] = (0, import_react.useState)(false);
	const usernameStatus = useUsernameCheck(newUsername, profile.username);
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [savingPassword, setSavingPassword] = (0, import_react.useState)(false);
	const [showNewPw, setShowNewPw] = (0, import_react.useState)(false);
	const [deleteConfirm, setDeleteConfirm] = (0, import_react.useState)("");
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setDisplayName(profile.display_name ?? "");
			setBio(profile.bio ?? "");
			setAvatarPreview(null);
			setAvatarFile(null);
			setNewUsername("");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setDeleteConfirm("");
		}
	}, [open, profile]);
	function handleAvatarChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be under 5 MB");
			return;
		}
		setAvatarFile(file);
		setAvatarPreview(URL.createObjectURL(file));
	}
	async function uploadAvatar() {
		if (!avatarFile) return null;
		setUploadingAvatar(true);
		const path = `${userId}/avatar.${avatarFile.name.split(".").pop()}`;
		const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
		setUploadingAvatar(false);
		if (error) {
			toast.error("Avatar upload failed: " + error.message);
			return null;
		}
		const { data } = supabase.storage.from("avatars").getPublicUrl(path);
		return `${data.publicUrl}?t=${Date.now()}`;
	}
	async function saveProfile() {
		setSavingProfile(true);
		let avatarUrl = void 0;
		if (avatarFile) {
			avatarUrl = await uploadAvatar();
			if (avatarUrl === null) {
				setSavingProfile(false);
				return;
			}
		}
		const updates = {
			updated_at: (/* @__PURE__ */ new Date()).toISOString(),
			display_name: displayName.trim() || profile.username,
			bio: bio.trim()
		};
		if (avatarUrl !== void 0) updates.avatar_url = avatarUrl;
		const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
		setSavingProfile(false);
		if (error) toast.error(error.message);
		else {
			toast.success("Profile updated");
			qc.invalidateQueries({ queryKey: ["me"] });
			qc.invalidateQueries({ queryKey: ["profiles"] });
		}
	}
	async function saveUsername() {
		if (!newUsername.trim()) {
			toast.error("Enter a new username");
			return;
		}
		setSavingUsername(true);
		const { error } = await supabase.rpc("change_username", { _new_username: newUsername.trim() });
		setSavingUsername(false);
		if (error) toast.error(error.message);
		else {
			toast.success("Username updated");
			setNewUsername("");
			qc.invalidateQueries({ queryKey: ["me"] });
		}
	}
	async function savePassword() {
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}
		setSavingPassword(true);
		const { data: { user: authUser } } = await supabase.auth.getUser();
		if (!authUser?.email) {
			toast.error("Could not verify identity");
			setSavingPassword(false);
			return;
		}
		const { error: signInErr } = await supabase.auth.signInWithPassword({
			email: authUser.email,
			password: currentPassword
		});
		if (signInErr) {
			toast.error("Current password is incorrect");
			setSavingPassword(false);
			return;
		}
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		setSavingPassword(false);
		if (error) toast.error(error.message);
		else {
			toast.success("Password updated");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		}
	}
	async function deleteAccount() {
		if (deleteConfirm !== profile.username) {
			toast.error("Type your username to confirm");
			return;
		}
		setDeleting(true);
		const { error } = await supabase.rpc("delete_own_account");
		setDeleting(false);
		if (error) toast.error(error.message);
		else onSignOut();
	}
	const currentAvatar = avatarPreview ?? profile.avatar_url ?? void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl w-[calc(100vw-2rem)] max-w-lg p-0 overflow-hidden gap-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-6 pt-6 pb-4 border-b",
				style: { borderColor: "oklch(0.24 0.016 268)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "text-lg font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
						className: "h-5 w-5",
						style: { color: "oklch(0.75 0.18 280)" }
					}), "Profile & Settings"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-xs mt-0.5",
					children: "Manage your account, appearance, and security."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "profile",
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
						className: "w-full rounded-none border-b px-4 h-11 bg-transparent justify-start gap-0",
						style: { borderColor: "oklch(0.24 0.016 268)" },
						children: [
							{
								value: "profile",
								label: "Profile"
							},
							{
								value: "username",
								label: "Username"
							},
							{
								value: "password",
								label: "Password"
							},
							{
								value: "danger",
								label: "Danger"
							}
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: t.value,
							className: cn("rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground", t.value === "danger" && "data-[state=active]:text-destructive data-[state=active]:border-destructive"),
							children: t.label
						}, t.value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "profile",
						className: "px-6 py-5 space-y-5 mt-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/profile",
								onClick: () => onOpenChange(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "w-full gap-2 mb-1 rounded-xl border-primary/30 text-primary hover:bg-primary/10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), " View my profile page"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
											className: "h-20 w-20 ring-2 ring-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: currentAvatar }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
												className: "text-xl font-bold",
												style: {
													background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.3), oklch(0.70 0.18 310 / 0.3))",
													color: "oklch(0.80 0.15 280)"
												},
												children: initials(profile.username)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => avatarInputRef.current?.click(),
											className: "absolute -bottom-1 -right-1 h-7 w-7 rounded-full grid place-items-center border-2 transition-colors",
											style: {
												background: "var(--gradient-primary)",
												borderColor: "var(--color-background)"
											},
											"aria-label": "Change avatar",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-3.5 w-3.5 text-white" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: avatarInputRef,
											type: "file",
											accept: "image/jpeg,image/png,image/webp,image/gif",
											className: "hidden",
											onChange: handleAvatarChange
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-semibold truncate",
											children: ["@", profile.username]
										}),
										profile.display_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm text-muted-foreground truncate",
											children: profile.display_name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => avatarInputRef.current?.click(),
											className: "text-xs mt-1.5 font-medium transition-colors",
											style: { color: "oklch(0.75 0.18 280)" },
											children: uploadingAvatar ? "Uploading…" : "Change photo"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { style: { background: "oklch(0.24 0.016 268)" } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm font-medium",
										children: "Display name"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: displayName,
										onChange: (e) => setDisplayName(e.target.value),
										placeholder: profile.username,
										maxLength: 50,
										className: "rounded-xl"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "This is how your name appears in chats."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm font-medium",
										children: "Bio"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: bio,
										onChange: (e) => setBio(e.target.value),
										placeholder: "Tell people a bit about yourself…",
										maxLength: 160,
										rows: 3,
										className: "rounded-xl resize-none text-sm"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground",
										children: [bio.length, "/160"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: saveProfile,
								disabled: savingProfile || uploadingAvatar,
								className: "w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]",
								style: { background: "var(--gradient-primary)" },
								children: savingProfile || uploadingAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Saving…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Save profile"] })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "username",
						className: "px-6 py-5 space-y-4 mt-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl p-4 space-y-1",
								style: {
									background: "oklch(0.17 0.016 268)",
									border: "1px solid oklch(0.24 0.016 268)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Current username"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-bold text-lg",
									style: { color: "oklch(0.80 0.15 280)" },
									children: ["@", profile.username]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm font-medium",
											children: "New username"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsernameBadge, { status: usernameStatus })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring",
										style: {
											background: "var(--color-input)",
											border: `1px solid ${usernameStatus === "available" ? "oklch(0.76 0.19 152 / 0.6)" : usernameStatus === "taken" ? "oklch(0.62 0.22 25 / 0.6)" : "var(--color-border)"}`
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pl-3 pr-1 text-muted-foreground text-sm font-medium select-none",
											children: "@"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: newUsername,
											onChange: (e) => setNewUsername(e.target.value),
											placeholder: "new_username",
											maxLength: 20,
											className: "border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "3-20 chars: letters, numbers, underscores only."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: saveUsername,
								disabled: savingUsername || !newUsername.trim() || usernameStatus === "taken" || usernameStatus === "checking" || usernameStatus === "invalid" || usernameStatus === "same",
								className: "w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]",
								style: { background: "var(--gradient-primary)" },
								children: savingUsername ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Changing…"] }) : "Change username"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "password",
						className: "px-6 py-5 space-y-4 mt-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-medium",
									children: "Current password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: currentPassword,
									onChange: (e) => setCurrentPassword(e.target.value),
									placeholder: "••••••••",
									autoComplete: "current-password",
									className: "rounded-xl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-medium",
									children: "New password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring",
									style: {
										background: "var(--color-input)",
										border: "1px solid var(--color-border)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: showNewPw ? "text" : "password",
										value: newPassword,
										onChange: (e) => setNewPassword(e.target.value),
										placeholder: "••••••••",
										minLength: 8,
										autoComplete: "new-password",
										className: "border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none flex-1"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowNewPw((v) => !v),
										className: "pr-3 pl-2 text-muted-foreground hover:text-foreground transition-colors",
										tabIndex: -1,
										children: showNewPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											viewBox: "0 0 24 24",
											className: "h-4 w-4 fill-none stroke-current stroke-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												d: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
												strokeLinecap: "round",
												strokeLinejoin: "round"
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
											viewBox: "0 0 24 24",
											className: "h-4 w-4 fill-none stroke-current stroke-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
												cx: "12",
												cy: "12",
												r: "3"
											})]
										})
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-sm font-medium",
									children: "Confirm new password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
									placeholder: "••••••••",
									autoComplete: "new-password",
									className: "rounded-xl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: savePassword,
								disabled: savingPassword || !currentPassword || !newPassword || !confirmPassword,
								className: "w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]",
								style: { background: "var(--gradient-primary)" },
								children: savingPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Updating…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4" }), " Update password"] })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "danger",
						className: "px-6 py-5 space-y-4 mt-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl p-4 space-y-3",
								style: {
									background: "oklch(0.62 0.22 25 / 0.08)",
									border: "1px solid oklch(0.62 0.22 25 / 0.3)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										className: "h-4 w-4 shrink-0",
										style: { color: "oklch(0.62 0.22 25)" }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										style: { color: "oklch(0.62 0.22 25)" },
										children: "Delete account"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground leading-relaxed",
									children: [
										"This permanently deletes your account, all messages, friendships, and group memberships. This action ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: "cannot be undone"
										}),
										"."
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-sm font-medium",
									children: [
										"Type ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: ["@", profile.username]
										}),
										" to confirm"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: deleteConfirm,
									onChange: (e) => setDeleteConfirm(e.target.value),
									placeholder: profile.username,
									className: "rounded-xl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: deleteAccount,
								disabled: deleting || deleteConfirm !== profile.username,
								className: "w-full gap-2 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground",
								children: deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Deleting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Delete my account"] })
							})
						]
					})
				]
			})]
		})
	});
}
function useUsernameCheck(value, currentUsername) {
	const [status, setStatus] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
		const trimmed = value.trim();
		if (!trimmed) {
			setStatus("idle");
			return;
		}
		if (currentUsername && trimmed.toLowerCase() === currentUsername.toLowerCase()) {
			setStatus("same");
			return;
		}
		if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
			setStatus("invalid");
			return;
		}
		setStatus("checking");
		const timer = setTimeout(async () => {
			const { data, error } = await supabase.from("profiles").select("id").ilike("username", trimmed).maybeSingle();
			if (error) {
				setStatus("idle");
				return;
			}
			setStatus(data ? "taken" : "available");
		}, 400);
		return () => clearTimeout(timer);
	}, [value, currentUsername]);
	return status;
}
function UsernameBadge({ status }) {
	if (status === "idle" || status === "same") return null;
	const { label, color, bg } = {
		checking: {
			label: "Checking…",
			color: "oklch(0.70 0.015 268)",
			bg: "oklch(0.22 0.016 268)"
		},
		available: {
			label: "✓ Available",
			color: "oklch(0.76 0.19 152)",
			bg: "oklch(0.20 0.08 152 / 0.3)"
		},
		taken: {
			label: "✗ Taken",
			color: "oklch(0.62 0.22 25)",
			bg: "oklch(0.62 0.22 25 / 0.15)"
		},
		invalid: {
			label: "3-20 chars: a-z, 0-9, _",
			color: "oklch(0.78 0.18 60)",
			bg: "oklch(0.78 0.18 60 / 0.12)"
		}
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium",
		style: {
			color,
			background: bg,
			border: `1px solid ${color}40`
		},
		children: [status === "checking" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-2.5 w-2.5 animate-spin mr-1" }), label]
	});
}
function RailButton({ icon: Icon, active, onClick, label, badge }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		"aria-label": label,
		title: label,
		className: cn("relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200", active ? "text-white shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"),
		style: active ? { background: "var(--gradient-primary)" } : {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-[17px] w-[17px]" }), badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 grid place-items-center rounded-full text-[9px] font-bold text-white",
			style: { background: "oklch(0.62 0.22 25)" },
			children: badge
		}) : null]
	});
}
function SectionLabel({ icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3 w-3" }), label]
	});
}
function ChatsList({ friends, groups, active, onSelect, presence, blockedIds, meId }) {
	const visibleFriends = friends.filter((f) => !blockedIds.has(f.id));
	const dmPreviewQ = useQuery({
		queryKey: [
			"dm-previews",
			meId,
			visibleFriends.map((f) => f.id).join(",")
		],
		enabled: visibleFriends.length > 0,
		refetchInterval: false,
		queryFn: async () => {
			if (visibleFriends.length === 0) return {};
			const friendIds = visibleFriends.map((f) => f.id);
			const { data, error } = await supabase.from("messages").select("*").or(friendIds.map((id) => `and(sender_id.eq.${meId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${meId})`).join(",")).order("created_at", { ascending: false }).limit(200);
			if (error || !data) return {};
			const msgs = data;
			const result = {};
			for (const fId of friendIds) {
				const thread = msgs.filter((m) => m.sender_id === meId && m.receiver_id === fId || m.sender_id === fId && m.receiver_id === meId);
				if (thread.length === 0) continue;
				const unread = thread.filter((m) => m.sender_id === fId && m.receiver_id === meId && !m.read_at).length;
				result[fId] = {
					lastMsg: thread[0],
					unread
				};
			}
			return result;
		}
	});
	const qc = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (!meId || visibleFriends.length === 0) return;
		const ch = supabase.channel(`rt-dm-previews-${meId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "messages",
			filter: `receiver_id=eq.${meId}`
		}, () => qc.invalidateQueries({ queryKey: ["dm-previews"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "messages",
			filter: `sender_id=eq.${meId}`
		}, () => qc.invalidateQueries({ queryKey: ["dm-previews"] })).subscribe();
		return () => {
			supabase.removeChannel(ch).catch(() => {});
		};
	}, [meId, qc]);
	const previews = dmPreviewQ.data ?? {};
	const sortedFriends = [...visibleFriends].sort((a, b) => {
		const pa = previews[a.id];
		const pb = previews[b.id];
		if (!pa && !pb) return 0;
		if (!pa) return 1;
		if (!pb) return -1;
		if (pa.unread > 0 && pb.unread === 0) return -1;
		if (pb.unread > 0 && pa.unread === 0) return 1;
		return new Date(pb.lastMsg.created_at).getTime() - new Date(pa.lastMsg.created_at).getTime();
	});
	if (sortedFriends.length === 0 && groups.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto h-12 w-12 rounded-2xl grid place-items-center mb-4",
			style: {
				background: "oklch(0.65 0.22 280 / 0.1)",
				border: "1px solid oklch(0.65 0.22 280 / 0.2)"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5 text-muted-foreground" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No conversations yet."
		})]
	});
	function previewText(msg) {
		const isMe = msg.sender_id === meId;
		const text = msg.content.length <= 4 && /^\p{Emoji}/u.test(msg.content) ? msg.content : msg.content.slice(0, 40) + (msg.content.length > 40 ? "…" : "");
		return isMe ? `You: ${text}` : text;
	}
	function timeLabel(iso) {
		const d = new Date(iso);
		const diffMs = (/* @__PURE__ */ new Date()).getTime() - d.getTime();
		const diffMin = Math.floor(diffMs / 6e4);
		if (diffMin < 1) return "now";
		if (diffMin < 60) return `${diffMin}m`;
		const diffH = Math.floor(diffMin / 60);
		if (diffH < 24) return `${diffH}h`;
		if (diffH < 48) return "Yesterday";
		return d.toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 space-y-5",
		children: [groups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
			icon: UsersRound,
			label: "Groups"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-0.5 mt-1",
			children: groups.map((g) => {
				const isActive = active?.type === "group" && active.id === g.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => onSelect({
						type: "group",
						id: g.id
					}),
					className: cn("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150", isActive ? "text-white" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"),
					style: isActive ? {
						background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.2), oklch(0.70 0.18 310 / 0.15))",
						border: "1px solid oklch(0.65 0.22 280 / 0.25)"
					} : { border: "1px solid transparent" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-xl grid place-items-center shrink-0",
						style: {
							background: "oklch(0.65 0.22 280 / 0.15)",
							border: "1px solid oklch(0.65 0.22 280 / 0.2)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, {
							className: "h-4 w-4",
							style: { color: "oklch(0.75 0.18 280)" }
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate font-medium text-sm",
							children: g.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-xs text-muted-foreground",
							children: "Group chat"
						})]
					})]
				}) }, g.id);
			})
		})] }), sortedFriends.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
			icon: Hash,
			label: "Direct messages"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-0.5 mt-1",
			children: sortedFriends.map((f) => {
				const isActive = active?.type === "dm" && active.id === f.id;
				const online = presence.has(f.id);
				const preview = previews[f.id];
				const unread = preview?.unread ?? 0;
				const hasUnread = unread > 0 && !isActive;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => onSelect({
						type: "dm",
						id: f.id
					}),
					className: cn("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150", isActive ? "text-white" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"),
					style: isActive ? {
						background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.2), oklch(0.70 0.18 310 / 0.15))",
						border: "1px solid oklch(0.65 0.22 280 / 0.25)"
					} : { border: "1px solid transparent" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							src: f.avatar_url,
							name: f.username
						}), online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnlineDot, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("truncate text-sm", hasUnread ? "font-semibold text-foreground" : "font-medium"),
								children: f.display_name || f.username
							}), preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[10px] shrink-0", hasUnread ? "text-primary font-semibold" : "text-muted-foreground"),
								children: timeLabel(preview.lastMsg.created_at)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-1 mt-0.5",
							children: [preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("truncate text-xs", hasUnread ? "text-foreground/80" : "text-muted-foreground"),
								children: previewText(preview.lastMsg)
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: ["@", f.username]
							}), hasUnread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold text-white grid place-items-center",
								style: { background: "var(--gradient-primary)" },
								children: unread > 99 ? "99+" : unread
							})]
						})]
					})]
				}) }, f.id);
			})
		})] })]
	});
}
function CreateGroupDialog({ friends, meId, onCreated }) {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [busy, setBusy] = (0, import_react.useState)(false);
	function toggle(id) {
		setPicked((s) => {
			const n = new Set(s);
			if (n.has(id)) n.delete(id);
			else n.add(id);
			return n;
		});
	}
	async function submit() {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error("Group name is required");
			return;
		}
		setBusy(true);
		const { data: g, error } = await supabase.rpc("create_group", {
			_name: trimmed,
			_description: desc.trim() || void 0
		});
		if (error || !g) {
			setBusy(false);
			toast.error(error?.message ?? "Could not create group");
			return;
		}
		if (picked.size > 0) {
			const rows = Array.from(picked).map((uid) => ({
				group_id: g.id,
				user_id: uid,
				role: "member"
			}));
			const { error: mErr } = await supabase.from("group_members").insert(rows);
			if (mErr) toast.error("Group created, but adding members failed: " + mErr.message);
		}
		setBusy(false);
		setOpen(false);
		setName("");
		setDesc("");
		setPicked(/* @__PURE__ */ new Set());
		toast.success("Group created");
		qc.invalidateQueries({ queryKey: ["groups"] });
		qc.invalidateQueries({ queryKey: ["group-members"] });
		onCreated(g.id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "icon",
				variant: "ghost",
				className: "h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground",
				"aria-label": "New group",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl w-[calc(100vw-2rem)] max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New group" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a group and add friends." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								maxLength: 80,
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "Weekend plans",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								maxLength: 200,
								value: desc,
								onChange: (e) => setDesc(e.target.value),
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
								"Add friends (",
								picked.size,
								")"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border",
								children: [friends.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground p-3",
									children: "No friends yet."
								}), friends.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: picked.has(f.id),
											onCheckedChange: () => toggle(f.id)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
											src: f.avatar_url,
											name: f.username,
											size: "sm"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate font-medium",
												children: f.display_name || f.username
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "truncate text-xs text-muted-foreground",
												children: ["@", f.username]
											})]
										})
									]
								}, f.id))]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setOpen(false),
						disabled: busy,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						disabled: busy || !name.trim(),
						style: { background: "var(--gradient-primary)" },
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Create group"
					})]
				})
			]
		})]
	});
}
function FriendsList({ accepted, incoming, outgoing, presence, onMessage }) {
	const qc = useQueryClient();
	async function respond(id, status) {
		const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
		if (error) toast.error(error.message);
		else {
			toast.success(status === "accepted" ? "Friend added" : "Declined");
			qc.invalidateQueries({ queryKey: ["friendships"] });
		}
	}
	async function cancel(id) {
		const { error } = await supabase.from("friendships").delete().eq("id", id);
		if (error) toast.error(error.message);
		else qc.invalidateQueries({ queryKey: ["friendships"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 space-y-5",
		children: [
			incoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
				icon: Inbox,
				label: `Incoming (${incoming.length})`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5 mt-1",
				children: incoming.map(({ friendship, profile }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FriendRow, {
					profile,
					online: presence.has(profile.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-8 w-8 rounded-lg hover:bg-green-500/10",
						style: { color: "var(--color-online)" },
						onClick: () => respond(friendship.id, "accepted"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
						onClick: () => respond(friendship.id, "rejected"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}, friendship.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
				icon: Users,
				label: `Friends (${accepted.length})`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5 mt-1",
				children: accepted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground px-3 py-2",
					children: "No friends yet."
				}) : accepted.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendRow, {
					profile: p,
					online: presence.has(p.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-8 rounded-lg text-xs",
						onClick: () => onMessage(p.id),
						children: "Message"
					})
				}, p.id))
			})] }),
			outgoing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
				icon: UserPlus,
				label: `Sent (${outgoing.length})`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5 mt-1",
				children: outgoing.map(({ friendship, profile }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendRow, {
					profile,
					online: presence.has(profile.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-8 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10",
						onClick: () => cancel(friendship.id),
						children: "Cancel"
					})
				}, friendship.id))
			})] })
		]
	});
}
function FriendRow({ profile, online, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
					src: profile.avatar_url,
					name: profile.username
				}), online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnlineDot, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate text-sm font-medium",
					children: profile.display_name || profile.username
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "truncate text-xs text-muted-foreground",
					children: ["@", profile.username]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1 shrink-0",
				children
			})
		]
	});
}
function SearchUsers({ meId }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const qc = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (q.trim().length < 2) {
			setResults([]);
			return;
		}
		let cancelled = false;
		setLoading(true);
		const t = setTimeout(async () => {
			const { data, error } = await supabase.from("profiles").select("*").or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).neq("id", meId).limit(20);
			if (cancelled) return;
			if (error) toast.error(error.message);
			setResults(data ?? []);
			setLoading(false);
		}, 250);
		return () => {
			cancelled = true;
			clearTimeout(t);
		};
	}, [q, meId]);
	async function addFriend(receiverId) {
		const { error } = await supabase.from("friendships").insert({
			sender_id: meId,
			receiver_id: receiverId
		});
		if (error) if (error.code === "23505") toast.error("Request already exists.");
		else toast.error(error.message);
		else {
			toast.success("Request sent");
			qc.invalidateQueries({ queryKey: ["friendships"] });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search @username…",
					value: q,
					onChange: (e) => setQ(e.target.value),
					className: "pl-9 rounded-xl"
				})]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs text-muted-foreground px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }), " Searching…"]
			}),
			!loading && q.length >= 2 && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground px-1",
				children: "No matches."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: results.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FriendRow, {
					profile: p,
					online: false,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-8 rounded-lg text-xs gap-1.5",
						onClick: () => addFriend(p.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " Add"]
					})
				}, p.id))
			})
		]
	});
}
function EmptyState({ onAdd, isMobile, onOpenSidebar }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex-1 grid place-items-center text-center p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-xs",
			children: [
				isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "mb-6 gap-2 text-muted-foreground",
					onClick: onOpenSidebar,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" }), " Open conversations"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-14 w-14 rounded-3xl grid place-items-center mb-5 shadow-[0_8px_32px_-8px_oklch(0.65_0.22_280/0.4)]",
					style: { background: "var(--gradient-primary)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-7 w-7 text-white" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-bold mb-2",
					children: "No conversation open"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mb-6 leading-relaxed",
					children: "Select a chat or find someone new by @username."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onAdd,
					className: "gap-2 shadow-[var(--shadow-glow)]",
					style: { background: "var(--gradient-primary)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Find people"]
				})
			]
		})
	});
}
function StickerPicker({ onPick, onClose }) {
	const [cat, setCat] = (0, import_react.useState)(0);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		function handler(e) {
			if (ref.current && !ref.current.contains(e.target)) onClose();
		}
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [onClose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "absolute bottom-full left-0 mb-2 z-50 rounded-2xl overflow-hidden shadow-[0_8px_40px_-8px_oklch(0_0_0/0.7)] w-[min(320px,90vw)]",
		style: {
			background: "oklch(0.16 0.016 268)",
			border: "1px solid oklch(0.26 0.018 268)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex border-b overflow-x-auto",
			style: { borderColor: "oklch(0.24 0.016 268)" },
			children: STICKER_CATEGORIES.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setCat(i),
				className: cn("px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0", cat === i ? "text-white border-b-2" : "text-muted-foreground hover:text-foreground"),
				style: cat === i ? { borderColor: "oklch(0.65 0.22 280)" } : {},
				children: c.label
			}, c.label))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-8 gap-0.5 p-3 max-h-[180px] overflow-y-auto",
			children: STICKER_CATEGORIES[cat].stickers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => {
					onPick(s);
					onClose();
				},
				className: "text-2xl h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 transition-colors",
				children: s
			}, s))
		})]
	});
}
function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, confirmVariant = "destructive", onConfirm, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl w-[calc(100vw-2rem)] max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: description })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					disabled: loading,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onConfirm,
					disabled: loading,
					className: confirmVariant === "destructive" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "",
					style: confirmVariant !== "destructive" ? { background: "var(--gradient-primary)" } : {},
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : confirmLabel
				})]
			})]
		})
	});
}
function ChatHeader({ children, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "h-14 px-3 sm:px-5 flex items-center gap-2 sm:gap-3 shrink-0 border-b",
		style: {
			borderColor: "oklch(0.20 0.016 268)",
			background: "oklch(0.13 0.015 268)"
		},
		children: [onBack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "icon",
			variant: "ghost",
			className: "h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground",
			onClick: onBack,
			"aria-label": "Back",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
		}), children]
	});
}
function MessageList({ scrollRef, loading, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: scrollRef,
		className: "flex-1 overflow-y-auto px-3 sm:px-5 py-4 min-h-0",
		children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Loading…"]
		}) : children
	});
}
function ChatInputBar({ value, onChange, onSend, placeholder, sending, onStickerPick, showStickers, onToggleStickers }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			onSend();
		},
		className: "px-3 sm:px-4 py-3 flex items-center gap-2 shrink-0 border-t relative",
		style: {
			borderColor: "oklch(0.20 0.016 268)",
			background: "oklch(0.13 0.015 268)"
		},
		children: [
			showStickers && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickerPicker, {
				onPick: onStickerPick,
				onClose: onToggleStickers
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "ghost",
				onClick: onToggleStickers,
				className: cn("h-10 w-10 rounded-xl shrink-0 transition-all", showStickers ? "text-white" : "text-muted-foreground hover:text-foreground"),
				style: showStickers ? { background: "var(--gradient-primary)" } : {},
				"aria-label": "Stickers",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder,
				maxLength: 4e3,
				className: "h-10 rounded-xl flex-1 text-sm",
				autoFocus: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "icon",
				className: "h-10 w-10 rounded-xl shrink-0 shadow-[var(--shadow-glow)] transition-all hover:scale-105 active:scale-95",
				style: { background: "var(--gradient-primary)" },
				disabled: sending || !value.trim(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
			})
		]
	});
}
function ReadTick({ readAt }) {
	if (readAt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center shrink-0",
		title: "Seen",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: "18",
			height: "11",
			viewBox: "0 0 18 11",
			fill: "none",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M1 5.5l3.5 3.5L11 2",
				stroke: "oklch(0.65 0.20 230)",
				strokeWidth: "1.9",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M6 5.5l3.5 3.5L16 2",
				stroke: "oklch(0.65 0.20 230)",
				strokeWidth: "1.9",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center shrink-0",
		title: "Delivered",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			width: "11",
			height: "11",
			viewBox: "0 0 11 11",
			fill: "none",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M1 5.5l3.5 3.5L10 2",
				stroke: "oklch(0.75 0 0 / 0.50)",
				strokeWidth: "1.9",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		})
	});
}
function MessageBubble({ content, mine, grouped, senderName, onDelete, readAt, isLast }) {
	const isSticker = content.length <= 4 && /^\p{Emoji}/u.test(content);
	const showTick = mine && readAt !== void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("flex flex-col", mine ? "items-end" : "items-start"),
		children: [senderName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-muted-foreground ml-3 mb-0.5 font-medium",
			children: senderName
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("group flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%]", mine ? "flex-row-reverse" : "flex-row"),
			children: [onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onDelete,
				className: "shrink-0 h-6 w-6 rounded-lg grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/15 text-muted-foreground hover:text-destructive",
				title: "Delete",
				"aria-label": "Delete message",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { className: "h-3.5 w-3.5" })
			}), isSticker ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex flex-col", mine ? "items-end" : "items-start"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-4xl leading-none select-none",
					children: content
				}), showTick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 mr-0.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadTick, { readAt })
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm whitespace-pre-wrap break-words leading-relaxed", mine ? "text-white" : "text-foreground"),
				style: {
					background: mine ? "var(--gradient-primary)" : "oklch(0.18 0.016 268)",
					borderRadius: mine ? grouped ? "18px 6px 18px 18px" : "18px 6px 6px 18px" : grouped ? "6px 18px 18px 18px" : "6px 18px 18px 18px",
					border: mine ? "none" : "1px solid oklch(0.25 0.016 268)",
					boxShadow: mine ? "0 4px 16px -4px oklch(0.65 0.22 280 / 0.4)" : "0 2px 8px -2px oklch(0 0 0 / 0.3)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: content }), showTick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex items-end ml-1.5 -mb-0.5 align-bottom opacity-90",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadTick, { readAt })
				})]
			})]
		})]
	});
}
function ChatWindow({ friend, meId, online, isBlocked, onChatClosed, onBack }) {
	const qc = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [showStickers, setShowStickers] = (0, import_react.useState)(false);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [confirmBlock, setConfirmBlock] = (0, import_react.useState)(false);
	const [confirmUnblock, setConfirmUnblock] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const [actionLoading, setActionLoading] = (0, import_react.useState)(false);
	const scrollRef = (0, import_react.useRef)(null);
	const [atBottom, setAtBottom] = (0, import_react.useState)(true);
	const atBottomRef = (0, import_react.useRef)(true);
	const [newMsgCount, setNewMsgCount] = (0, import_react.useState)(0);
	const prevMsgCount = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		setAtBottom(true);
		atBottomRef.current = true;
		setNewMsgCount(0);
		prevMsgCount.current = 0;
	}, [friend.id]);
	const msgsQ = useQuery({
		queryKey: [
			"messages",
			meId,
			friend.id
		],
		queryFn: async () => {
			const { data, error } = await supabase.from("messages").select("*").or(`and(sender_id.eq.${meId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${meId})`).order("created_at", { ascending: true }).limit(200);
			if (error) throw error;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		if (!msgsQ.data) return;
		const el = scrollRef.current;
		if (!el) return;
		const total = msgsQ.data.length;
		if (prevMsgCount.current === 0) {
			el.scrollTop = el.scrollHeight;
			prevMsgCount.current = total;
			return;
		}
		const added = total - prevMsgCount.current;
		prevMsgCount.current = total;
		if (added <= 0) return;
		const isMine = msgsQ.data[msgsQ.data.length - 1]?.sender_id === meId;
		if (atBottomRef.current || isMine) {
			el.scrollTop = el.scrollHeight;
			setNewMsgCount(0);
		} else {
			const newIncoming = msgsQ.data.slice(-added).filter((m) => m.sender_id === friend.id).length;
			if (newIncoming > 0) setNewMsgCount((n) => n + newIncoming);
		}
	}, [
		msgsQ.data,
		friend.id,
		meId
	]);
	(0, import_react.useEffect)(() => {
		const el = scrollRef.current;
		if (!el) return;
		function onScroll() {
			const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
			atBottomRef.current = bottom;
			setAtBottom(bottom);
			if (bottom) setNewMsgCount(0);
		}
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);
	function scrollToBottom() {
		if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		setNewMsgCount(0);
	}
	(0, import_react.useEffect)(() => {
		const unread = (msgsQ.data ?? []).filter((m) => m.receiver_id === meId && !m.read_at);
		if (unread.length === 0) return;
		supabase.from("messages").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", unread.map((m) => m.id)).then(() => {});
	}, [msgsQ.data, meId]);
	async function send(content) {
		const msg = (content ?? text).trim();
		if (!msg || sending || isBlocked) return;
		setSending(true);
		if (!content) setText("");
		const { error } = await supabase.from("messages").insert({
			sender_id: meId,
			receiver_id: friend.id,
			content: msg
		});
		setSending(false);
		if (error) {
			toast.error(error.message);
			if (!content) setText(msg);
		} else qc.invalidateQueries({ queryKey: [
			"messages",
			meId,
			friend.id
		] });
	}
	async function deleteMessage(id) {
		const { error } = await supabase.from("messages").delete().eq("id", id);
		if (error) toast.error(error.message);
		else qc.invalidateQueries({ queryKey: [
			"messages",
			meId,
			friend.id
		] });
	}
	async function doClearChat() {
		setActionLoading(true);
		const { error } = await supabase.rpc("clear_dm_chat", { _other_user: friend.id });
		setActionLoading(false);
		if (error) toast.error(error.message);
		else {
			toast.success("Chat cleared");
			setConfirmClear(false);
			qc.invalidateQueries({ queryKey: [
				"messages",
				meId,
				friend.id
			] });
		}
	}
	async function doBlock() {
		setActionLoading(true);
		const { error } = await supabase.rpc("block_user", { _target: friend.id });
		setActionLoading(false);
		if (error) toast.error(error.message);
		else {
			toast.success(`@${friend.username} blocked`);
			setConfirmBlock(false);
			qc.invalidateQueries({ queryKey: ["blocked"] });
			qc.invalidateQueries({ queryKey: ["friendships"] });
			onChatClosed();
		}
	}
	async function doUnblock() {
		setActionLoading(true);
		const { error } = await supabase.rpc("unblock_user", { _target: friend.id });
		setActionLoading(false);
		if (error) toast.error(error.message);
		else {
			toast.success(`@${friend.username} unblocked`);
			setConfirmUnblock(false);
			qc.invalidateQueries({ queryKey: ["blocked"] });
		}
	}
	async function doDeleteChat() {
		setActionLoading(true);
		const { error: clrErr } = await supabase.rpc("clear_dm_chat", { _other_user: friend.id });
		const { error: fErr } = await supabase.from("friendships").delete().or(`and(sender_id.eq.${meId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${meId})`);
		setActionLoading(false);
		if (clrErr || fErr) toast.error(clrErr?.message ?? fErr?.message ?? "Error");
		else {
			toast.success("Chat deleted");
			setConfirmDelete(false);
			qc.invalidateQueries({ queryKey: ["friendships"] });
			qc.invalidateQueries({ queryKey: ["messages"] });
			onChatClosed();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex flex-col flex-1 min-h-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChatHeader, {
				onBack,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							src: friend.avatar_url,
							name: friend.username
						}), online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnlineDot, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold leading-tight truncate",
							children: friend.display_name || friend.username
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "truncate",
									children: ["@", friend.username]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline text-muted-foreground/40",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hidden sm:flex items-center gap-1",
									style: { color: online ? "var(--color-online)" : void 0 },
									children: [online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-1.5 w-1.5 rounded-full",
										style: { background: "var(--color-online)" }
									}), online ? "online" : "offline"]
								}),
								isBlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive text-[10px] font-semibold uppercase",
									children: "blocked"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							className: "h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-48 rounded-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setConfirmClear(true),
								className: "gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "h-4 w-4" }), " Clear chat"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setConfirmDelete(true),
								className: "gap-2 cursor-pointer text-destructive focus:text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { className: "h-4 w-4" }), " Delete chat"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							isBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setConfirmUnblock(true),
								className: "gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4" }), " Unblock"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setConfirmBlock(true),
								className: "gap-2 cursor-pointer text-destructive focus:text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4" }), " Block"]
							})
						]
					})] })
				]
			}),
			newMsgCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: scrollToBottom,
				className: "absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2",
				style: {
					background: "var(--gradient-primary)",
					boxShadow: "0 4px 20px -4px oklch(0.65 0.22 280 / 0.6)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						width: "12",
						height: "12",
						viewBox: "0 0 12 12",
						fill: "none",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M6 2v8M2 7l4 4 4-4",
							stroke: "white",
							strokeWidth: "1.8",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					}),
					newMsgCount,
					" new message",
					newMsgCount > 1 ? "s" : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageList, {
				scrollRef,
				loading: msgsQ.isLoading,
				children: (msgsQ.data ?? []).length === 0 && !msgsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full grid place-items-center text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto h-12 w-12 rounded-2xl grid place-items-center mb-4",
							style: {
								background: "oklch(0.65 0.22 280 / 0.1)",
								border: "1px solid oklch(0.65 0.22 280 / 0.2)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
								className: "h-5 w-5",
								style: { color: "oklch(0.75 0.18 280)" }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Start of your chat with @",
								friend.username,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: "Say hi 👋"
						})
					] })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: (msgsQ.data ?? []).map((m, i, arr) => {
						const mine = m.sender_id === meId;
						const prev = arr[i - 1];
						const grouped = !!(prev && prev.sender_id === m.sender_id && new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 6e4);
						const isLast = mine && !arr.slice(i + 1).some((nm) => nm.sender_id === meId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
							content: m.content,
							mine,
							grouped,
							readAt: mine ? m.read_at : void 0,
							isLast,
							onDelete: mine ? () => deleteMessage(m.id) : void 0
						}, m.id);
					})
				})
			}),
			isBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-4 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground",
				style: {
					borderColor: "oklch(0.20 0.016 268)",
					background: "oklch(0.13 0.015 268)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4" }),
					" You've blocked this user.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setConfirmUnblock(true),
						className: "text-primary hover:underline ml-1",
						children: "Unblock"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatInputBar, {
				value: text,
				onChange: setText,
				onSend: () => send(),
				placeholder: `Message @${friend.username}`,
				sending,
				onStickerPick: (s) => send(s),
				showStickers,
				onToggleStickers: () => setShowStickers((v) => !v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmClear,
				onOpenChange: setConfirmClear,
				title: "Clear chat",
				description: `Permanently delete all messages with @${friend.username}?`,
				confirmLabel: "Clear chat",
				onConfirm: doClearChat,
				loading: actionLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmDelete,
				onOpenChange: setConfirmDelete,
				title: "Delete chat",
				description: `Delete all messages and remove @${friend.username} from friends?`,
				confirmLabel: "Delete chat",
				onConfirm: doDeleteChat,
				loading: actionLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmBlock,
				onOpenChange: setConfirmBlock,
				title: `Block @${friend.username}?`,
				description: "They'll be removed from your friends.",
				confirmLabel: "Block",
				onConfirm: doBlock,
				loading: actionLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmUnblock,
				onOpenChange: setConfirmUnblock,
				title: `Unblock @${friend.username}?`,
				description: "You'll need to re-add them as a friend to chat.",
				confirmLabel: "Unblock",
				confirmVariant: "default",
				onConfirm: doUnblock,
				loading: actionLoading
			})
		]
	});
}
function GroupChatWindow({ group, meId, members, profiles, friends, presence, onLeft, onBack }) {
	const qc = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [showStickers, setShowStickers] = (0, import_react.useState)(false);
	const [infoOpen, setInfoOpen] = (0, import_react.useState)(false);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [actionLoading, setActionLoading] = (0, import_react.useState)(false);
	const scrollRef = (0, import_react.useRef)(null);
	const isAdmin = members.find((m) => m.user_id === meId)?.role === "admin";
	const onlineCount = members.filter((m) => presence.has(m.user_id)).length;
	const msgsQ = useQuery({
		queryKey: ["group-messages", group.id],
		queryFn: async () => {
			const { data, error } = await supabase.from("group_messages").select("*").eq("group_id", group.id).order("created_at", { ascending: true }).limit(200);
			if (error) throw error;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [msgsQ.data]);
	async function send(content) {
		const msg = (content ?? text).trim();
		if (!msg || sending) return;
		setSending(true);
		if (!content) setText("");
		const { error } = await supabase.from("group_messages").insert({
			group_id: group.id,
			sender_id: meId,
			content: msg
		});
		setSending(false);
		if (error) {
			toast.error(error.message);
			if (!content) setText(msg);
		} else qc.invalidateQueries({ queryKey: ["group-messages", group.id] });
	}
	async function deleteMessage(id) {
		const { error } = await supabase.from("group_messages").delete().eq("id", id);
		if (error) toast.error(error.message);
		else qc.invalidateQueries({ queryKey: ["group-messages", group.id] });
	}
	async function doClearGroupChat() {
		setActionLoading(true);
		const { error } = await supabase.rpc("clear_group_chat", { _group_id: group.id });
		setActionLoading(false);
		if (error) toast.error(error.message);
		else {
			toast.success("Chat cleared");
			setConfirmClear(false);
			qc.invalidateQueries({ queryKey: ["group-messages", group.id] });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChatHeader, {
			onBack,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-9 w-9 rounded-xl grid place-items-center shrink-0",
					style: {
						background: "oklch(0.65 0.22 280 / 0.15)",
						border: "1px solid oklch(0.65 0.22 280 / 0.25)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, {
						className: "h-4 w-4",
						style: { color: "oklch(0.75 0.18 280)" }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold leading-tight truncate",
						children: group.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							members.length,
							" members · ",
							onlineCount,
							" online"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					className: "w-48 rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: () => setInfoOpen(true),
						className: "gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4" }), " Group info"]
					}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: () => setConfirmClear(true),
						className: "gap-2 cursor-pointer text-destructive focus:text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "h-4 w-4" }), " Clear messages"]
					})]
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageList, {
			scrollRef,
			loading: msgsQ.isLoading,
			children: (msgsQ.data ?? []).length === 0 && !msgsQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full grid place-items-center text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-12 w-12 rounded-2xl grid place-items-center mb-4",
					style: {
						background: "oklch(0.65 0.22 280 / 0.1)",
						border: "1px solid oklch(0.65 0.22 280 / 0.2)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, {
						className: "h-5 w-5",
						style: { color: "oklch(0.75 0.18 280)" }
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Welcome to ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground font-medium",
							children: group.name
						}),
						" 👋"
					]
				})] })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: (msgsQ.data ?? []).map((m, i, arr) => {
					const mine = m.sender_id === meId;
					const sender = profiles[m.sender_id];
					const prev = arr[i - 1];
					const grouped = !!(prev && prev.sender_id === m.sender_id && new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 6e4);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
						content: m.content,
						mine,
						grouped,
						senderName: !mine && !grouped ? sender?.display_name || sender?.username || "Member" : void 0,
						onDelete: mine ? () => deleteMessage(m.id) : void 0
					}, m.id);
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatInputBar, {
			value: text,
			onChange: setText,
			onSend: () => send(),
			placeholder: `Message ${group.name}`,
			sending,
			onStickerPick: (s) => send(s),
			showStickers,
			onToggleStickers: () => setShowStickers((v) => !v)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupInfoDialog, {
			open: infoOpen,
			onOpenChange: setInfoOpen,
			group,
			meId,
			isAdmin,
			memberProfiles: members.map((m) => ({
				member: m,
				profile: m.user_id === meId ? null : profiles[m.user_id]
			})),
			friends,
			presence,
			onLeft: () => {
				setInfoOpen(false);
				onLeft();
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			open: confirmClear,
			onOpenChange: setConfirmClear,
			title: "Clear group chat",
			description: "Delete all messages in this group for everyone? Admins only.",
			confirmLabel: "Clear",
			onConfirm: doClearGroupChat,
			loading: actionLoading
		})
	] });
}
function GroupInfoDialog({ open, onOpenChange, group, meId, isAdmin, memberProfiles, friends, presence, onLeft }) {
	const qc = useQueryClient();
	const memberIds = new Set(memberProfiles.map((m) => m.member.user_id));
	const addable = friends.filter((f) => !memberIds.has(f.id));
	const [editingName, setEditingName] = (0, import_react.useState)(false);
	const [nameDraft, setNameDraft] = (0, import_react.useState)(group.name);
	const [savingName, setSavingName] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setNameDraft(group.name);
		setEditingName(false);
	}, [
		group.id,
		group.name,
		open
	]);
	async function saveName() {
		const next = nameDraft.trim();
		if (!next || next === group.name) {
			setEditingName(false);
			return;
		}
		setSavingName(true);
		const { error } = await supabase.from("groups").update({
			name: next,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", group.id);
		setSavingName(false);
		if (error) toast.error(error.message);
		else {
			toast.success("Renamed");
			setEditingName(false);
			qc.invalidateQueries({ queryKey: ["groups"] });
		}
	}
	async function setRole(uid, role) {
		const { error } = await supabase.from("group_members").update({ role }).eq("group_id", group.id).eq("user_id", uid);
		if (error) toast.error(error.message);
		else {
			toast.success(role === "admin" ? "Promoted" : "Demoted");
			qc.invalidateQueries({ queryKey: ["group-members"] });
		}
	}
	async function addMember(uid) {
		const { error } = await supabase.from("group_members").insert({
			group_id: group.id,
			user_id: uid,
			role: "member"
		});
		if (error) toast.error(error.message);
		else {
			toast.success("Added");
			qc.invalidateQueries({ queryKey: ["group-members"] });
		}
	}
	async function removeMember(uid) {
		const { error } = await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", uid);
		if (error) toast.error(error.message);
		else qc.invalidateQueries({ queryKey: ["group-members"] });
	}
	async function leave() {
		const { error } = await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", meId);
		if (error) toast.error(error.message);
		else {
			toast.success("Left group");
			qc.invalidateQueries({ queryKey: ["group-members"] });
			qc.invalidateQueries({ queryKey: ["groups"] });
			onLeft();
		}
	}
	async function deleteGroup() {
		if (!confirm(`Delete "${group.name}"?`)) return;
		const { error } = await supabase.from("groups").delete().eq("id", group.id);
		if (error) toast.error(error.message);
		else {
			toast.success("Deleted");
			qc.invalidateQueries({ queryKey: ["groups"] });
			onLeft();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl w-[calc(100vw-2rem)] max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
					editingName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: nameDraft,
								onChange: (e) => setNameDraft(e.target.value),
								maxLength: 80,
								autoFocus: true,
								className: "rounded-xl",
								onKeyDown: (e) => {
									if (e.key === "Enter") saveName();
									if (e.key === "Escape") {
										setEditingName(false);
										setNameDraft(group.name);
									}
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: saveName,
								disabled: savingName,
								style: { background: "var(--gradient-primary)" },
								children: "Save"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									setEditingName(false);
									setNameDraft(group.name);
								},
								children: "Cancel"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "flex-1",
							children: group.name
						}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							className: "h-7 w-7 rounded-lg",
							onClick: () => setEditingName(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						})]
					}),
					group.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: group.description }),
					!isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs",
						children: "Only admins can manage this group."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2",
						children: [
							"Members (",
							memberProfiles.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border",
						children: memberProfiles.map(({ member, profile }) => {
							const isMe = member.user_id === meId;
							const name = isMe ? "You" : profile?.display_name || profile?.username || "Member";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 px-3 py-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
											src: profile?.avatar_url,
											name: profile?.username ?? "me",
											size: "sm"
										}), presence.has(member.user_id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnlineDot, { size: "sm" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "truncate text-sm font-medium flex items-center gap-2",
											children: [name, member.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
												style: {
													background: "oklch(0.65 0.22 280 / 0.15)",
													color: "oklch(0.78 0.18 280)",
													border: "1px solid oklch(0.65 0.22 280 / 0.25)"
												},
												children: "Admin"
											})]
										}), !isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "truncate text-xs text-muted-foreground",
											children: ["@", profile?.username]
										})]
									}),
									isAdmin && !isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [member.role === "member" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "h-8 w-8 rounded-lg",
										title: "Promote",
										onClick: () => setRole(member.user_id, "admin"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" })
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "h-8 w-8 rounded-lg",
										title: "Demote",
										onClick: () => setRole(member.user_id, "member"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "ghost",
										className: "h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10",
										onClick: () => removeMember(member.user_id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})] })
								]
							}, member.user_id);
						})
					})] }), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2",
						children: "Add friends"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-36 overflow-y-auto rounded-xl border border-border divide-y divide-border",
						children: addable.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground p-3",
							children: "No more friends to add."
						}) : addable.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
									src: f.avatar_url,
									name: f.username,
									size: "sm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate font-medium",
										children: f.display_name || f.username
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "truncate text-xs text-muted-foreground",
										children: ["@", f.username]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "rounded-lg text-xs gap-1.5",
									onClick: () => addMember(f.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " Add"]
								})
							]
						}, f.id))
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "flex sm:justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						className: "text-destructive hover:bg-destructive/10 gap-1.5",
						onClick: deleteGroup,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Delete group"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						className: "gap-1.5 text-muted-foreground hover:text-foreground",
						onClick: leave,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Leave"]
					})]
				})
			]
		})
	});
}
//#endregion
export { ChatApp as component };
