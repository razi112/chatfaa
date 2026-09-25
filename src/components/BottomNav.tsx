import { Link } from "@tanstack/react-router";
import { Home, MessageCircle, Play, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Liquid-glass floating pill navbar ────────────────────────
// Deep-space glass pill with violet-pink accent glow.
// Active item: semi-transparent violet capsule with inner highlight.
// Inactive icons: dim white. Active icons: full white + glow.

type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
  isProfile?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/feed",    icon: Home,          label: "Feed"     },
  { to: "/people",  icon: Search,        label: "Discover" },
  { to: "/chat",    icon: MessageCircle, label: "Chat"     },
  { to: "/reels",   icon: Play,          label: "Reels"    },
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
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "max(1.1rem, env(safe-area-inset-bottom))" }}
    >
      {/* Pill shell */}
      <nav
        className="pointer-events-auto flex items-center px-2 py-2 rounded-full gap-0.5 bottom-nav-pill"
        style={{
          /* Deep glass with violet tint */
          background:
            "linear-gradient(180deg, rgba(20,14,40,0.88) 0%, rgba(10,8,24,0.92) 100%)",
          backdropFilter: "blur(36px) saturate(220%) brightness(0.88)",
          WebkitBackdropFilter: "blur(36px) saturate(220%) brightness(0.88)",
          border: "1px solid rgba(168,85,247,0.28)",
          boxShadow:
            /* outer spread glow */
            "0 0 0 1px rgba(168,85,247,0.10)," +
            /* main drop shadow */
            "0 20px 56px rgba(0,0,0,0.65)," +
            "0 6px 16px rgba(0,0,0,0.40)," +
            /* top inner highlight */
            "inset 0 1px 0 rgba(255,255,255,0.12)," +
            /* bottom inner shadow */
            "inset 0 -1px 0 rgba(168,85,247,0.08)," +
            /* violet under-glow */
            "0 8px 32px -4px rgba(168,85,247,0.22)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          /* ── Profile item ── */
          if (item.isProfile) {
            const isActive = active === item.to;
            return (
              <Link key={item.to} to={item.to as any} aria-label={item.label} className="mx-0.5">
                <div
                  className={cn(
                    "h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
                    isActive ? "px-3.5" : "w-12"
                  )}
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(168,85,247,0.22) 0%, rgba(236,72,153,0.14) 100%)",
                          border: "1px solid rgba(168,85,247,0.32)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.16)," +
                            "0 0 16px -4px rgba(168,85,247,0.45)," +
                            "0 2px 10px rgba(0,0,0,0.30)",
                        }
                      : {}
                  }
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className={cn(
                        "rounded-full object-cover transition-all",
                        isActive
                          ? "h-8 w-8 ring-2 ring-violet-400/70 ring-offset-1 ring-offset-transparent"
                          : "h-7 w-7 opacity-60"
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "rounded-full grid place-items-center text-white font-bold transition-all",
                        isActive ? "h-8 w-8 text-sm" : "h-7 w-7 text-xs opacity-60"
                      )}
                      style={{
                        background: "var(--gradient-primary)",
                        boxShadow: isActive
                          ? "0 0 12px -2px rgba(168,85,247,0.6)"
                          : "none",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
              </Link>
            );
          }

          /* ── Chat item (optional callback) ── */
          if (item.to === "/chat" && onChatOpen) {
            const isActive = active === item.to;
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={onChatOpen}
                aria-label={item.label}
                className="mx-0.5"
              >
                <NavCapsule isActive={isActive} badge={badge[item.to]}>
                  <Icon
                    className="transition-all duration-200"
                    style={{
                      width: 22, height: 22,
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.40)",
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(168,85,247,0.7))"
                        : "none",
                    }}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                </NavCapsule>
              </button>
            );
          }

          /* ── Regular nav item ── */
          return (
            <NavPill key={item.to} item={item} active={active} badge={badge[item.to]} />
          );
        })}
      </nav>
    </div>
  );
}

/* ── Shared active capsule shell ─────────────────────────────── */
function NavCapsule({
  isActive,
  badge,
  children,
}: {
  isActive: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
        isActive ? "px-4" : "w-12"
      )}
      style={
        isActive
          ? {
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.22) 0%, rgba(236,72,153,0.14) 100%)",
              border: "1px solid rgba(168,85,247,0.32)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.16)," +
                "0 0 16px -4px rgba(168,85,247,0.45)," +
                "0 2px 10px rgba(0,0,0,0.30)",
            }
          : {}
      }
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full"
          style={{
            background: "#f43f5e",
            boxShadow: "0 0 6px 1px rgba(244,63,94,0.7)",
          }}
        />
      )}
    </div>
  );
}

/* ── Individual nav pill (Link-based) ───────────────────────── */
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
      <NavCapsule isActive={isActive} badge={badge}>
        <Icon
          className="transition-all duration-200"
          style={{
            width: 22, height: 22,
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.40)",
            filter: isActive
              ? "drop-shadow(0 0 6px rgba(168,85,247,0.7))"
              : "none",
          }}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
      </NavCapsule>
    </Link>
  );
}
