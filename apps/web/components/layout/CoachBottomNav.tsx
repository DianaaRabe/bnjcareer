"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
} from "lucide-react";

const COACH_NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Accueil", href: "/coach" },
  { icon: Users, label: "Candidats", href: "/coach/candidates" },
  { icon: Calendar, label: "Sessions", href: "/coach/calendar" },
  { icon: MessageSquare, label: "Messages", href: "/coach/messages" },
  { icon: BookOpen, label: "Ressources", href: "/coach/resources" },
];

export function CoachBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-dark border-t border-white/10 flex items-center justify-around px-2 py-2 pb-safe">
      {COACH_NAV_ITEMS.map((item) => {
        const active =
          item.href === "/coach"
            ? pathname === "/coach"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 ${
              active ? "text-brand-accent" : "text-white/50 hover:text-white/80"
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${active ? "drop-shadow-sm" : ""}`} />
            <span className="text-[10px] font-medium truncate">{item.label}</span>
            {active && (
              <span className="w-1 h-1 rounded-full bg-brand-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
