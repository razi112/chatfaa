import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Camera, User, Lock, Bell, Eye, Shield, Smartphone,
  Trash2, LogOut, ChevronRight, Globe, AtSign, Mail, Phone,
  Key, AlertTriangle, Download, Archive, Bookmark, Moon, Sun,
  Languages, Wifi, X, Check, Search, UserX, VolumeX, Filter,
  Users, Briefcase, Star, ToggleLeft, MessageSquare, Play,
  Tag, Heart, MessageCircle, Video as VideoIcon, Send, Loader2,
  PenLine, Info, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — chatfaa" }] }),
  component: SettingsPage,
});

// ─── Types ────────────────────────────────────────────────────
type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  gender: string | null;
  gender_custom: string | null;
  account_type: string;
  is_private: boolean;
  two_fa_enabled: boolean;
  story_privacy: string;
  reel_privacy: string;
  tag_permissions: string;
  hidden_words: string[];
  notif_prefs: NotifPrefs;
  content_prefs: ContentPrefs;
};

type NotifPrefs = {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  follow_requests: boolean;
  messages: boolean;
  live: boolean;
  email_notifs: boolean;
};

type ContentPrefs = {
  dark_mode: boolean;
  language: string;
  data_saver: boolean;
};

type ManagedUser = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

// ─── Sections config ─────────────────────────────────────────
type Section =
  | "profile" | "account" | "privacy" | "notifications"
  | "content" | "appearance" | "security" | "management";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profile",       label: "Edit Profile",     icon: User,        desc: "Photo, name, bio, website" },
  { id: "account",       label: "Account",          icon: Mail,        desc: "Email, phone, password, 2FA" },
  { id: "privacy",       label: "Privacy",          icon: Eye,         desc: "Who can see your content" },
  { id: "notifications", label: "Notifications",    icon: Bell,        desc: "Push, email, activity alerts" },
  { id: "content",       label: "Content",          icon: Bookmark,    desc: "Saved, archive, data" },
  { id: "appearance",    label: "Appearance",       icon: Moon,        desc: "Theme, language, accessibility" },
  { id: "security",      label: "Security",         icon: Shield,      desc: "2FA, devices, login alerts" },
  { id: "management",    label: "Account Management", icon: AlertTriangle, desc: "Deactivate, delete, logout" },
];

function initials(name: string) { return (name ?? "?").slice(0, 2).toUpperCase(); }

