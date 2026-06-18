import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-theme-BvBPvE0r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "chatfaa-theme";
function getInitialTheme() {
	if (typeof window === "undefined") return "dark";
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;
	return "dark";
}
function applyTheme(theme) {
	const root = document.documentElement;
	root.classList.remove("dark", "light");
	root.classList.add(theme);
}
var ThemeContext = (0, import_react.createContext)({
	theme: "dark",
	setTheme: () => {},
	isDark: true
});
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)(getInitialTheme);
	(0, import_react.useEffect)(() => {
		applyTheme(theme);
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);
	function setTheme(t) {
		setThemeState(t);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			setTheme,
			isDark: theme === "dark"
		},
		children
	});
}
function useTheme() {
	return (0, import_react.useContext)(ThemeContext);
}
//#endregion
export { useTheme as n, ThemeProvider as t };
