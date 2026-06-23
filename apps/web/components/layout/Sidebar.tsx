"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Calendar,
  MessageSquare,
  BookOpen,
  CreditCard,
  User,
  Users,
  ChevronRight,
  LogOut,
  GraduationCap,
  Star,
} from "lucide-react";
import { useTenant } from "@/lib/tenant/context";
import type { TenantFeatures } from "@/tenants/types";

// ─── Nav items ─────────────────────────────────────────────────────────────────

const ALL_NAV_ITEMS: {
  icon: React.ElementType
  label: string
  href: string
  feature?: keyof TenantFeatures
}[] = [
  { icon: LayoutDashboard, label: "Tableau de bord",  href: "/dashboard" },
  { icon: FileText,        label: "Mon CV",            href: "/dashboard/cv",           feature: "cvOptimizer" },
  { icon: Briefcase,       label: "Offres d'emploi",   href: "/dashboard/scrapper" },
  { icon: Target,          label: "Matching IA",        href: "/dashboard/jobs" },
  { icon: Calendar,        label: "Accompagnement",     href: "/dashboard/coaching",    feature: "coaching" },
  { icon: GraduationCap,   label: "Formations",         href: "/dashboard/formations",  feature: "formations" },
  { icon: Users,           label: "Recherche Coachs",   href: "/dashboard/coaches",     feature: "coaching" },
  { icon: MessageSquare,   label: "Messages",            href: "/dashboard/messages",    feature: "messaging" },
  { icon: BookOpen,        label: "Ressources",          href: "/dashboard/ressources",  feature: "resources" },
  { icon: CreditCard,      label: "Abonnements",         href: "/dashboard/subscriptions" },
  { icon: User,            label: "Mon Profil",          href: "/dashboard/profile" },
];

// Label overrides per tenant — lets each community feel distinct without
// touching individual components. Keep the same href as the key.
const NAV_LABEL_OVERRIDES: Record<string, Partial<Record<string, string>>> = {
  community: {
    "/dashboard/scrapper":      "Opportunités",
    "/dashboard/cv":            "Mon Dossier",
    "/dashboard/coaching":      "Mon Parcours",
    "/dashboard/coaches":       "Nos Coachs",
    "/dashboard/ressources":    "Bibliothèque",
    "/dashboard/formations":    "Formations",
    "/dashboard/subscriptions": "Mon Abonnement",
  },
};

// ─── Logo / Brand mark ────────────────────────────────────────────────────────

function SidebarBrand({ logo, name, tagline }: { logo: string; name: string; tagline: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="h-10 object-contain max-w-[180px]"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    );
  }

  // Tenants without a logo file get a styled text mark
  // Designed for the Community premium feel: gold monogram + name + tagline
  const initials = name.replace('BNJ ', '').slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Monogram badge */}
      <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center shrink-0 shadow-inner">
        <Star className="w-4 h-4 text-brand-accent" strokeWidth={1.5} />
      </div>
      {/* Text */}
      <div className="min-w-0">
        <p className="text-white font-black text-sm leading-tight tracking-tight truncate">{name}</p>
        <p className="text-brand-accent/80 text-[10px] font-medium leading-tight truncate mt-0.5">{tagline}</p>
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

interface SidebarProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export function Sidebar({ fullName, email, avatarUrl }: SidebarProps) {
  const pathname = usePathname();
  const { branding, features, id: tenantId } = useTenant();

  const labelOverrides = NAV_LABEL_OVERRIDES[tenantId] ?? {};

  // Filter nav items based on enabled features
  const navItems = ALL_NAV_ITEMS.filter(item =>
    !item.feature || features[item.feature as keyof typeof features]
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-brand-dark fixed top-0 left-0 z-40 shadow-2xl">
      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-white/10">
        <SidebarBrand
          logo={branding.logo}
          name={branding.name}
          tagline={branding.tagline}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const label = labelOverrides[item.href] ?? item.label;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                active
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  active ? "text-brand-accent" : ""
                }`}
              />
              <span className="truncate">{label}</span>
              {active && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-brand-accent/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-sm font-black text-brand-accent shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <Link href="/dashboard/profile" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <p className="text-white text-sm font-semibold truncate">{fullName}</p>
            <p className="text-white/40 text-xs truncate">{email}</p>
          </Link>
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="text-white/30 hover:text-red-400 transition-colors p-1"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
