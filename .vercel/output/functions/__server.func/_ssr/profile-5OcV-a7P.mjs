import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as objectType, r as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-5OcV-a7P.js
var $$splitComponentImporter = () => import("./profile-DdA3zya-.mjs");
var searchSchema = objectType({ userId: stringType().optional() });
var Route = createFileRoute("/_authenticated/profile")({
	validateSearch: searchSchema,
	head: () => ({ meta: [{ title: "Profile — chatfaa" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
