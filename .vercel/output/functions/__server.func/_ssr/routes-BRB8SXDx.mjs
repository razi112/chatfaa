import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { r as useAuth } from "./utils-DsLFkheH.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { E as Search, L as Moon, bt as ArrowRight, et as Globe, s as Users, t as Zap, x as Shield, y as Sparkles, z as MessageCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BRB8SXDx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var features = [
	{
		icon: Zap,
		title: "Instant delivery",
		body: "Messages stream the moment you send them — typing indicators, read receipts, live presence.",
		color: "oklch(0.78 0.20 85)"
	},
	{
		icon: Search,
		title: "Find by @username",
		body: "Search anyone instantly. No phone numbers, no email lookups, no social graphs needed.",
		color: "oklch(0.72 0.20 200)"
	},
	{
		icon: Shield,
		title: "Private by default",
		body: "Row-level security on every query. You only ever see conversations you're part of.",
		color: "oklch(0.70 0.20 310)"
	},
	{
		icon: Users,
		title: "Friend system",
		body: "Send a request, get accepted, start chatting. Intentional connections only.",
		color: "oklch(0.76 0.19 152)"
	},
	{
		icon: Globe,
		title: "Group chats",
		body: "Create groups, invite friends, manage members and admins with a few clicks.",
		color: "oklch(0.74 0.20 240)"
	},
	{
		icon: Moon,
		title: "Built for the dark",
		body: "A focused, low-glare interface that feels at home next to your editor at 2 am.",
		color: "oklch(0.68 0.18 280)"
	}
];
var stats = [
	{
		label: "Messages sent",
		value: "Real-time"
	},
	{
		label: "Phone number required",
		value: "Zero"
	},
	{
		label: "Setup time",
		value: "< 30s"
	}
];
function Landing() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({ to: "/feed" });
	}, [
		user,
		loading,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 pointer-events-none overflow-hidden",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "orb absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30",
						style: {
							background: "radial-gradient(ellipse, oklch(0.55 0.22 280 / 0.5) 0%, transparent 70%)",
							filter: "blur(60px)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "orb orb-delay absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-20",
						style: {
							background: "radial-gradient(ellipse, oklch(0.65 0.20 320 / 0.6) 0%, transparent 70%)",
							filter: "blur(80px)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "orb absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-20",
						style: {
							background: "radial-gradient(ellipse, oklch(0.60 0.20 240 / 0.5) 0%, transparent 70%)",
							filter: "blur(80px)"
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-14 py-4 sm:py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 place-items-center rounded-2xl shadow-[var(--shadow-glow)]",
						style: { background: "var(--gradient-primary)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xl font-bold tracking-tight",
						children: "chatfaa"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "text-muted-foreground hover:text-foreground",
							children: "Log in"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "signup" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "gap-2 px-5 shadow-[var(--shadow-glow)]",
							style: { background: "var(--gradient-primary)" },
							children: ["Get started ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 text-center md:pt-32",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-medium mb-8",
								style: {
									background: "oklch(0.65 0.22 280 / 0.12)",
									border: "1px solid oklch(0.65 0.22 280 / 0.3)",
									color: "oklch(0.80 0.15 280)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), "Real-time · No phone number · Just a username"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6",
								children: [
									"Chat with anyone,",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", { className: "hidden sm:block" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "bg-clip-text text-transparent",
										style: { backgroundImage: "var(--gradient-primary)" },
										children: "one @username away."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto max-w-2xl text-base md:text-xl text-muted-foreground leading-relaxed mb-10 sm:mb-12",
								children: "Chatfaa is a fast, private messenger built for friends, gamers, and study groups. Find anyone by username — no phone, no drama. Just conversations."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16 px-4 sm:px-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									search: { mode: "signup" },
									className: "w-full sm:w-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										className: "w-full sm:w-auto h-13 px-8 text-base gap-2.5 shadow-[var(--shadow-glow)]",
										style: { background: "var(--gradient-primary)" },
										children: ["Create your @username ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									className: "w-full sm:w-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										variant: "outline",
										className: "w-full sm:w-auto h-13 px-8 text-base border-border/60 hover:bg-card",
										children: "I already have an account"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap justify-center gap-10 text-center",
								children: stats.map(({ label, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-bold bg-clip-text text-transparent",
									style: { backgroundImage: "var(--gradient-primary)" },
									children: value
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: label
								})] }, label))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mx-auto max-w-4xl px-4 sm:px-6 pb-20 sm:pb-28 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full rounded-3xl overflow-hidden shadow-[0_40px_120px_-20px_oklch(0_0_0/0.7)]",
							style: { border: "1px solid oklch(0.30 0.018 268 / 0.7)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 px-5 py-4",
								style: { background: "oklch(0.13 0.015 268)" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 w-3 rounded-full bg-destructive/70" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-3 w-3 rounded-full",
										style: { background: "oklch(0.75 0.18 85 / 0.7)" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-3 w-3 rounded-full",
										style: { background: "oklch(0.75 0.18 150 / 0.7)" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-4 text-xs text-muted-foreground font-medium",
										children: "chatfaa — @alex"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex",
								style: {
									background: "oklch(0.12 0.014 268)",
									minHeight: "320px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden sm:block w-56 shrink-0 border-r p-3 space-y-1",
									style: {
										background: "oklch(0.10 0.013 268)",
										borderColor: "oklch(0.22 0.016 268)"
									},
									children: [
										{
											name: "alex_dev",
											active: true,
											online: true
										},
										{
											name: "sara_m",
											active: false,
											online: true
										},
										{
											name: "weekend_plans",
											active: false,
											online: false,
											group: true
										},
										{
											name: "john_k",
											active: false,
											online: false
										}
									].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm",
										style: {
											background: c.active ? "oklch(0.65 0.22 280 / 0.15)" : "transparent",
											color: c.active ? "white" : "oklch(0.65 0.018 268)"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-7 w-7 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0",
												style: { background: c.active ? "var(--gradient-primary)" : "oklch(0.22 0.018 268)" },
												children: c.group ? "G" : c.name.slice(0, 1).toUpperCase()
											}), c.online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2",
												style: {
													background: "oklch(0.76 0.19 152)",
													borderColor: "oklch(0.10 0.013 268)"
												}
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: c.name
										})]
									}, c.name))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 flex flex-col px-6 py-5 gap-3",
									children: [[
										{
											me: false,
											text: "hey! just joined chatfaa 👋"
										},
										{
											me: true,
											text: "welcome! no phone number needed right 😄"
										},
										{
											me: false,
											text: "exactly — found you by username instantly"
										},
										{
											me: true,
											text: "that's the whole idea. clean and simple ✨"
										}
									].map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `flex ${msg.me ? "justify-end" : "justify-start"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "max-w-[65%] rounded-2xl px-4 py-2 text-sm",
											style: {
												background: msg.me ? "var(--gradient-primary)" : "oklch(0.18 0.016 268)",
												color: msg.me ? "white" : "oklch(0.90 0.005 260)",
												borderRadius: msg.me ? "18px 18px 4px 18px" : "18px 18px 18px 4px"
											},
											children: msg.text
										})
									}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-auto flex items-center gap-2 rounded-xl px-4 py-2.5",
										style: {
											background: "oklch(0.18 0.016 268)",
											border: "1px solid oklch(0.26 0.018 268)"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 text-sm text-muted-foreground",
											children: "Message @alex_dev"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-7 w-7 rounded-lg grid place-items-center",
											style: { background: "var(--gradient-primary)" },
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
												viewBox: "0 0 24 24",
												className: "h-3.5 w-3.5 text-white fill-none stroke-current stroke-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
													d: "M22 2L11 13M22 2L15 22 11 13 2 9l20-7z",
													strokeLinecap: "round",
													strokeLinejoin: "round"
												})
											})
										})]
									})]
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-28",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center mb-16",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-3xl md:text-4xl font-bold tracking-tight mb-4",
								children: ["Everything you need,", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bg-clip-text text-transparent ml-2",
									style: { backgroundImage: "var(--gradient-primary)" },
									children: "nothing you don't."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground max-w-lg mx-auto",
								children: "Built lean and focused. Every feature earns its place."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
							children: features.map(({ icon: Icon, title, body, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1",
								style: {
									background: "oklch(0.15 0.015 268 / 0.8)",
									border: "1px solid oklch(0.25 0.018 268 / 0.7)",
									boxShadow: "0 4px 24px -8px oklch(0 0 0 / 0.4)"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
										style: { background: `radial-gradient(ellipse at top left, ${color}18 0%, transparent 60%)` }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative grid h-11 w-11 place-items-center rounded-xl mb-5",
										style: {
											background: `${color}18`,
											border: `1px solid ${color}30`
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "h-5 w-5",
											style: { color }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "relative font-semibold text-base mb-2",
										children: title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "relative text-sm text-muted-foreground leading-relaxed",
										children: body
									})
								]
							}, title))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mx-auto max-w-4xl px-4 sm:px-6 pb-20 sm:pb-28",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center overflow-hidden",
							style: {
								background: "linear-gradient(135deg, oklch(0.20 0.020 270) 0%, oklch(0.16 0.018 268) 100%)",
								border: "1px solid oklch(0.30 0.020 268 / 0.7)",
								boxShadow: "0 20px 80px -20px oklch(0.65 0.22 280 / 0.3)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 rounded-3xl",
									style: { background: "radial-gradient(ellipse at top, oklch(0.65 0.22 280 / 0.12) 0%, transparent 60%)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "relative text-3xl md:text-4xl font-bold tracking-tight mb-4",
									children: "Ready to start chatting?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "relative text-muted-foreground mb-8 max-w-md mx-auto",
									children: "Pick a username and you're in. No installs, no app stores, no waiting."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									search: { mode: "signup" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "lg",
										className: "relative h-13 px-10 text-base gap-2.5 shadow-[var(--shadow-glow)]",
										style: { background: "var(--gradient-primary)" },
										children: ["Create your free account ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									})
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "border-t py-8 text-center text-sm text-muted-foreground",
						style: { borderColor: "oklch(0.22 0.016 268)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-6 w-6 place-items-center rounded-lg",
									style: { background: "var(--gradient-primary)" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-3.5 w-3.5 text-white" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground/70",
									children: "chatfaa"
								})]
							}),
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" chatfaa · Fast, private, username-first messaging"
						]
					})
				]
			})
		]
	});
}
//#endregion
export { Landing as component };