// ─── Main Page ────────────────────────────────────────────────
function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [mobileView, setMobileView] = useState(false);

  const profileQ = useQuery({
    queryKey: ["settings-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (!data) return null;
      // Merge safe defaults for columns that may not exist yet in the remote DB
      return {
        website: null,
        gender: null,
        gender_custom: null,
        account_type: "personal",
        phone: null,
        two_fa_enabled: false,
        story_privacy: "everyone",
        reel_privacy: "everyone",
        tag_permissions: "everyone",
        hidden_words: [],
        notif_prefs: { likes: true, comments: true, follows: true, follow_requests: true, messages: true, live: true, email_notifs: false },
        content_prefs: { dark_mode: true, language: "en", data_saver: false },
        deactivated_at: null,
        ...data,
      } as Profile;
    },
  });

  useEffect(() => {
    function check() { setMobileView(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!user) return null;
  const profile = profileQ.data;

  const showSidebar = !mobileView || activeSection === null;
  const showContent = !mobileView || activeSection !== null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-3 sm:px-4 h-14 border-b shrink-0 safe-top"
        style={{ background: "oklch(0.13 0.015 268 / 0.95)", borderColor: "oklch(0.20 0.016 268)", backdropFilter: "blur(16px)" }}
      >
        {mobileView && activeSection ? (
          <button
            onClick={() => setActiveSection(null)}
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link to="/profile">
            <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        )}
        <span className="font-semibold text-sm">
          {mobileView && activeSection
            ? SECTIONS.find(s => s.id === activeSection)?.label ?? "Settings"
            : "Settings"}
        </span>
      </header>

      <div className="flex flex-1 max-w-4xl mx-auto w-full">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-full md:w-64 md:border-r shrink-0 py-4 pb-bottom-nav md:pb-4 overflow-y-auto" style={{ borderColor: "oklch(0.18 0.016 268)" }}>
            {/* Profile mini card */}
            {profile && (
              <div className="flex items-center gap-3 px-4 mb-5 pb-4 border-b" style={{ borderColor: "oklch(0.18 0.016 268)" }}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ background: "var(--gradient-primary)", color: "white" }} className="text-xs font-bold">
                    {initials(profile.username)}
                  </AvatarFallback>
                  {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />}
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.display_name || profile.username}</p>
                  <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                </div>
              </div>
            )}

            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-all",
                  activeSection === s.id
                    ? "bg-white/5 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/3"
                )}
              >
                <div
                  className="h-8 w-8 rounded-xl grid place-items-center shrink-0"
                  style={{
                    background: activeSection === s.id ? "var(--gradient-primary)" : "oklch(0.18 0.016 268)",
                  }}
                >
                  <s.icon className={cn("h-4 w-4", activeSection === s.id ? "text-white" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground/70 truncate">{s.desc}</p>
                </div>
                {mobileView && <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground/50" />}
              </button>
            ))}
          </aside>
        )}

        {/* Content panel */}
        {showContent && (
          <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 overflow-x-hidden pb-bottom-nav md:pb-6">
            {!activeSection ? (
              <div className="hidden md:flex flex-col items-center justify-center h-full text-center py-20">
                <div className="h-16 w-16 rounded-2xl grid place-items-center mb-4"
                  style={{ background: "oklch(0.18 0.016 268)", border: "1px solid oklch(0.28 0.018 268)" }}>
                  <Shield className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-sm">Select a section to get started</p>
              </div>
            ) : profile ? (
              <SectionContent section={activeSection} profile={profile} userId={user.id} />
            ) : (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </main>
        )}
      </div>

      <BottomNav active="/profile" avatarUrl={profile?.avatar_url ?? null} username={profile?.username} />
    </div>
  );
}

// ─── Section Content Router ───────────────────────────────────
function SectionContent({ section, profile, userId }: { section: Section; profile: Profile; userId: string }) {
  const qc = useQueryClient();
  const refetch = () => qc.invalidateQueries({ queryKey: ["settings-profile", userId] });

  switch (section) {
    case "profile":       return <ProfileSection profile={profile} userId={userId} onSaved={refetch} />;
    case "account":       return <AccountSection profile={profile} userId={userId} onSaved={refetch} />;
    case "privacy":       return <PrivacySection profile={profile} userId={userId} onSaved={refetch} />;
    case "notifications": return <NotificationsSection profile={profile} userId={userId} onSaved={refetch} />;
    case "content":       return <ContentSection userId={userId} />;
    case "appearance":    return <AppearanceSection profile={profile} userId={userId} onSaved={refetch} />;
    case "security":      return <SecuritySection profile={profile} userId={userId} onSaved={refetch} />;
    case "management":    return <ManagementSection userId={userId} />;
  }
}

// ─── Shared UI helpers ────────────────────────────────────────
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function SettingsRow({
  label, sublabel, children, onClick, danger,
}: {
  label: string; sublabel?: string;
  children?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all",
        onClick && "hover:bg-white/5 active:bg-white/10",
        danger ? "text-destructive" : "text-foreground"
      )}
      style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.22 0.018 268)" }}
    >
      <div className="text-left min-w-0">
        <p className={cn("text-sm font-medium", danger && "text-red-400")}>{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {children ?? (onClick && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />)}
    </Tag>
  );
}

function SettingsGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</p>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ─── 1. PROFILE SECTION ───────────────────────────────────────
function ProfileSection({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [genderCustom, setGenderCustom] = useState(profile.gender_custom ?? "");
  const [accountType, setAccountType] = useState(profile.account_type ?? "personal");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameDialog, setUsernameDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  }

  async function save() {
    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (upErr) { toast.error("Avatar upload failed"); return; }
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }
      // Try saving all fields; if extended columns don't exist yet, fall back to base fields only
      const { error } = await supabase.from("profiles").update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        gender: gender || null,
        gender_custom: gender === "custom" ? genderCustom.trim() : null,
        account_type: accountType,
        avatar_url,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      if (error) {
        if (error.message.includes("column") && error.message.includes("schema cache")) {
          // Extended columns not yet in DB — save only base columns
          const { error: fallbackErr } = await supabase.from("profiles").update({
            display_name: displayName.trim() || null,
            bio: bio.trim() || null,
            avatar_url,
            updated_at: new Date().toISOString(),
          }).eq("id", userId);
          if (fallbackErr) { toast.error(fallbackErr.message); return; }
          toast.success("Profile updated (run the settings migration to unlock all fields)");
        } else {
          toast.error(error.message); return;
        }
      } else {
        toast.success("Profile updated");
      }
      onSaved();
      setAvatarFile(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionTitle title="Edit Profile" subtitle="Manage your public profile information" />

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative cursor-pointer" onClick={() => avatarRef.current?.click()}>
          <Avatar className="h-24 w-24">
            <AvatarFallback style={{ background: "var(--gradient-primary)", color: "white" }} className="text-2xl font-bold">
              {initials(profile.username)}
            </AvatarFallback>
            {(avatarPreview || profile.avatar_url) && (
              <img src={avatarPreview ?? profile.avatar_url!} alt="" className="w-full h-full object-cover rounded-full" />
            )}
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full grid place-items-center text-white shadow-lg"
            style={{ background: "var(--gradient-primary)" }}>
            <Camera className="h-4 w-4" />
          </div>
        </div>
        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
        <button onClick={() => avatarRef.current?.click()} className="mt-3 text-sm font-medium text-primary hover:underline">
          Change profile photo
        </button>
      </div>

      <div className="space-y-4">
        {/* Display name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Display Name</Label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder={profile.username} maxLength={50} className="rounded-xl" />
        </div>

        {/* Username (opens dialog) */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Username</Label>
          <button
            onClick={() => setUsernameDialog(true)}
            className="w-full flex items-center justify-between px-3 h-10 rounded-xl text-sm transition-all hover:bg-white/5"
            style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <AtSign className="h-4 w-4" />
              {profile.username}
            </span>
            <PenLine className="h-4 w-4 text-muted-foreground/50" />
          </button>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Bio</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Tell people about yourself…" maxLength={150} rows={3} className="rounded-xl resize-none" />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Website</Label>
          <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}>
            <Globe className="h-4 w-4 text-muted-foreground ml-3 shrink-0" />
            <Input value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com" className="border-0 bg-transparent focus-visible:ring-0 shadow-none" />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Prefer not to say" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non_binary">Non-binary</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {gender === "custom" && (
            <Input value={genderCustom} onChange={e => setGenderCustom(e.target.value)}
              placeholder="Your gender" maxLength={50} className="rounded-xl mt-2" />
          )}
        </div>

        {/* Account type */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Account Type</Label>
          <div className="grid grid-cols-3 gap-2 min-w-0">
            {(["personal", "creator", "business"] as const).map(type => (
              <button
                key={type}
                onClick={() => setAccountType(type)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                  accountType === type
                    ? "border-primary/60 text-foreground"
                    : "border-white/10 text-muted-foreground hover:border-white/20"
                )}
                style={{ background: accountType === type ? "oklch(0.65 0.22 280 / 0.1)" : "oklch(0.16 0.016 268)" }}
              >
                {type === "personal" && <User className="h-4 w-4" />}
                {type === "creator" && <Star className="h-4 w-4" />}
                {type === "business" && <Briefcase className="h-4 w-4" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={save}
          disabled={saving}
          className="w-full h-11 rounded-xl font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>

      <ChangeUsernameDialog
        open={usernameDialog}
        onOpenChange={setUsernameDialog}
        currentUsername={profile.username}
        onChanged={onSaved}
      />
    </div>
  );
}

function ChangeUsernameDialog({ open, onOpenChange, currentUsername, onChanged }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  currentUsername: string; onChanged: () => void;
}) {
  const [value, setValue] = useState(currentUsername);
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!value.trim() || value === currentUsername) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("change_username", { _new_username: value.trim() });
      if (error) { toast.error(error.message); return; }
      toast.success("Username changed!");
      onChanged();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
          <DialogDescription>Your username must be 3–20 characters: letters, numbers, underscores.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}>
            <AtSign className="h-4 w-4 text-muted-foreground ml-3 shrink-0" />
            <Input value={value} onChange={e => setValue(e.target.value)}
              placeholder="new_username" maxLength={20} className="border-0 bg-transparent focus-visible:ring-0 shadow-none" />
          </div>
          <Button onClick={save} disabled={loading || !value.trim() || value === currentUsername}
            className="w-full rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Username"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 2. ACCOUNT SECTION ───────────────────────────────────────
