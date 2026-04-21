"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-brand-dark/80 backdrop-blur-lg py-4 border-b border-white/10" : "bg-transparent py-6"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png" 
            alt="BNJ Skills Maker" 
            className="h-10 object-contain"
          />
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-white/80 font-bold text-sm">
          <a href="#features" className="hover:text-brand-accent transition-colors">Outils</a>
          <a href="#how-it-works" className="hover:text-brand-accent transition-colors">Le concept</a>
          <Link href="/coach-landing" className="hover:text-brand-accent transition-colors">Espace Coach</Link>
        </div>

        <div>
          <AuthButton className="py-2.5 px-6 text-sm" />
        </div>
      </div>
    </nav>
  );
}
