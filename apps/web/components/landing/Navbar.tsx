"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";
import { ArrowLeft, LogIn, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NavbarProps {
  /** "candidate" (default) shows Outils/Le concept/Espace Coach links. "coach" shows only the "Espace Candidat" return link. */
  variant?: "candidate" | "coach";
}

export function Navbar({ variant = "candidate" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isCoach = variant === "coach";
  const closeMobile = () => setMobileOpen(false);

  // Reusable nav links for both desktop and mobile drawer
  const desktopLinks = isCoach ? (
    <Link href="/" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
      <ArrowLeft className="w-4 h-4" />
      Espace Candidat
    </Link>
  ) : (
    <>
      <a href="#features" className="hover:text-brand-accent transition-colors">Outils</a>
      <a href="#how-it-works" className="hover:text-brand-accent transition-colors">Le concept</a>
      <Link href="/coach-landing" className="hover:text-brand-accent transition-colors">Espace Coach</Link>
    </>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-brand-dark/80 backdrop-blur-lg py-4 border-b border-white/10" : "bg-transparent py-6"
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href={isCoach ? "/coach-landing" : "/"} className="flex items-center gap-2 shrink-0">
            <img
              src="https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png"
              alt="BNJ Skills Maker"
              className="h-8 sm:h-10 object-contain"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-white/80 font-bold text-sm">
            {desktopLinks}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            {isCoach ? (
              <Link
                href="/coach-login"
                className="inline-flex items-center gap-2 bg-brand-accent text-brand-dark hover:bg-brand-accent/90 font-extrabold py-2.5 px-6 rounded-2xl text-sm transition-all shadow-xl shadow-brand-accent/20 hover:-translate-y-0.5 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Espace Coach
              </Link>
            ) : (
              <AuthButton className="py-2.5 px-6 text-sm" />
            )}
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-brand-dark/95 backdrop-blur-xl pt-24 px-6 pb-10 flex flex-col animate-fade-in">
          <div className="flex flex-col gap-2 text-white text-lg font-bold">
            {isCoach ? (
              <Link
                href="/"
                onClick={closeMobile}
                className="flex items-center gap-3 py-4 border-b border-white/10 hover:text-brand-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Espace Candidat
              </Link>
            ) : (
              <>
                <a
                  href="#features"
                  onClick={closeMobile}
                  className="py-4 border-b border-white/10 hover:text-brand-accent transition-colors"
                >
                  Outils
                </a>
                <a
                  href="#how-it-works"
                  onClick={closeMobile}
                  className="py-4 border-b border-white/10 hover:text-brand-accent transition-colors"
                >
                  Le concept
                </a>
                <Link
                  href="/coach-landing"
                  onClick={closeMobile}
                  className="py-4 border-b border-white/10 hover:text-brand-accent transition-colors"
                >
                  Espace Coach
                </Link>
              </>
            )}
          </div>

          {/* Mobile CTA at bottom */}
          <div className="mt-auto pt-8">
            {isCoach ? (
              <Link
                href="/coach-login"
                onClick={closeMobile}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-accent text-brand-dark hover:bg-brand-accent/90 font-extrabold py-4 px-6 rounded-2xl text-base transition-all shadow-xl shadow-brand-accent/20"
              >
                <LogIn className="w-5 h-5" />
                Accéder à l'espace Coach
              </Link>
            ) : (
              <AuthButton className="w-full py-4 text-base" />
            )}
            <p className="text-white/40 text-xs text-center mt-4">
              BNJ Skills Maker — Une marque de BNJ Team Maker
            </p>
          </div>
        </div>
      )}
    </>
  );
}
