import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CsY8kMVt.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as AuthProvider } from "./utils-DsLFkheH.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, k as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$8 } from "./auth-Jf8-Gish.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Route$9 } from "./profile-5OcV-a7P.mjs";
import { t as ThemeProvider } from "./use-theme-BvBPvE0r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BbEGge-6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BI-jL2Zl.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-8xl font-black bg-clip-text text-transparent mb-4 inline-block",
					style: { backgroundImage: "var(--gradient-primary)" },
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90 transition-opacity",
						style: { background: "var(--gradient-primary)" },
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-14 w-14 rounded-2xl grid place-items-center mb-5",
					style: {
						background: "oklch(0.62 0.22 25 / 0.15)",
						border: "1px solid oklch(0.62 0.22 25 / 0.3)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 24 24",
						className: "h-6 w-6 fill-none stroke-current stroke-2",
						style: { color: "oklch(0.62 0.22 25)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "12",
							cy: "12",
							r: "10"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M12 8v4M12 16h.01",
							strokeLinecap: "round"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90 transition-opacity",
						style: { background: "var(--gradient-primary)" },
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: "Chatfaa — Username-based real-time messaging" },
			{
				name: "description",
				content: "Private, real-time chat with usernames instead of phone numbers. Fast, anonymous, beautifully dark."
			},
			{
				property: "og:title",
				content: "Chatfaa — Username-based real-time messaging"
			},
			{
				property: "og:description",
				content: "Private, real-time chat with usernames instead of phone numbers. Fast, anonymous, beautifully dark."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "Chatfaa — Username-based real-time messaging"
			},
			{
				name: "twitter:description",
				content: "Private, real-time chat with usernames instead of phone numbers. Fast, anonymous, beautifully dark."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e31e0708-fcb3-4568-9628-23fcb1a02019/id-preview-5a0acaf2--2817297d-b9d1-4598-8bc6-c7f8ea53de8b.lovable.app-1781178435377.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e31e0708-fcb3-4568-9628-23fcb1a02019/id-preview-5a0acaf2--2817297d-b9d1-4598-8bc6-c7f8ea53de8b.lovable.app-1781178435377.png"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `(function(){var t=localStorage.getItem('chatfaa-theme');document.documentElement.classList.add(t==='light'?'light':'dark');})();` } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})] }) })
	});
}
var $$splitComponentImporter$6 = () => import("./route-Di7iQBCH.mjs");
var Route$6 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./routes-BRB8SXDx.mjs");
var Route$5 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Chatfaa — Real-time chat without phone numbers" }, {
		name: "description",
		content: "Sign up with a username, find friends, and chat in real time. Private by default."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./settings-sHukKPri.mjs");
var Route$4 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Settings — chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./reels-Ba0d2EmP.mjs");
var Route$3 = createFileRoute("/_authenticated/reels")({
	head: () => ({ meta: [{ title: "Reels — chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./people-Bm4EiLW5.mjs");
var Route$2 = createFileRoute("/_authenticated/people")({
	head: () => ({ meta: [{ title: "Discover People — chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./feed-BapG6Mur.mjs");
var Route$1 = createFileRoute("/_authenticated/feed")({
	head: () => ({ meta: [{ title: "Feed — chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./chat-CWlGA8yy.mjs");
var Route = createFileRoute("/_authenticated/chat")({
	head: () => ({ meta: [{ title: "chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var AuthRoute = Route$8.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$7
});
var AuthenticatedRouteRoute = Route$6.update({
	id: "/_authenticated",
	getParentRoute: () => Route$7
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var AuthenticatedSettingsRoute = Route$4.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReelsRoute = Route$3.update({
	id: "/reels",
	path: "/reels",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$9.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPeopleRoute = Route$2.update({
	id: "/people",
	path: "/people",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFeedRoute = Route$1.update({
	id: "/feed",
	path: "/feed",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedChatRoute: Route.update({
		id: "/chat",
		path: "/chat",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedFeedRoute,
	AuthenticatedPeopleRoute,
	AuthenticatedProfileRoute,
	AuthenticatedReelsRoute,
	AuthenticatedSettingsRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient({ defaultOptions: { queries: {
			staleTime: 3e4,
			refetchOnWindowFocus: false
		} } }) },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
