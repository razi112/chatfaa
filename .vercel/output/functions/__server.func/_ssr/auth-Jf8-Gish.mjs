import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as objectType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Jf8-Gish.js
var $$splitComponentImporter = () => import("./auth-LQXS_S1f.mjs");
var searchSchema = objectType({ mode: enumType(["login", "signup"]).optional() });
var Route = createFileRoute("/auth")({
	validateSearch: searchSchema,
	head: () => ({ meta: [{ title: "Sign in — chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
