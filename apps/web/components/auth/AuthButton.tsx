"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AuthButton({
  className = "",
  variant = "primary",
  label,
  href = "/login",
}: {
  className?: string;
  variant?: "primary" | "outline" | "white";
  label?: string;
  href?: string;
}) {
  const variants = {
    primary:
      "bg-brand-accent text-brand-dark hover:bg-brand-accent/90 shadow-brand-accent/20",
    outline:
      "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 shadow-brand-primary/10",
    white:
      "bg-white text-brand-primary hover:bg-slate-50 shadow-white/20",
  };

  return (
    <Link
      href={href}
      className={`relative group overflow-hidden font-extrabold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 active:scale-95 ${variants[variant]} ${className}`}
    >
      <span>{label || "Commencer"}</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
