import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { r as useAuth } from "./utils-DsLFkheH.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Input } from "./input-Blp_hNQp.mjs";
import { E as Search, G as LoaderCircle, U as Lock, s as Users, u as UserPlus, xt as ArrowLeft, y as Sparkles } from "../_libs/lucide-react.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-D2ZxaxMO.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useSuggestedUsers, t as VerifiedBadge } from "./VerifiedBadge-DI94ZqAf.mjs";
import { t as FollowButton } from "./FollowButton-CUmywuFW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people-Bm4EiLW5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function initials(name) {
	return name?.slice(0, 2).toUpperCase() ?? "?";
}
function PeoplePage() {
	const { user } = useAuth();
	useQueryClient();
	const [query, setQuery] = (0, import_react.useState)("");
	const [debouncedQuery, setDebouncedQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
		return () => clearTimeout(t);
	}, [query]);
	const suggestedQ = useSuggestedUsers();
	const searchQ = useQuery({
		queryKey: ["user-search", debouncedQuery],
		enabled: debouncedQuery.length >= 1,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.rpc("search_users", { _query: debouncedQuery });
				if (error) return [];
				return data ?? [];
			} catch {
				return [];
			}
		}
	});
	if (!user) return null;
	const showSearch = debouncedQuery.length >= 1;
	const searchResults = searchQ.data ?? [];
	const suggested = suggestedQ.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b safe-top",
			style: {
				background: "oklch(0.13 0.015 268 / 0.95)",
				borderColor: "oklch(0.20 0.016 268)",
				backdropFilter: "blur(16px)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/feed",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold text-sm",
				children: "Discover People"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-xl mx-auto px-3 sm:px-4 py-5 space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-2xl px-3",
					style: {
						background: "oklch(0.17 0.016 268)",
						border: "1px solid oklch(0.26 0.018 268)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Search by username or name…",
							className: "border-0 bg-transparent shadow-none focus-visible:ring-0 py-3 text-sm",
							autoFocus: true
						}),
						query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setQuery(""),
							className: "text-muted-foreground hover:text-foreground text-xs shrink-0",
							children: "Clear"
						})
					]
				}),
				showSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
					children: "Results"
				}), searchQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
				}) : searchResults.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center py-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-8 w-8 text-muted-foreground/40 mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"No users found for \"",
							debouncedQuery,
							"\""
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1",
					children: searchResults.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRow, {
						id: u.id,
						username: u.username,
						displayName: u.display_name,
						avatarUrl: u.avatar_url,
						isPrivate: u.is_private,
						isVerified: u.is_verified,
						followStatus: u.follow_status,
						meId: user.id
					}, u.id))
				})] }),
				!showSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "h-4 w-4",
						style: { color: "oklch(0.75 0.18 280)" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Suggested for you"
					})]
				}), suggestedQ.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
				}) : suggested.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center py-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-8 w-8 text-muted-foreground/40 mb-2" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No suggestions yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground/60 mt-1",
							children: "Start following people to get suggestions"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1",
					children: suggested.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRow, {
						id: u.id,
						username: u.username,
						displayName: u.display_name,
						avatarUrl: u.avatar_url,
						isPrivate: u.is_private,
						isVerified: u.is_verified,
						followStatus: "none",
						meId: user.id,
						mutualCount: u.mutual_count
					}, u.id))
				})] })
			]
		})]
	});
}
function UserRow({ id, username, displayName, avatarUrl, isPrivate, isVerified, followStatus, meId, mutualCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-white/4 group people-row",
		style: { background: "oklch(0.16 0.016 268 / 0.5)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/profile",
				search: { userId: id },
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
					className: "h-10 w-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatarUrl ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "text-xs font-bold",
						style: {
							background: "var(--gradient-primary)",
							color: "white"
						},
						children: initials(username)
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/profile",
				search: { userId: id },
				className: "flex-1 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold leading-tight",
								children: displayName || username
							}),
							isVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, {
								size: 13,
								tooltip: false
							}),
							isPrivate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3 text-muted-foreground" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: ["@", username]
					}),
					mutualCount != null && mutualCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] text-muted-foreground/70 mt-0.5",
						children: [
							mutualCount,
							" mutual follower",
							mutualCount !== 1 ? "s" : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowButton, {
				targetId: id,
				meId,
				size: "sm"
			})
		]
	});
}
//#endregion
export { PeoplePage as component };