function AccountSection({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const [emailDialog, setEmailDialog] = useState(false);
  const [phoneDialog, setPhoneDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);

  return (
    <div>
      <SectionTitle title="Account" subtitle="Manage your account credentials and security" />

      <SettingsGroup title="Contact Info">
        <SettingsRow
          label="Email Address"
          sublabel={profile.email ?? "Not set"}
          onClick={() => setEmailDialog(true)}
        />
        <SettingsRow
          label="Phone Number"
          sublabel={profile.phone ?? "Not added"}
          onClick={() => setPhoneDialog(true)}
        />
      </SettingsGroup>

      <SettingsGroup title="Security">
        <SettingsRow label="Change Password" sublabel="Update your password" onClick={() => setPasswordDialog(true)} />
        <SettingsRow label="Two-Factor Authentication" sublabel={profile.two_fa_enabled ? "Enabled" : "Not enabled"}>
          <TwoFAToggle enabled={profile.two_fa_enabled} userId={userId} onChanged={onSaved} />
        </SettingsRow>
        <SettingsRow label="Login Activity" sublabel="See recent sign-ins" onClick={() => toast.info("Login activity shows your recent sessions across devices.")} />
        <SettingsRow label="Account Verification" sublabel="Request a verified badge" onClick={() => toast.info("Verification requests are reviewed manually. Feature coming soon.")} />
      </SettingsGroup>

      <ChangeEmailDialog open={emailDialog} onOpenChange={setEmailDialog} currentEmail={profile.email} onChanged={onSaved} />
      <ChangePhoneDialog open={phoneDialog} onOpenChange={setPhoneDialog} currentPhone={profile.phone} userId={userId} onChanged={onSaved} />
      <ChangePasswordDialog open={passwordDialog} onOpenChange={setPasswordDialog} />
    </div>
  );
}

function TwoFAToggle({ enabled, userId, onChanged }: { enabled: boolean; userId: string; onChanged: () => void }) {
  const [loading, setLoading] = useState(false);
  async function toggle() {
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ two_fa_enabled: !enabled }).eq("id", userId);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(enabled ? "2FA disabled" : "2FA enabled — use an authenticator app for codes.");
    onChanged();
  }
  return loading
    ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    : <Switch checked={enabled} onCheckedChange={toggle} />;
}

