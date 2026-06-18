import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn, r as useAuth } from "./utils-DsLFkheH.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as objectType, r as stringType } from "../_libs/zod.mjs";
import { t as Route } from "./auth-Jf8-Gish.mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { t as Label } from "./label-CsVfh20r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { G as LoaderCircle, nt as Eye, rt as EyeOff, xt as ArrowLeft, yt as AtSign, z as MessageCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-LQXS_S1f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var signupSchema = objectType({
	username: stringType().regex(/^[a-zA-Z0-9_]{3,20}$/, "3-20 chars: letters, numbers, underscores only"),
	email: stringType().email("Enter a valid email"),
	password: stringType().min(8, "At least 8 characters").max(72)
});
var loginSchema = objectType({
	username: stringType().min(1, "Username required"),
	password: stringType().min(1, "Password required")
});
function useUsernameCheck(value) {
	const [status, setStatus] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
		const trimmed = value.trim();
		if (!trimmed) {
			setStatus("idle");
			return;
		}
		if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
			setStatus("invalid");
			return;
		}
		setStatus("checking");
		const timer = setTimeout(async () => {
			const { data, error } = await supabase.rpc("check_username_exists", { _username: trimmed });
			if (error) {
				console.error("Username check error:", error);
				setStatus("idle");
				return;
			}
			setStatus(data ? "taken" : "available");
		}, 400);
		return () => clearTimeout(timer);
	}, [value]);
	return status;
}
function UsernameBadge({ status, mode }) {
	if (status === "idle") return null;
	const { label, color, bg } = {
		signup: {
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
				label: "✗ Already taken",
				color: "oklch(0.62 0.22 25)",
				bg: "oklch(0.62 0.22 25 / 0.15)"
			},
			invalid: {
				label: "3-20 chars: a-z, 0-9, _",
				color: "oklch(0.78 0.18 60)",
				bg: "oklch(0.78 0.18 60 / 0.12)"
			}
		},
		login: {
			checking: {
				label: "Checking…",
				color: "oklch(0.70 0.015 268)",
				bg: "oklch(0.22 0.016 268)"
			},
			available: {
				label: "✗ Username not found",
				color: "oklch(0.62 0.22 25)",
				bg: "oklch(0.62 0.22 25 / 0.15)"
			},
			taken: {
				label: "✓ Username found",
				color: "oklch(0.76 0.19 152)",
				bg: "oklch(0.20 0.08 152 / 0.3)"
			},
			invalid: {
				label: "3-20 chars: a-z, 0-9, _",
				color: "oklch(0.78 0.18 60)",
				bg: "oklch(0.78 0.18 60 / 0.12)"
			}
		}
	}[mode][status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium",
		style: {
			color,
			background: bg,
			border: `1px solid ${color}40`
		},
		children: [status === "checking" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-2.5 w-2.5 animate-spin" }), label]
	});
}
function AuthPage() {
	const { mode: initialMode } = Route.useSearch();
	const [mode, setMode] = (0, import_react.useState)(initialMode ?? "login");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		username: "",
		email: "",
		password: ""
	});
	const { user } = useAuth();
	const navigate = useNavigate();
	const usernameStatus = useUsernameCheck(form.username);
	(0, import_react.useEffect)(() => {
		if (user) navigate({ to: "/feed" });
	}, [user, navigate]);
	function switchMode(m) {
		setMode(m);
		setForm({
			username: "",
			email: "",
			password: ""
		});
		setShowPassword(false);
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "signup") {
				const parsed = signupSchema.safeParse(form);
				if (!parsed.success) {
					toast.error(parsed.error.errors[0].message);
					return;
				}
				if (usernameStatus === "taken") {
					toast.error("That username is already taken.");
					return;
				}
				if (usernameStatus === "checking") {
					toast.error("Still checking username availability…");
					return;
				}
				const { data: signUpData, error } = await supabase.auth.signUp({
					email: parsed.data.email,
					password: parsed.data.password,
					options: {
						emailRedirectTo: `${window.location.origin}/chat`,
						data: {
							username: parsed.data.username,
							display_name: parsed.data.username
						}
					}
				});
				if (error) {
					if (error.message.toLowerCase().includes("already")) toast.error("Email already in use. Try logging in.");
					else toast.error(error.message);
					return;
				}
				if (signUpData.session) {
					toast.success("Account created! Welcome to chatfaa 🎉");
					navigate({ to: "/feed" });
					return;
				}
				toast.success("Check your email to confirm your account, then log in.");
				setMode("login");
				setShowPassword(false);
				setForm({
					username: parsed.data.username,
					email: "",
					password: ""
				});
			} else {
				const parsed = loginSchema.safeParse({
					username: form.username,
					password: form.password
				});
				if (!parsed.success) {
					toast.error(parsed.error.errors[0].message);
					return;
				}
				const { data: profile, error: lookupErr } = await supabase.from("profiles").select("email").ilike("username", parsed.data.username.trim()).maybeSingle();
				if (lookupErr) {
					console.error("Profile lookup error:", lookupErr);
					toast.error("Login failed — please try again.");
					return;
				}
				if (!profile?.email) {
					toast.error("No account found with that username.");
					return;
				}
				const { error } = await supabase.auth.signInWithPassword({
					email: profile.email,
					password: parsed.data.password
				});
				if (error) {
					if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("credentials")) toast.error("Wrong password. Try again.");
					else if (error.message.toLowerCase().includes("confirm")) toast.error("Please confirm your email before logging in.");
					else toast.error(error.message);
					return;
				}
				toast.success("Welcome back!");
				navigate({ to: "/feed" });
			}
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex bg-background text-foreground overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 pointer-events-none",
				"aria-hidden": true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full",
					style: {
						background: "radial-gradient(ellipse, oklch(0.55 0.22 280 / 0.35) 0%, transparent 70%)",
						filter: "blur(60px)"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full",
					style: {
						background: "radial-gradient(ellipse, oklch(0.60 0.20 310 / 0.20) 0%, transparent 70%)",
						filter: "blur(80px)"
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden",
				style: {
					background: "linear-gradient(145deg, oklch(0.14 0.016 268) 0%, oklch(0.11 0.014 268) 100%)",
					borderRight: "1px solid oklch(0.22 0.016 268)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: "radial-gradient(ellipse at 30% 30%, oklch(0.55 0.22 280 / 0.15) 0%, transparent 60%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "relative flex items-center gap-3 z-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 place-items-center rounded-2xl",
							style: {
								background: "var(--gradient-primary)",
								boxShadow: "var(--shadow-glow)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xl font-bold tracking-tight",
							children: "chatfaa"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 space-y-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-3xl font-bold tracking-tight mb-4",
							children: [
								"Chat without limits,",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bg-clip-text text-transparent",
									style: { backgroundImage: "var(--gradient-primary)" },
									children: "share without borders."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground leading-relaxed",
							children: "Connect with friends using just a username. Real-time, private, and beautifully fast."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: [
								"No phone number required",
								"Login with just your @username",
								"Real-time messages & presence",
								"Group chats with admin controls"
							].map((feat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-5 w-5 rounded-full grid place-items-center shrink-0",
									style: {
										background: "oklch(0.65 0.22 280 / 0.2)",
										border: "1px solid oklch(0.65 0.22 280 / 0.4)"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-1.5 w-1.5 rounded-full",
										style: { background: "var(--gradient-primary)" }
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: feat
								})]
							}, feat))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "relative z-10 text-xs text-muted-foreground/60",
						children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" chatfaa"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative z-10 overflow-y-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to home"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl p-4 sm:p-5 md:p-8 auth-card",
						style: {
							background: "linear-gradient(145deg, oklch(0.16 0.016 268 / 0.95), oklch(0.13 0.014 268 / 0.98))",
							border: "1px solid oklch(0.28 0.018 268 / 0.7)",
							boxShadow: "0 24px 80px -20px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.65 0.22 280 / 0.05)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "lg:hidden flex items-center gap-3 mb-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-9 w-9 place-items-center rounded-xl",
									style: { background: "var(--gradient-primary)" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5 text-white" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg font-bold",
									children: "chatfaa"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-xl p-1 mb-7",
								style: { background: "oklch(0.12 0.014 268)" },
								children: ["login", "signup"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => switchMode(m),
									className: cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200", mode === m ? "bg-card text-foreground shadow-[0_2px_8px_-2px_oklch(0_0_0/0.4)]" : "text-muted-foreground hover:text-foreground"),
									children: m === "login" ? "Log in" : "Sign up"
								}, m))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-bold mb-1",
									children: mode === "login" ? "Welcome back" : "Create your account"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: mode === "login" ? "Enter your @username and password to continue." : "Pick a username — that's how friends will find you."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleSubmit,
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "username",
												className: "text-sm font-medium",
												children: "Username"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsernameBadge, {
												status: usernameStatus,
												mode
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring",
											style: {
												background: "var(--color-input)",
												border: usernameStatus === "available" ? `1px solid ${mode === "signup" ? "oklch(0.76 0.19 152 / 0.7)" : "oklch(0.62 0.22 25 / 0.7)"}` : usernameStatus === "taken" ? `1px solid ${mode === "signup" ? "oklch(0.62 0.22 25 / 0.7)" : "oklch(0.76 0.19 152 / 0.7)"}` : "1px solid var(--color-border)"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "pl-3 pr-1 text-muted-foreground shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "h-4 w-4" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "username",
												value: form.username,
												onChange: (e) => setForm({
													...form,
													username: e.target.value
												}),
												placeholder: "your_username",
												className: "border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none",
												required: true,
												autoComplete: "username",
												autoFocus: true
											})]
										})]
									}),
									mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											className: "text-sm font-medium",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											type: "email",
											autoComplete: "email",
											required: true,
											value: form.email,
											onChange: (e) => setForm({
												...form,
												email: e.target.value
											}),
											placeholder: "you@example.com",
											className: "rounded-xl"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "password",
											className: "text-sm font-medium",
											children: "Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring",
											style: {
												background: "var(--color-input)",
												border: "1px solid var(--color-border)"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "password",
												type: showPassword ? "text" : "password",
												required: true,
												minLength: 8,
												autoComplete: mode === "login" ? "current-password" : "new-password",
												value: form.password,
												onChange: (e) => setForm({
													...form,
													password: e.target.value
												}),
												placeholder: "••••••••",
												className: "border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none flex-1"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setShowPassword((v) => !v),
												className: "pr-4 pl-2 text-muted-foreground hover:text-foreground transition-colors",
												tabIndex: -1,
												"aria-label": showPassword ? "Hide password" : "Show password",
												children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full h-12 rounded-xl text-base font-semibold mt-2 shadow-[var(--shadow-glow)] transition-all hover:scale-[1.01] active:scale-[0.99]",
										style: { background: "var(--gradient-primary)" },
										disabled: loading || mode === "signup" && (usernameStatus === "taken" || usernameStatus === "checking"),
										children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Please wait…"]
										}) : mode === "login" ? "Log in" : "Create account"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 text-center text-sm text-muted-foreground",
								children: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"New to chatfaa?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => switchMode("signup"),
										className: "font-medium text-primary hover:underline",
										children: "Create an account"
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Already have one?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => switchMode("login"),
										className: "font-medium text-primary hover:underline",
										children: "Log in"
									})
								] })
							})
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { AuthPage as component };
