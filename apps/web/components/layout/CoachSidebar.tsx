"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  User,
  ChevronRight,
  LogOut,
} from "lucide-react";

const COACH_NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/coach" },
  { icon: Users, label: "Candidats", href: "/coach/candidates" },
  { icon: Calendar, label: "Sessions", href: "/coach/calendar" },
  { icon: MessageSquare, label: "Messages", href: "/coach/messages" },
  { icon: BookOpen, label: "Ressources", href: "/coach/resources" },
  { icon: User, label: "Mon Profil", href: "/coach/profile" },
];

interface CoachSidebarProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export function CoachSidebar({ fullName, email, avatarUrl }: CoachSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-brand-dark fixed top-0 left-0 z-40 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <img
          src="https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png"
          alt="BNJ Skills Maker"
          className="h-10 object-contain"
        />
        <div className="mt-2 text-[10px] font-bold text-brand-accent uppercase tracking-wider">
          Portail Coach
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {COACH_NAV_ITEMS.map((item) => {
          const active =
            item.href === "/coach"
              ? pathname === "/coach"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${active
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? "text-brand-accent" : ""
                  }`}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <ChevronRight className="w-4 h-4 ml-auto text-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-light to-brand-accent flex items-center justify-center text-sm font-bold text-brand-dark shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <Link href="/coach/profile" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <p className="text-white text-sm font-semibold truncate">{fullName}</p>
            <p className="text-white/50 text-xs truncate font-medium">Coach / Formateur</p>
          </Link>
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="text-white/40 hover:text-white/80 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
