"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowRight, ShieldCheck, Video, Users } from "lucide-react";

export default function CoachLandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark overflow-hidden flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20 relative">
        {/* Background glow effects */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-primary/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-light/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/20 border border-brand-primary/30 mb-6 text-brand-accent text-sm font-bold tracking-wide">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent"></span>
                </span>
                PORTAIL COACH
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Devenez le mentor qui propulse les <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-light font-black">talents de demain.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto lg:mx-0">
                Aidez nos candidats à se démarquer. Partagez votre expertise, optimisez leur employabilité et faites grandir votre réseau sur la plateforme BNJ Skills Maker.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/coach-login"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-accent text-brand-dark rounded-xl font-black text-lg shadow-xl shadow-brand-accent/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Devenir Coach
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://calendly.com/benjaminparienty/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  Plus d'informations
                </a>
              </div>
            </div>

            {/* Graphic / Image Content */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl xl:scale-110 xl:origin-left">
                {/* Provided LinkedIn Image */}
                <img 
                  src="https://media.licdn.com/dms/image/v2/D4E22AQHTFouR7M_Kdg/feedshare-shrink_800/B4EZ2V1uYUIcAc-/0/1776335382395?e=1778112000&v=beta&t=kc7Mc5SCCKS2GR2F-QVpxQA9wy7JHkxH11IDNxALQhc" 
                  alt="Devenir Coach BNJ" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay gradient at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-dark to-transparent pointer-events-none"/>
              </div>

              {/* Floating feature badgets */}
              <div className="absolute -left-6 bottom-16 bg-brand-dark/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 animate-float-slow">
                <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">100% Qualifié</p>
                  <p className="text-white/50 text-xs">Candidats vérifiés</p>
                </div>
              </div>

              <div className="absolute -right-8 top-24 bg-brand-dark/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 animate-float-delayed">
                <div className="bg-brand-primary p-2 rounded-lg text-brand-light border border-brand-light/30">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Sessions 1:1</p>
                  <p className="text-white/50 text-xs">Tableau de bord IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
