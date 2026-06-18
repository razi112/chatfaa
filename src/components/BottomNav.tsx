import { Link, useRouter } from "@tanstack/react-router";
import { Home, MessageCircle, Play, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Liquid-glass floating pill navbar ────────────────────────
// Matches Instagram's iOS / Android liquid-glass navbar:
//   • Dark frosted-glass pill floating above the home indicator
//   • Active item gets a distinct filled dark-capsule pill
//   • Icons bold-white when active, dim-white when inactive
//   • Profile item shows avatar or fallback initial
//   • No labels — icon-only, compact

type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
  isProfile?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/feed",    icon: Home,          label: "Feed" },
  { to: "/people",  icon: Search,        label: "Discover" },
  { to: "/chat",    icon: MessageCircle, label: "Chat" },
  { to: "/reels",   icon: Play,          label: "Reels" },
  { to: "/profile", icon: User,          label: "Profile", isProfile: true },
];

interface BottomNavProps {
  active: string;
  avatarUrl?: string | null;
  username?: string;
  badge?: Partial<Record<string, number>>;
  onChatOpen?: () => void;
}

export function BottomNav({
  active,
  avatarUrl,
  username,
  badge = {},
  onChatOpen,
}: BottomNavProps) {
  const initials = (username ?? "?").slice(0, 1).toUpperCase();

  return (
    /* Outer wrapper: fixed above home indicator, centred */
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {/* The main pill shell */}
      <nav
        className="pointer-events-auto flex items-center px-2 py-2 rounded-full gap-0.5"
        style={{
          background: "rgba(18, 18, 18, 0.82)",
          backdropFilter: "blur(28px) saturate(200%) brightness(0.9)",
          WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(0.9)",
          border: "1px solid rgba(255,255,255,0.11)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.55), " +
            "0 2px 8px rgba(0,0,0,0.3), " +
            "inset 0 1px 0 rgba(255,255,255,0.09)",
          marginLeft: "max(0.5rem, env(safe-area-inset-left))",
          marginRight: "max(0.5rem, env(safe-area-inset-right))",
        }}
      >
        {NAV_ITEMS.map((item) => {
          if (item.isProfile) {
            const isActive = active === item.to;
            return (
              <Link key={item.to} to={item.to as any} aria-label={item.label} className="mx-0.5">
                <div
                  className={cn(
                    "h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
                    isActive ? "px-3.5" : "w-12"
                  )}
                  style={isActive ? {
                    background: "rgba(255,255,255,0.14)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  } : {}}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt=""
                      className={cn("rounded-full object-cover transition-all", isActive ? "h-8 w-8 ring-2 ring-white/80" : "h-7 w-7 opacity-70")} />
                  ) : (
                    <div
                      className={cn("rounded-full grid place-items-center text-white font-bold transition-all",
                        isActive ? "h-8 w-8 text-sm ring-2 ring-white/80" : "h-7 w-7 text-xs opacity-70")}
                      style={{ background: "var(--gradient-primary)" }}
                    >{initials}</div>
                  )}
                </div>
              </Link>
            );
          }

          // Chat item: may use a callback instead of Link
          if (item.to === "/chat" && onChatOpen) {
            const isActive = active === item.to;
            const Icon = item.icon;
            return (
              <button key={item.to} onClick={onChatOpen} aria-label={item.label} className="mx-0.5">
                <div
                  className={cn(
                    "relative h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
                    isActive ? "px-4" : "w-12"
                  )}
                  style={isActive ? {
                    background: "rgba(255,255,255,0.14)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  } : {}}
                >
                  <Icon className={cn("transition-all duration-200", isActive ? "h-[22px] w-[22px] text-white" : "h-[22px] w-[22px] text-white/45")}
                    strokeWidth={isActive ? 2.4 : 1.8} />
                  {badge[item.to] != null && badge[item.to]! > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full" style={{ background: "#ed4956" }} />
                  )}
                </div>
              </button>
            );
          }

          return (
            <NavPill key={item.to} item={item} active={active} badge={badge[item.to]} />
          );
        })}
      </nav>
    </div>
  );
}

// ─── Individual nav pill ──────────────────────────────────────
function NavPill({
  item,
  active: activePath,
  badge,
}: {
  item: NavItem;
  active: string;
  badge?: number;
}) {
  const isActive = activePath === item.to;
  const Icon = item.icon;

  return (
    <Link to={item.to as any} aria-label={item.label} className="mx-0.5">
      <div
        className={cn(
          "relative h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
          isActive ? "px-4" : "w-12"
        )}
        style={
          isActive
            ? {
                background: "rgba(255,255,255,0.14)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.12)",
              }
            : {}
        }
      >
        <Icon
          className={cn(
            "transition-all duration-200",
            isActive
              ? "h-[22px] w-[22px] text-white"
              : "h-[22px] w-[22px] text-white/45"
          )}
          strokeWidth={isActive ? 2.4 : 1.8}
        />

        {/* Badge dot */}
        {badge != null && badge > 0 && (
          <span
            className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full"
            style={{ background: "#ed4956" }}
          />
        )}
      </div>
    </Link>
  );
}
