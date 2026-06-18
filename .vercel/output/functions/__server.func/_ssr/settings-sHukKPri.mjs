import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, r as useAuth } from "./utils-DsLFkheH.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { t as Label } from "./label-CsVfh20r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as Phone, G as LoaderCircle, K as Languages, L as Moon, M as PenLine, R as MessageSquare, V as Mail, Z as Heart, _ as Sun, _t as Bell, et as Globe, ft as ChevronDown, gt as Bookmark, ht as Briefcase, l as User, lt as ChevronUp, m as TriangleAlert, mt as Camera, n as X, nt as Eye, o as Video, pt as Check, r as Wifi, s as Users, ut as ChevronRight, v as Star, x as Shield, xt as ArrowLeft, yt as AtSign, z as MessageCircle } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, c as Textarea, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-CqBxy85j.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-D2ZxaxMO.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { t as Switch } from "./switch-ByjIL8e5.mjs";
import { n as useTheme } from "./use-theme-BvBPvE0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-sHukKPri.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var SECTIONS = [
	{
		id: "profile",
		label: "Edit Profile",
		icon: User,
		desc: "Photo, name, bio, website"
	},
	{
		id: "account",
		label: "Account",
		icon: Mail,
		desc: "Email, phone, password, 2FA"
	},
	{
		id: "privacy",
		label: "Privacy",
		icon: Eye,
		desc: "Who can see your content"
	},
	{
		id: "notifications",
		label: "Notifications",
		icon: Bell,
		desc: "Push, email, activity alerts"
	},
	{
		id: "content",
		label: "Content",
		icon: Bookmark,
		desc: "Saved, archive, data"
	},
	{
		id: "appearance",
		label: "Appearance",
		icon: Moon,
		desc: "Theme, language, accessibility"
	},
	{
		id: "security",
		label: "Security",
		icon: Shield,
		desc: "2FA, devices, login alerts"
	},
	{
		id: "management",
		label: "Account Management",
		icon: TriangleAlert,
		desc: "Deactivate, delete, logout"
	}
];
function initials(name) {
	return (name ?? "?").slice(0, 2).toUpperCase();
}
function SettingsPage() {
	const { user } = useAuth();
	const [activeSection, setActiveSection] = (0, import_react.useState)(null);
	const [mobileView, setMobileView] = (0, import_react.useState)(false);
	const profileQ = useQuery({
		queryKey: ["settings-profile", user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
			if (!data) return null;
			return {
				website: null,
				gender: null,
				gender_custom: null,
				account_type: "personal",
				phone: null,
				two_fa_enabled: false,
				story_privacy: "everyone",
				reel_privacy: "everyone",
				tag_permissions: "everyone",
				hidden_words: [],
				notif_prefs: {
					likes: true,
					comments: true,
					follows: true,
					follow_requests: true,
					messages: true,
					live: true,
					email_notifs: false
				},
				content_prefs: {
					dark_mode: true,
					language: "en",
					data_saver: false
				},
				deactivated_at: null,
				...data
			};
		}
	});
	(0, import_react.useEffect)(() => {
		function check() {
			setMobileView(window.innerWidth < 768);
		}
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);
	if (!user) return null;
	const profile = profileQ.data;
	const showSidebar = !mobileView || activeSection === null;
	const showContent = !mobileView || activeSection !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-30 flex items-center gap-3 px-3 sm:px-4 h-14 border-b shrink-0 safe-top",
			style: {
				background: "oklch(0.13 0.015 268 / 0.95)",
				borderColor: "oklch(0.20 0.016 268)",
				backdropFilter: "blur(16px)"
			},
			children: [mobileView && activeSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setActiveSection(null),
				className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/profile",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold text-sm",
				children: mobileView && activeSection ? SECTIONS.find((s) => s.id === activeSection)?.label ?? "Settings" : "Settings"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 max-w-4xl mx-auto w-full",
			children: [showSidebar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "w-full md:w-64 md:border-r shrink-0 py-4",
				style: { borderColor: "oklch(0.18 0.016 268)" },
				children: [profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-4 mb-5 pb-4 border-b",
					style: { borderColor: "oklch(0.18 0.016 268)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "h-10 w-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							style: {
								background: "var(--gradient-primary)",
								color: "white"
							},
							className: "text-xs font-bold",
							children: initials(profile.username)
						}), profile.avatar_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: profile.avatar_url,
							alt: "",
							className: "w-full h-full object-cover rounded-full"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold truncate",
							children: profile.display_name || profile.username
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground truncate",
							children: ["@", profile.username]
						})]
					})]
				}), SECTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveSection(s.id),
					className: cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-all", activeSection === s.id ? "bg-white/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/3"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-xl grid place-items-center shrink-0",
							style: { background: activeSection === s.id ? "var(--gradient-primary)" : "oklch(0.18 0.016 268)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: cn("h-4 w-4", activeSection === s.id ? "text-white" : "text-muted-foreground") })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium leading-tight",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground/70 truncate",
								children: s.desc
							})]
						}),
						mobileView && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 ml-auto shrink-0 text-muted-foreground/50" })
					]
				}, s.id))]
			}), showContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 min-w-0 p-4 md:p-6",
				children: !activeSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden md:flex flex-col items-center justify-center h-full text-center py-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-16 w-16 rounded-2xl grid place-items-center mb-4",
						style: {
							background: "oklch(0.18 0.016 268)",
							border: "1px solid oklch(0.28 0.018 268)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-8 w-8 text-muted-foreground/50" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-sm",
						children: "Select a section to get started"
					})]
				}) : profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionContent, {
					section: activeSection,
					profile,
					userId: user.id
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
				})
			})]
		})]
	});
}
function SectionContent({ section, profile, userId }) {
	const qc = useQueryClient();
	const refetch = () => qc.invalidateQueries({ queryKey: ["settings-profile", userId] });
	switch (section) {
		case "profile": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSection, {
			profile,
			userId,
			onSaved: refetch
		});
		case "account": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSection, {
			profile,
			userId,
			onSaved: refetch
		});
		case "privacy": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacySection, {
			profile,
			userId,
			onSaved: refetch
		});
		case "notifications": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsSection, {
			profile,
			userId,
			onSaved: refetch
		});
		case "content": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentSection, { userId });
		case "appearance": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceSection, {
			profile,
			userId,
			onSaved: refetch
		});
		case "security": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecuritySection, {
			profile,
			userId,
			onSaved: refetch
		});
		case "management": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagementSection, { userId });
	}
}
function SectionTitle({ title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-bold",
			children: title
		}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-0.5",
			children: subtitle
		})]
	});
}
function SettingsRow({ label, sublabel, children, onClick, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(onClick ? "button" : "div", {
		onClick,
		className: cn("w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all", onClick && "hover:bg-white/5 active:bg-white/10", danger ? "text-destructive" : "text-foreground"),
		style: {
			background: "oklch(0.16 0.016 268)",
			border: "1px solid oklch(0.22 0.018 268)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-left min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-sm font-medium", danger && "text-red-400"),
				children: label
			}), sublabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-0.5",
				children: sublabel
			})]
		}), children ?? (onClick && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }))]
	});
}
function SettingsGroup({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children
		})]
	});
}
function ProfileSection({ profile, userId, onSaved }) {
	const [displayName, setDisplayName] = (0, import_react.useState)(profile.display_name ?? "");
	const [bio, setBio] = (0, import_react.useState)(profile.bio ?? "");
	const [website, setWebsite] = (0, import_react.useState)(profile.website ?? "");
	const [gender, setGender] = (0, import_react.useState)(profile.gender ?? "");
	const [genderCustom, setGenderCustom] = (0, import_react.useState)(profile.gender_custom ?? "");
	const [accountType, setAccountType] = (0, import_react.useState)(profile.account_type ?? "personal");
	const [avatarFile, setAvatarFile] = (0, import_react.useState)(null);
	const [avatarPreview, setAvatarPreview] = (0, import_react.useState)(null);
	const [usernameDialog, setUsernameDialog] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const avatarRef = (0, import_react.useRef)(null);
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
				const path = `${userId}/${Date.now()}.${ext}`;
				const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
				if (upErr) {
					toast.error("Avatar upload failed");
					return;
				}
				const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
				avatar_url = urlData.publicUrl;
			}
			const { error } = await supabase.from("profiles").update({
				display_name: displayName.trim() || null,
				bio: bio.trim() || null,
				website: website.trim() || null,
				gender: gender || null,
				gender_custom: gender === "custom" ? genderCustom.trim() : null,
				account_type: accountType,
				avatar_url,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", userId);
			if (error) if (error.message.includes("column") && error.message.includes("schema cache")) {
				const { error: fallbackErr } = await supabase.from("profiles").update({
					display_name: displayName.trim() || null,
					bio: bio.trim() || null,
					avatar_url,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", userId);
				if (fallbackErr) {
					toast.error(fallbackErr.message);
					return;
				}
				toast.success("Profile updated (run the settings migration to unlock all fields)");
			} else {
				toast.error(error.message);
				return;
			}
			else toast.success("Profile updated");
			onSaved();
			setAvatarFile(null);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Edit Profile",
			subtitle: "Manage your public profile information"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative cursor-pointer",
					onClick: () => avatarRef.current?.click(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "h-24 w-24",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								style: {
									background: "var(--gradient-primary)",
									color: "white"
								},
								className: "text-2xl font-bold",
								children: initials(profile.username)
							}), (avatarPreview || profile.avatar_url) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: avatarPreview ?? profile.avatar_url,
								alt: "",
								className: "w-full h-full object-cover rounded-full"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-6 w-6 text-white" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute -bottom-1 -right-1 h-8 w-8 rounded-full grid place-items-center text-white shadow-lg",
							style: { background: "var(--gradient-primary)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-4 w-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: avatarRef,
					type: "file",
					accept: "image/*",
					className: "hidden",
					onChange: pickAvatar
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => avatarRef.current?.click(),
					className: "mt-3 text-sm font-medium text-primary hover:underline",
					children: "Change profile photo"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-medium",
						children: "Display Name"
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-medium",
						children: "Username"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setUsernameDialog(true),
						className: "w-full flex items-center justify-between px-3 h-10 rounded-xl text-sm transition-all hover:bg-white/5",
						style: {
							background: "oklch(0.16 0.016 268)",
							border: "1px solid oklch(0.26 0.018 268)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "h-4 w-4" }), profile.username]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-4 w-4 text-muted-foreground/50" })]
					})]
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
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-medium",
						children: "Website"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center rounded-xl overflow-hidden",
						style: {
							background: "oklch(0.16 0.016 268)",
							border: "1px solid oklch(0.26 0.018 268)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 text-muted-foreground ml-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: website,
							onChange: (e) => setWebsite(e.target.value),
							placeholder: "https://yourwebsite.com",
							className: "border-0 bg-transparent focus-visible:ring-0 shadow-none"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-medium",
							children: "Gender"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: gender,
							onValueChange: setGender,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Prefer not to say" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "male",
									children: "Male"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "female",
									children: "Female"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "non_binary",
									children: "Non-binary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "prefer_not_to_say",
									children: "Prefer not to say"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "custom",
									children: "Custom"
								})
							] })]
						}),
						gender === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: genderCustom,
							onChange: (e) => setGenderCustom(e.target.value),
							placeholder: "Your gender",
							maxLength: 50,
							className: "rounded-xl mt-2"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm font-medium",
						children: "Account Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							"personal",
							"creator",
							"business"
						].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setAccountType(type),
							className: cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all", accountType === type ? "border-primary/60 text-foreground" : "border-white/10 text-muted-foreground hover:border-white/20"),
							style: { background: accountType === type ? "oklch(0.65 0.22 280 / 0.1)" : "oklch(0.16 0.016 268)" },
							children: [
								type === "personal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }),
								type === "creator" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4" }),
								type === "business" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-4 w-4" }),
								type.charAt(0).toUpperCase() + type.slice(1)
							]
						}, type))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving,
					className: "w-full h-11 rounded-xl font-semibold text-white",
					style: { background: "var(--gradient-primary)" },
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save Changes"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeUsernameDialog, {
			open: usernameDialog,
			onOpenChange: setUsernameDialog,
			currentUsername: profile.username,
			onChanged: onSaved
		})
	] });
}
function ChangeUsernameDialog({ open, onOpenChange, currentUsername, onChanged }) {
	const [value, setValue] = (0, import_react.useState)(currentUsername);
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function save() {
		if (!value.trim() || value === currentUsername) return;
		setLoading(true);
		try {
			const { error } = await supabase.rpc("change_username", { _new_username: value.trim() });
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Username changed!");
			onChanged();
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Change Username" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Your username must be 3–20 characters: letters, numbers, underscores." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center rounded-xl overflow-hidden",
					style: {
						background: "oklch(0.16 0.016 268)",
						border: "1px solid oklch(0.26 0.018 268)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "h-4 w-4 text-muted-foreground ml-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value,
						onChange: (e) => setValue(e.target.value),
						placeholder: "new_username",
						maxLength: 20,
						className: "border-0 bg-transparent focus-visible:ring-0 shadow-none"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: loading || !value.trim() || value === currentUsername,
					className: "w-full rounded-xl text-white",
					style: { background: "var(--gradient-primary)" },
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save Username"
				})]
			})]
		})
	});
}
function AccountSection({ profile, userId, onSaved }) {
	const [emailDialog, setEmailDialog] = (0, import_react.useState)(false);
	const [phoneDialog, setPhoneDialog] = (0, import_react.useState)(false);
	const [passwordDialog, setPasswordDialog] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Account",
			subtitle: "Manage your account credentials and security"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Contact Info",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Email Address",
				sublabel: profile.email ?? "Not set",
				onClick: () => setEmailDialog(true)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Phone Number",
				sublabel: profile.phone ?? "Not added",
				onClick: () => setPhoneDialog(true)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Security",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Change Password",
					sublabel: "Update your password",
					onClick: () => setPasswordDialog(true)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Two-Factor Authentication",
					sublabel: profile.two_fa_enabled ? "Enabled" : "Not enabled",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TwoFAToggle, {
						enabled: profile.two_fa_enabled,
						userId,
						onChanged: onSaved
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Login Activity",
					sublabel: "See recent sign-ins",
					onClick: () => toast.info("Login activity shows your recent sessions across devices.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Account Verification",
					sublabel: "Request a verified badge",
					onClick: () => toast.info("Verification requests are reviewed manually. Feature coming soon.")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeEmailDialog, {
			open: emailDialog,
			onOpenChange: setEmailDialog,
			currentEmail: profile.email,
			onChanged: onSaved
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePhoneDialog, {
			open: phoneDialog,
			onOpenChange: setPhoneDialog,
			currentPhone: profile.phone,
			userId,
			onChanged: onSaved
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePasswordDialog, {
			open: passwordDialog,
			onOpenChange: setPasswordDialog
		})
	] });
}
function TwoFAToggle({ enabled, userId, onChanged }) {
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function toggle() {
		setLoading(true);
		const { error } = await supabase.from("profiles").update({ two_fa_enabled: !enabled }).eq("id", userId);
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success(enabled ? "2FA disabled" : "2FA enabled — use an authenticator app for codes.");
		onChanged();
	}
	return loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
		checked: enabled,
		onCheckedChange: toggle
	});
}
function ChangeEmailDialog({ open, onOpenChange, currentEmail, onChanged }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function save() {
		if (!email.trim()) return;
		setLoading(true);
		const { error } = await supabase.auth.updateUser({ email: email.trim() });
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Confirmation sent to your new email. Check your inbox.");
		onOpenChange(false);
		onChanged();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Change Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Current: ", currentEmail ?? "none"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "new@email.com",
					className: "rounded-xl"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: loading || !email.trim(),
					className: "w-full rounded-xl text-white",
					style: { background: "var(--gradient-primary)" },
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Update Email"
				})]
			})]
		})
	});
}
function ChangePhoneDialog({ open, onOpenChange, currentPhone, userId, onChanged }) {
	const [phone, setPhone] = (0, import_react.useState)(currentPhone ?? "");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function save() {
		setLoading(true);
		const { error } = await supabase.from("profiles").update({ phone: phone.trim() || null }).eq("id", userId);
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Phone number updated");
		onOpenChange(false);
		onChanged();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Phone Number" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center rounded-xl overflow-hidden",
					style: {
						background: "oklch(0.16 0.016 268)",
						border: "1px solid oklch(0.26 0.018 268)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-muted-foreground ml-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: phone,
						onChange: (e) => setPhone(e.target.value),
						type: "tel",
						placeholder: "+1 555 000 0000",
						className: "border-0 bg-transparent focus-visible:ring-0 shadow-none"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: loading,
					className: "w-full rounded-xl text-white",
					style: { background: "var(--gradient-primary)" },
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save Phone"
				})]
			})]
		})
	});
}
function ChangePasswordDialog({ open, onOpenChange }) {
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function save() {
		if (next.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		if (next !== confirm) {
			toast.error("Passwords don't match");
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.updateUser({ password: next });
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Password changed successfully");
		onOpenChange(false);
		setCurrent("");
		setNext("");
		setConfirm("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Change Password" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: current,
						onChange: (e) => setCurrent(e.target.value),
						placeholder: "Current password",
						className: "rounded-xl"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: next,
						onChange: (e) => setNext(e.target.value),
						placeholder: "New password (min 8 chars)",
						className: "rounded-xl"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: confirm,
						onChange: (e) => setConfirm(e.target.value),
						placeholder: "Confirm new password",
						className: "rounded-xl"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						disabled: loading || !next || !confirm,
						className: "w-full rounded-xl text-white",
						style: { background: "var(--gradient-primary)" },
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Change Password"
					})
				]
			})]
		})
	});
}
function PrivacySection({ profile, userId, onSaved }) {
	const [privacyLoading, setPrivacyLoading] = (0, import_react.useState)(false);
	const [blockedOpen, setBlockedOpen] = (0, import_react.useState)(false);
	const [restrictedOpen, setRestrictedOpen] = (0, import_react.useState)(false);
	const [mutedOpen, setMutedOpen] = (0, import_react.useState)(false);
	const [hiddenWordsOpen, setHiddenWordsOpen] = (0, import_react.useState)(false);
	async function togglePrivate() {
		setPrivacyLoading(true);
		const { error } = await supabase.from("profiles").update({ is_private: !profile.is_private }).eq("id", userId);
		setPrivacyLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success(profile.is_private ? "Account set to public" : "Account set to private");
		onSaved();
	}
	async function updatePrivacyField(field, value) {
		const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", userId);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Privacy setting updated");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Privacy",
			subtitle: "Control who can see and interact with your content"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsGroup, {
			title: "Account Privacy",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Private Account",
				sublabel: profile.is_private ? "Only approved followers can see your posts" : "Anyone can see your posts",
				children: privacyLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: profile.is_private,
					onCheckedChange: togglePrivate
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Interactions",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Story Privacy",
					sublabel: `Currently: ${profile.story_privacy}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: profile.story_privacy,
						onValueChange: (v) => updatePrivacyField("story_privacy", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-36 h-8 rounded-lg text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "everyone",
								children: "Everyone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "followers",
								children: "Followers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "close_friends",
								children: "Close Friends"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "no_one",
								children: "No One"
							})
						] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Reel Privacy",
					sublabel: `Currently: ${profile.reel_privacy}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: profile.reel_privacy,
						onValueChange: (v) => updatePrivacyField("reel_privacy", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-36 h-8 rounded-lg text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "everyone",
								children: "Everyone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "followers",
								children: "Followers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "no_one",
								children: "No One"
							})
						] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Tags & Mentions",
					sublabel: `Who can tag you: ${profile.tag_permissions}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: profile.tag_permissions,
						onValueChange: (v) => updatePrivacyField("tag_permissions", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-36 h-8 rounded-lg text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "everyone",
								children: "Everyone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "followers",
								children: "Followers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "no_one",
								children: "No One"
							})
						] })]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Manage Users",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Blocked Accounts",
					sublabel: "Users you've blocked",
					onClick: () => setBlockedOpen(true)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Restricted Accounts",
					sublabel: "Limit interaction without blocking",
					onClick: () => setRestrictedOpen(true)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Muted Accounts",
					sublabel: "Hide posts without unfollowing",
					onClick: () => setMutedOpen(true)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Hidden Words",
					sublabel: `${profile.hidden_words?.length ?? 0} words filtered`,
					onClick: () => setHiddenWordsOpen(true)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagedUsersDialog, {
			open: blockedOpen,
			onOpenChange: setBlockedOpen,
			title: "Blocked Accounts",
			fetchFn: "get_blocked_users",
			removeFn: "unblock_user",
			removeLabel: "Unblock",
			emptyText: "You haven't blocked anyone."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagedUsersDialog, {
			open: restrictedOpen,
			onOpenChange: setRestrictedOpen,
			title: "Restricted Accounts",
			fetchFn: "get_restricted_users",
			removeFn: "unrestrict_user",
			removeLabel: "Unrestrict",
			emptyText: "No restricted accounts."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagedUsersDialog, {
			open: mutedOpen,
			onOpenChange: setMutedOpen,
			title: "Muted Accounts",
			fetchFn: "get_muted_users",
			removeFn: "unmute_user",
			removeLabel: "Unmute",
			emptyText: "No muted accounts."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HiddenWordsDialog, {
			open: hiddenWordsOpen,
			onOpenChange: setHiddenWordsOpen,
			words: profile.hidden_words ?? [],
			userId,
			onSaved
		})
	] });
}
function ManagedUsersDialog({ open, onOpenChange, title, fetchFn, removeFn, removeLabel, emptyText }) {
	const qc = useQueryClient();
	const key = [fetchFn];
	const { data: users = [], isLoading } = useQuery({
		queryKey: key,
		enabled: open,
		queryFn: async () => {
			const { data, error } = await supabase.rpc(fetchFn);
			if (error) return [];
			return data ?? [];
		}
	});
	async function remove(id) {
		const { error } = await supabase.rpc(removeFn, { _target: id });
		if (error) {
			toast.error(error.message);
			return;
		}
		qc.invalidateQueries({ queryKey: key });
		toast.success("Done");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto space-y-2 pr-1",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center py-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
					}),
					!isLoading && users.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground py-6",
						children: emptyText
					}),
					users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 p-3 rounded-xl",
						style: { background: "oklch(0.16 0.016 268)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
								className: "h-9 w-9 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "text-xs font-bold",
									style: {
										background: "var(--gradient-primary)",
										color: "white"
									},
									children: initials(u.username)
								}), u.avatar_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: u.avatar_url,
									alt: "",
									className: "w-full h-full object-cover rounded-full"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium truncate",
									children: u.display_name || u.username
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["@", u.username]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => remove(u.id),
								className: "text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all shrink-0",
								children: removeLabel
							})
						]
					}, u.id))
				]
			})]
		})
	});
}
function HiddenWordsDialog({ open, onOpenChange, words, userId, onSaved }) {
	const [list, setList] = (0, import_react.useState)(words);
	const [input, setInput] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) setList(words);
	}, [open, words]);
	function add() {
		const w = input.trim().toLowerCase();
		if (!w || list.includes(w)) return;
		setList((prev) => [...prev, w]);
		setInput("");
	}
	async function save() {
		setSaving(true);
		const { error } = await supabase.from("profiles").update({ hidden_words: list }).eq("id", userId);
		setSaving(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Hidden words saved");
		onSaved();
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Hidden Words" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Comments and captions containing these words will be hidden." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: input,
							onChange: (e) => setInput(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									add();
								}
							},
							placeholder: "Add a word…",
							className: "rounded-xl flex-1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: add,
							variant: "outline",
							size: "icon",
							className: "rounded-xl shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 min-h-[40px]",
						children: [list.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
							style: {
								background: "oklch(0.20 0.016 268)",
								border: "1px solid oklch(0.30 0.018 268)"
							},
							children: [w, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setList((l) => l.filter((x) => x !== w)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 text-muted-foreground hover:text-foreground" })
							})]
						}, w)), list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "No words added yet"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						disabled: saving,
						className: "w-full rounded-xl text-white",
						style: { background: "var(--gradient-primary)" },
						children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save"
					})
				]
			})]
		})
	});
}
function NotificationsSection({ profile, userId, onSaved }) {
	const prefs = {
		likes: true,
		comments: true,
		follows: true,
		follow_requests: true,
		messages: true,
		live: true,
		email_notifs: false,
		...profile.notif_prefs ?? {}
	};
	async function toggle(key) {
		const next = {
			...prefs,
			[key]: !prefs[key]
		};
		const { error } = await supabase.rpc("update_notif_prefs", { _prefs: next });
		if (error) {
			toast.error(error.message);
			return;
		}
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
		title: "Notifications",
		subtitle: "Choose what you want to be notified about"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: [
			{
				key: "likes",
				label: "Likes",
				icon: Heart,
				sublabel: "When someone likes your post or reel"
			},
			{
				key: "comments",
				label: "Comments",
				icon: MessageCircle,
				sublabel: "When someone comments on your content"
			},
			{
				key: "follows",
				label: "New Followers",
				icon: Users,
				sublabel: "When someone follows you"
			},
			{
				key: "follow_requests",
				label: "Follow Requests",
				icon: Users,
				sublabel: "When someone requests to follow you"
			},
			{
				key: "messages",
				label: "Direct Messages",
				icon: MessageSquare,
				sublabel: "When you receive a message"
			},
			{
				key: "live",
				label: "Live Streams",
				icon: Video,
				sublabel: "When someone you follow goes live"
			},
			{
				key: "email_notifs",
				label: "Email Notifications",
				icon: Mail,
				sublabel: "Receive notifications via email"
			}
		].map(({ key, label, sublabel, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-4 py-3.5 rounded-2xl",
			style: {
				background: "oklch(0.16 0.016 268)",
				border: "1px solid oklch(0.22 0.018 268)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-8 rounded-xl grid place-items-center shrink-0",
					style: { background: "oklch(0.20 0.016 268)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-muted-foreground" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: sublabel
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: prefs[key],
					onCheckedChange: () => toggle(key)
				})
			]
		}, key))
	})] });
}
function ContentSection({ userId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Content & Data",
			subtitle: "Manage your posts, archive, and data"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Your Content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Saved Posts",
					sublabel: "Posts you've bookmarked",
					onClick: () => toast.info("Saved posts feature coming soon.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Archive",
					sublabel: "Your archived posts and stories",
					onClick: () => toast.info("Archive feature coming soon.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Drafts",
					sublabel: "Unsent posts and stories",
					onClick: () => toast.info("Drafts feature coming soon.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Activity History",
					sublabel: "Your likes, comments, and interactions",
					onClick: () => toast.info("Activity history coming soon.")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Data",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Download Your Data",
				sublabel: "Get a copy of your chatfaa data",
				onClick: () => toast.info("Data export will be emailed to you. Feature coming soon.")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Delete All Posts",
				sublabel: "Permanently remove all your posts",
				onClick: () => toast.error("This action is irreversible. Contact support to proceed."),
				danger: true
			})]
		})
	] });
}
function AppearanceSection({ profile, userId, onSaved }) {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";
	const prefs = {
		dark_mode: true,
		language: "en",
		data_saver: false,
		...profile.content_prefs ?? {}
	};
	async function handleThemeChange(dark) {
		setTheme(dark ? "dark" : "light");
		toast.success(dark ? "Dark mode enabled" : "Light mode enabled");
		const next = {
			...prefs,
			dark_mode: dark
		};
		const { error } = await supabase.rpc("update_content_prefs", { _prefs: next });
		if (error) console.warn("Could not save theme preference:", error.message);
		else onSaved();
	}
	async function handlePrefChange(key, value) {
		const next = {
			...prefs,
			[key]: value
		};
		const { error } = await supabase.rpc("update_content_prefs", { _prefs: next });
		if (error) {
			toast.error(error.message);
			return;
		}
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Appearance & Accessibility",
			subtitle: "Customize how chatfaa looks and feels"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsGroup, {
			title: "Theme",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3",
				children: [true, false].map((dark) => {
					const active = isDark === dark;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => handleThemeChange(dark),
						className: cn("flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all", active ? "border-primary" : "border-border hover:border-primary/40"),
						style: {
							background: dark ? "oklch(0.12 0.014 268)" : "oklch(0.96 0.005 268)",
							color: dark ? "white" : "oklch(0.15 0.015 268)"
						},
						children: [
							dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-6 w-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-6 w-6" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold",
								children: dark ? "Dark" : "Light"
							}),
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 w-1.5 rounded-full",
								style: { background: "var(--gradient-primary)" }
							})
						]
					}, String(dark));
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsGroup, {
			title: "Language",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-3.5 rounded-2xl",
				style: {
					background: "var(--card)",
					border: "1px solid var(--border)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-xl grid place-items-center",
							style: { background: "var(--muted)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-4 w-4 text-muted-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Language"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "App display language"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: prefs.language,
						onValueChange: (v) => handlePrefChange("language", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-32 h-8 rounded-lg text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
							{
								value: "en",
								label: "English"
							},
							{
								value: "ar",
								label: "العربية"
							},
							{
								value: "es",
								label: "Español"
							},
							{
								value: "fr",
								label: "Français"
							},
							{
								value: "de",
								label: "Deutsch"
							},
							{
								value: "pt",
								label: "Português"
							},
							{
								value: "hi",
								label: "हिन्दी"
							},
							{
								value: "zh",
								label: "中文"
							},
							{
								value: "ja",
								label: "日本語"
							},
							{
								value: "ko",
								label: "한국어"
							}
						].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: l.value,
							children: l.label
						}, l.value)) })]
					})]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsGroup, {
			title: "Data & Performance",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-3.5 rounded-2xl",
				style: {
					background: "var(--card)",
					border: "1px solid var(--border)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-8 w-8 rounded-xl grid place-items-center",
						style: { background: "var(--muted)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "h-4 w-4 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Data Saver"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Load lower-quality images"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: prefs.data_saver,
						onCheckedChange: (v) => handlePrefChange("data_saver", v)
					})
				]
			})
		})
	] });
}
function SecuritySection({ profile, userId, onSaved }) {
	const [passwordDialog, setPasswordDialog] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Security",
			subtitle: "Keep your account safe"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Authentication",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Change Password",
				sublabel: "Update your account password",
				onClick: () => setPasswordDialog(true)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Two-Factor Authentication",
				sublabel: profile.two_fa_enabled ? "Enabled — using authenticator app" : "Add an extra layer of security",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TwoFAToggle, {
					enabled: profile.two_fa_enabled,
					userId,
					onChanged: onSaved
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Devices & Sessions",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Security Checkup",
					sublabel: "Review your account security",
					onClick: () => toast.info("Security checkup scans for weak passwords and unusual activity.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Trusted Devices",
					sublabel: "Devices that don't require 2FA",
					onClick: () => toast.info("Trusted devices management coming soon.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Login Alerts",
					sublabel: "Get notified of new sign-ins",
					onClick: () => toast.info("Login alert emails are sent automatically to your registered email.")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Login Activity",
					sublabel: "Review recent sign-ins",
					onClick: () => toast.info("Session management coming soon.")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePasswordDialog, {
			open: passwordDialog,
			onOpenChange: setPasswordDialog
		})
	] });
}
function ManagementSection({ userId }) {
	const navigate = useNavigate();
	const [deactivateDialog, setDeactivateDialog] = (0, import_react.useState)(false);
	const [deleteDialog, setDeleteDialog] = (0, import_react.useState)(false);
	async function logout() {
		await supabase.auth.signOut({ scope: "local" });
		navigate({ to: "/auth" });
		toast.success("Logged out");
	}
	async function logoutAll() {
		await supabase.auth.signOut({ scope: "global" });
		navigate({ to: "/auth" });
		toast.success("Logged out from all devices");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			title: "Account Management",
			subtitle: "Control your account status and sessions"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Sessions",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Log Out",
				sublabel: "Sign out from this device",
				onClick: logout
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Log Out All Devices",
				sublabel: "Sign out everywhere",
				onClick: logoutAll
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsGroup, {
			title: "Account Status",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Deactivate Account",
				sublabel: "Temporarily hide your profile",
				onClick: () => setDeactivateDialog(true),
				danger: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Delete Account",
				sublabel: "Permanently delete your account and data",
				onClick: () => setDeleteDialog(true),
				danger: true
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeactivateDialog, {
			open: deactivateDialog,
			onOpenChange: setDeactivateDialog,
			onConfirm: async () => {
				await supabase.rpc("deactivate_own_account");
				await supabase.auth.signOut();
				navigate({ to: "/auth" });
				toast.success("Account deactivated. Log back in anytime to reactivate.");
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteDialog, {
			open: deleteDialog,
			onOpenChange: setDeleteDialog,
			onConfirm: async () => {
				await supabase.rpc("delete_own_account");
				await supabase.auth.signOut();
				navigate({ to: "/auth" });
				toast.success("Account deleted");
			}
		})
	] });
}
function DeactivateDialog({ open, onOpenChange, onConfirm }) {
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function confirm() {
		setLoading(true);
		await onConfirm();
		setLoading(false);
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Deactivate Account?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Your profile, posts, and data will be hidden until you log back in." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "flex-1 rounded-xl",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: confirm,
					disabled: loading,
					className: "flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Deactivate"
				})]
			})]
		})
	});
}
function DeleteDialog({ open, onOpenChange, onConfirm }) {
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function go() {
		if (confirm !== "delete") return;
		setLoading(true);
		await onConfirm();
		setLoading(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl max-w-sm w-[calc(100vw-2rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "text-destructive",
				children: "Delete Account Permanently"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This cannot be undone. All your posts, messages, followers, and data will be deleted forever." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Type ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "delete" }),
							" to confirm:"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: confirm,
						onChange: (e) => setConfirm(e.target.value),
						placeholder: "Type \"delete\"",
						className: "rounded-xl"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "flex-1 rounded-xl",
							onClick: () => {
								onOpenChange(false);
								setConfirm("");
							},
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: go,
							disabled: loading || confirm !== "delete",
							className: "flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Delete Forever"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { SettingsPage as component };