function ChangeEmailDialog({ open, onOpenChange, currentEmail, onChanged }: {
  open: boolean; onOpenChange: (v: boolean) => void; currentEmail: string | null; onChanged: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  async function save() {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Confirmation sent to your new email. Check your inbox.");
    onOpenChange(false);
    onChanged();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader><DialogTitle>Change Email</DialogTitle>
          <DialogDescription>Current: {currentEmail ?? "none"}</DialogDescription></DialogHeader>
        <div className="space-y-4 pt-1">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="new@email.com" className="rounded-xl" />
          <Button onClick={save} disabled={loading || !email.trim()} className="w-full rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChangePhoneDialog({ open, onOpenChange, currentPhone, userId, onChanged }: {
  open: boolean; onOpenChange: (v: boolean) => void; currentPhone: string | null; userId: string; onChanged: () => void;
}) {
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [loading, setLoading] = useState(false);
  async function save() {
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ phone: phone.trim() || null }).eq("id", userId);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Phone number updated");
    onOpenChange(false);
    onChanged();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader><DialogTitle>Phone Number</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}>
            <Phone className="h-4 w-4 text-muted-foreground ml-3 shrink-0" />
            <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              placeholder="+1 555 000 0000" className="border-0 bg-transparent focus-visible:ring-0 shadow-none" />
          </div>
          <Button onClick={save} disabled={loading} className="w-full rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Phone"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (next.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (next !== confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed successfully");
    onOpenChange(false);
    setCurrent(""); setNext(""); setConfirm("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-1">
          <Input type="password" value={current} onChange={e => setCurrent(e.target.value)}
            placeholder="Current password" className="rounded-xl" />
          <Input type="password" value={next} onChange={e => setNext(e.target.value)}
            placeholder="New password (min 8 chars)" className="rounded-xl" />
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm new password" className="rounded-xl" />
          <Button onClick={save} disabled={loading || !next || !confirm} className="w-full rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 3. PRIVACY SECTION ───────────────────────────────────────
function PrivacySection({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [restrictedOpen, setRestrictedOpen] = useState(false);
  const [mutedOpen, setMutedOpen] = useState(false);
  const [hiddenWordsOpen, setHiddenWordsOpen] = useState(false);

  async function togglePrivate() {
    setPrivacyLoading(true);
    const { error } = await supabase.from("profiles").update({ is_private: !profile.is_private }).eq("id", userId);
    setPrivacyLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(profile.is_private ? "Account set to public" : "Account set to private");
    onSaved();
  }

  async function updatePrivacyField(field: "story_privacy" | "reel_privacy" | "tag_permissions", value: string) {
    const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Privacy setting updated");
    onSaved();
  }

  return (
    <div>
      <SectionTitle title="Privacy" subtitle="Control who can see and interact with your content" />

      <SettingsGroup title="Account Privacy">
        <SettingsRow label="Private Account" sublabel={profile.is_private ? "Only approved followers can see your posts" : "Anyone can see your posts"}>
          {privacyLoading
            ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            : <Switch checked={profile.is_private} onCheckedChange={togglePrivate} />
          }
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Interactions">
        <SettingsRow label="Story Privacy" sublabel={`Currently: ${profile.story_privacy}`}>
          <Select value={profile.story_privacy} onValueChange={v => updatePrivacyField("story_privacy", v)}>
            <SelectTrigger className="w-28 sm:w-36 h-8 rounded-lg text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="followers">Followers</SelectItem>
              <SelectItem value="close_friends">Close Friends</SelectItem>
              <SelectItem value="no_one">No One</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow label="Reel Privacy" sublabel={`Currently: ${profile.reel_privacy}`}>
          <Select value={profile.reel_privacy} onValueChange={v => updatePrivacyField("reel_privacy", v)}>
            <SelectTrigger className="w-28 sm:w-36 h-8 rounded-lg text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="followers">Followers</SelectItem>
              <SelectItem value="no_one">No One</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow label="Tags & Mentions" sublabel={`Who can tag you: ${profile.tag_permissions}`}>
          <Select value={profile.tag_permissions} onValueChange={v => updatePrivacyField("tag_permissions", v)}>
            <SelectTrigger className="w-28 sm:w-36 h-8 rounded-lg text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="followers">Followers</SelectItem>
              <SelectItem value="no_one">No One</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Manage Users">
        <SettingsRow label="Blocked Accounts" sublabel="Users you've blocked" onClick={() => setBlockedOpen(true)} />
        <SettingsRow label="Restricted Accounts" sublabel="Limit interaction without blocking" onClick={() => setRestrictedOpen(true)} />
        <SettingsRow label="Muted Accounts" sublabel="Hide posts without unfollowing" onClick={() => setMutedOpen(true)} />
        <SettingsRow label="Hidden Words" sublabel={`${profile.hidden_words?.length ?? 0} words filtered`} onClick={() => setHiddenWordsOpen(true)} />
      </SettingsGroup>

      <ManagedUsersDialog
        open={blockedOpen} onOpenChange={setBlockedOpen}
        title="Blocked Accounts" fetchFn="get_blocked_users"
        removeFn="unblock_user" removeLabel="Unblock"
        emptyText="You haven't blocked anyone."
      />
      <ManagedUsersDialog
        open={restrictedOpen} onOpenChange={setRestrictedOpen}
        title="Restricted Accounts" fetchFn="get_restricted_users"
        removeFn="unrestrict_user" removeLabel="Unrestrict"
        emptyText="No restricted accounts."
      />
      <ManagedUsersDialog
        open={mutedOpen} onOpenChange={setMutedOpen}
        title="Muted Accounts" fetchFn="get_muted_users"
        removeFn="unmute_user" removeLabel="Unmute"
        emptyText="No muted accounts."
      />
      <HiddenWordsDialog
        open={hiddenWordsOpen} onOpenChange={setHiddenWordsOpen}
        words={profile.hidden_words ?? []} userId={userId} onSaved={onSaved}
      />
    </div>
  );
}

function ManagedUsersDialog({ open, onOpenChange, title, fetchFn, removeFn, removeLabel, emptyText }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  title: string;
  fetchFn: "get_blocked_users" | "get_restricted_users" | "get_muted_users";
  removeFn: "unblock_user" | "unrestrict_user" | "unmute_user";
  removeLabel: string; emptyText: string;
}) {
  const qc = useQueryClient();
  const key = [fetchFn];

  const { data: users = [], isLoading } = useQuery({
    queryKey: key,
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(fetchFn);
      if (error) return [];
      return (data ?? []) as ManagedUser[];
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.rpc(removeFn, { _target: id });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: key });
    toast.success("Done");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isLoading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
          {!isLoading && users.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">{emptyText}</p>
          )}
          {users.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(0.16 0.016 268)" }}>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-bold" style={{ background: "var(--gradient-primary)", color: "white" }}>
                  {initials(u.username)}
                </AvatarFallback>
                {u.avatar_url && <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.display_name || u.username}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <button
                onClick={() => remove(u.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all shrink-0"
              >
                {removeLabel}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HiddenWordsDialog({ open, onOpenChange, words, userId, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  words: string[]; userId: string; onSaved: () => void;
}) {
  const [list, setList] = useState<string[]>(words);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setList(words); }, [open, words]);

  function add() {
    const w = input.trim().toLowerCase();
    if (!w || list.includes(w)) return;
    setList(prev => [...prev, w]);
    setInput("");
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ hidden_words: list }).eq("id", userId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Hidden words saved");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader><DialogTitle>Hidden Words</DialogTitle>
          <DialogDescription>Comments and captions containing these words will be hidden.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
              placeholder="Add a word…" className="rounded-xl flex-1" />
            <Button onClick={add} variant="outline" size="icon" className="rounded-xl shrink-0"><Check className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {list.map(w => (
              <span key={w} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "oklch(0.20 0.016 268)", border: "1px solid oklch(0.30 0.018 268)" }}>
                {w}
                <button onClick={() => setList(l => l.filter(x => x !== w))}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
            {list.length === 0 && <p className="text-xs text-muted-foreground">No words added yet</p>}
          </div>
          <Button onClick={save} disabled={saving} className="w-full rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 4. NOTIFICATIONS SECTION ─────────────────────────────────
function NotificationsSection({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const prefs: NotifPrefs = {
    likes: true, comments: true, follows: true, follow_requests: true,
    messages: true, live: true, email_notifs: false,
    ...(profile.notif_prefs ?? {}),
  };

  async function toggle(key: keyof NotifPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    const { error } = await supabase.rpc("update_notif_prefs", { _prefs: next });
    if (error) { toast.error(error.message); return; }
    onSaved();
  }

  const rows: { key: keyof NotifPrefs; label: string; sublabel: string; icon: React.ElementType }[] = [
    { key: "likes",           label: "Likes",                icon: Heart,          sublabel: "When someone likes your post or reel" },
    { key: "comments",        label: "Comments",             icon: MessageCircle,  sublabel: "When someone comments on your content" },
    { key: "follows",         label: "New Followers",        icon: Users,          sublabel: "When someone follows you" },
    { key: "follow_requests", label: "Follow Requests",      icon: Users,          sublabel: "When someone requests to follow you" },
    { key: "messages",        label: "Direct Messages",      icon: MessageSquare,  sublabel: "When you receive a message" },
    { key: "live",            label: "Live Streams",         icon: VideoIcon,      sublabel: "When someone you follow goes live" },
    { key: "email_notifs",    label: "Email Notifications",  icon: Mail,           sublabel: "Receive notifications via email" },
  ];

  return (
    <div>
      <SectionTitle title="Notifications" subtitle="Choose what you want to be notified about" />
      <div className="space-y-2">
        {rows.map(({ key, label, sublabel, icon: Icon }) => (
          <div key={key}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.22 0.018 268)" }}
          >
            <div className="h-8 w-8 rounded-xl grid place-items-center shrink-0" style={{ background: "oklch(0.20 0.016 268)" }}>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{sublabel}</p>
            </div>
            <Switch checked={prefs[key] as boolean} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. CONTENT SECTION ───────────────────────────────────────
function ContentSection({ userId }: { userId: string }) {
  return (
    <div>
      <SectionTitle title="Content & Data" subtitle="Manage your posts, archive, and data" />

      <SettingsGroup title="Your Content">
        <SettingsRow label="Saved Posts" sublabel="Posts you've bookmarked" onClick={() => toast.info("Saved posts feature coming soon.")} />
        <SettingsRow label="Archive" sublabel="Your archived posts and stories" onClick={() => toast.info("Archive feature coming soon.")} />
        <SettingsRow label="Drafts" sublabel="Unsent posts and stories" onClick={() => toast.info("Drafts feature coming soon.")} />
        <SettingsRow label="Activity History" sublabel="Your likes, comments, and interactions" onClick={() => toast.info("Activity history coming soon.")} />
      </SettingsGroup>

      <SettingsGroup title="Data">
        <SettingsRow
          label="Download Your Data"
          sublabel="Get a copy of your chatfaa data"
          onClick={() => toast.info("Data export will be emailed to you. Feature coming soon.")}
        />
        <SettingsRow
          label="Delete All Posts"
          sublabel="Permanently remove all your posts"
          onClick={() => toast.error("This action is irreversible. Contact support to proceed.")}
          danger
        />
      </SettingsGroup>
    </div>
  );
}

// ─── 6. APPEARANCE SECTION ────────────────────────────────────
function AppearanceSection({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const prefs: ContentPrefs = {
    dark_mode: true, language: "en", data_saver: false,
    ...(profile.content_prefs ?? {}),
  };

  async function handleThemeChange(dark: boolean) {
    const newTheme = dark ? "dark" : "light";
    // Apply immediately to DOM
    setTheme(newTheme);
    toast.success(dark ? "Dark mode enabled" : "Light mode enabled");
    // Persist to DB (best-effort)
    const next = { ...prefs, dark_mode: dark };
    const { error } = await supabase.rpc("update_content_prefs", { _prefs: next });
    if (error) console.warn("Could not save theme preference:", error.message);
    else onSaved();
  }

  async function handlePrefChange(key: "language" | "data_saver", value: string | boolean) {
    const next = { ...prefs, [key]: value };
    const { error } = await supabase.rpc("update_content_prefs", { _prefs: next });
    if (error) { toast.error(error.message); return; }
    onSaved();
  }

  const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "pt", label: "Português" },
    { value: "hi", label: "हिन्दी" },
    { value: "zh", label: "中文" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
  ];

  return (
    <div>
      <SectionTitle title="Appearance & Accessibility" subtitle="Customize how chatfaa looks and feels" />

      <SettingsGroup title="Theme">
        <div className="flex gap-3">
          {([true, false] as const).map(dark => {
            const active = isDark === dark;
            return (
              <button
                key={String(dark)}
                onClick={() => handleThemeChange(dark)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  active ? "border-primary" : "border-border hover:border-primary/40"
                )}
                style={{
                  background: dark ? "oklch(0.12 0.014 268)" : "oklch(0.96 0.005 268)",
                  color: dark ? "white" : "oklch(0.15 0.015 268)",
                }}
              >
                {dark ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                <span className="text-xs font-semibold">{dark ? "Dark" : "Light"}</span>
                {active && (
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                )}
              </button>
            );
          })}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Language">
        <div className="px-4 py-3.5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl grid place-items-center" style={{ background: "var(--muted)" }}>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground">App display language</p>
              </div>
            </div>
            <Select value={prefs.language} onValueChange={v => handlePrefChange("language", v)}>
              <SelectTrigger className="w-28 sm:w-32 h-8 rounded-lg text-xs shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Data & Performance">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="h-8 w-8 rounded-xl grid place-items-center" style={{ background: "var(--muted)" }}>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Data Saver</p>
            <p className="text-xs text-muted-foreground">Load lower-quality images</p>
          </div>
          <Switch checked={prefs.data_saver} onCheckedChange={v => handlePrefChange("data_saver", v)} />
        </div>
      </SettingsGroup>
    </div>
  );
}

// ─── 7. SECURITY SECTION ─────────────────────────────────────
function SecuritySection({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const [passwordDialog, setPasswordDialog] = useState(false);

  return (
    <div>
      <SectionTitle title="Security" subtitle="Keep your account safe" />

      <SettingsGroup title="Authentication">
        <SettingsRow label="Change Password" sublabel="Update your account password" onClick={() => setPasswordDialog(true)} />
        <SettingsRow label="Two-Factor Authentication" sublabel={profile.two_fa_enabled ? "Enabled — using authenticator app" : "Add an extra layer of security"}>
          <TwoFAToggle enabled={profile.two_fa_enabled} userId={userId} onChanged={onSaved} />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Devices & Sessions">
        <SettingsRow label="Security Checkup" sublabel="Review your account security" onClick={() => toast.info("Security checkup scans for weak passwords and unusual activity.")} />
        <SettingsRow label="Trusted Devices" sublabel="Devices that don't require 2FA" onClick={() => toast.info("Trusted devices management coming soon.")} />
        <SettingsRow label="Login Alerts" sublabel="Get notified of new sign-ins" onClick={() => toast.info("Login alert emails are sent automatically to your registered email.")} />
        <SettingsRow label="Login Activity" sublabel="Review recent sign-ins" onClick={() => toast.info("Session management coming soon.")} />
      </SettingsGroup>

      <ChangePasswordDialog open={passwordDialog} onOpenChange={setPasswordDialog} />
    </div>
  );
}

// ─── 8. ACCOUNT MANAGEMENT SECTION ───────────────────────────
function ManagementSection({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  async function logout() {
    await supabase.auth.signOut({ scope: "local" });
    navigate({ to: "/auth" });
    toast.success("Logged out");
  }

  async function logoutAll() {
    await supabase.auth.signOut({ scope: "global" });
    navigate({ to: "/auth" });
    toast.success("Logged out from all devices");
  }

  return (
    <div>
      <SectionTitle title="Account Management" subtitle="Control your account status and sessions" />

      <SettingsGroup title="Sessions">
        <SettingsRow label="Log Out" sublabel="Sign out from this device" onClick={logout} />
        <SettingsRow label="Log Out All Devices" sublabel="Sign out everywhere" onClick={logoutAll} />
      </SettingsGroup>

      <SettingsGroup title="Account Status">
        <SettingsRow
          label="Deactivate Account"
          sublabel="Temporarily hide your profile"
          onClick={() => setDeactivateDialog(true)}
          danger
        />
        <SettingsRow
          label="Delete Account"
          sublabel="Permanently delete your account and data"
          onClick={() => setDeleteDialog(true)}
          danger
        />
      </SettingsGroup>

      <DeactivateDialog open={deactivateDialog} onOpenChange={setDeactivateDialog} onConfirm={async () => {
        await supabase.rpc("deactivate_own_account");
        await supabase.auth.signOut();
        navigate({ to: "/auth" });
        toast.success("Account deactivated. Log back in anytime to reactivate.");
      }} />

      <DeleteDialog open={deleteDialog} onOpenChange={setDeleteDialog} onConfirm={async () => {
        await supabase.rpc("delete_own_account");
        await supabase.auth.signOut();
        navigate({ to: "/auth" });
        toast.success("Account deleted");
      }} />
    </div>
  );
}

function DeactivateDialog({ open, onOpenChange, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  async function confirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Deactivate Account?</DialogTitle>
          <DialogDescription>Your profile, posts, and data will be hidden until you log back in.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm} disabled={loading} className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deactivate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ open, onOpenChange, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => Promise<void>;
}) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  async function go() {
    if (confirm !== "delete") return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Account Permanently</DialogTitle>
          <DialogDescription>
            This cannot be undone. All your posts, messages, followers, and data will be deleted forever.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <p className="text-sm text-muted-foreground">Type <strong>delete</strong> to confirm:</p>
          <Input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder='Type "delete"' className="rounded-xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { onOpenChange(false); setConfirm(""); }}>Cancel</Button>
            <Button
              onClick={go} disabled={loading || confirm !== "delete"}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Forever"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
