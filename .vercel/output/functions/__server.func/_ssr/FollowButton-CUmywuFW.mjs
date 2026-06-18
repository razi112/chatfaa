import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn } from "./utils-DsLFkheH.mjs";
import { t as Button } from "./button-oLsiswHv.mjs";
import { G as LoaderCircle, d as UserMinus, f as UserCheck, st as Clock, u as UserPlus } from "../_libs/lucide-react.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-Br-kiqFc.mjs";
import { i as useFollowRelationship, n as useFollowActions } from "./VerifiedBadge-DI94ZqAf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FollowButton-CUmywuFW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FollowButton({ targetId, meId, size = "default", className }) {
	const relQ = useFollowRelationship(targetId, meId);
	const { follow, unfollow } = useFollowActions(meId);
	const [confirmUnfollow, setConfirmUnfollow] = (0, import_react.useState)(false);
	if (targetId === meId) return null;
	const rel = relQ.data;
	const isLoading = relQ.isLoading || follow.isPending || unfollow.isPending;
	if (!rel || rel.i_follow === "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size,
		disabled: isLoading,
		onClick: () => follow.mutate(targetId),
		className: cn("gap-1.5 font-semibold rounded-xl", size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-5 text-sm", className),
		style: { background: "var(--gradient-primary)" },
		children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), "Follow"]
	});
	if (rel.i_follow === "pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size,
		variant: "outline",
		disabled: isLoading,
		onClick: () => unfollow.mutate(targetId),
		className: cn("gap-1.5 font-semibold rounded-xl border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300", size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-5 text-sm", className),
		children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), "Requested"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size,
			variant: "outline",
			disabled: isLoading,
			className: cn("gap-1.5 font-semibold rounded-xl", size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-5 text-sm", rel.is_mutual && "border-green-500/40 text-green-400", className),
			style: { borderColor: rel.is_mutual ? void 0 : "oklch(0.35 0.018 268)" },
			children: [isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5" }), rel.is_mutual ? "Mutual" : "Following"]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
		align: "end",
		className: "rounded-xl",
		style: {
			background: "oklch(0.16 0.016 268)",
			border: "1px solid oklch(0.24 0.018 268)"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: () => unfollow.mutate(targetId),
			className: "text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "h-4 w-4" }), "Unfollow"]
		})
	})] });
}
//#endregion
export { FollowButton as t };
