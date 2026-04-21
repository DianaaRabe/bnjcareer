"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import { Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-brand-dark">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] rounded-full bg-brand-primary/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] rounded-full bg-brand-accent/10 blur-[100px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-brand-accent text-sm font-bold tracking-wide animate-slide-up">
              <Sparkles className="w-4 h-4" />
              L'accompagnement Nouvelle Génération
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] animate-slide-up [animation-delay:100ms]">
              Évoluez avec <span className="text-brand-accent">BNJ Skills Maker</span> et l'IA.
            </h1>
            
            <p className="text-lg lg:text-xl text-white/70 font-medium leading-relaxed max-w-xl animate-slide-up [animation-delay:200ms]">
              Propulsez votre recherche d'emploi grâce à notre plateforme intelligente. Bénéficiez d'un coaching sur mesure soutenu par des algorithmes de pointe.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-slide-up [animation-delay:300ms]">
              <AuthButton className="w-full sm:w-auto" />
              <div className="flex items-center gap-4 px-6 text-white/60 text-sm font-semibold">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-dark bg-slate-200">
                       <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full rounded-full" />
                    </div>
                  ))}
                </div>
                <span>+2k candidats coachés</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 animate-slide-up [animation-delay:400ms]">
              {[
                "Matching IA ultra-précis",
                "Coaching humain & personnalisé",
                "CV générés en 1 clic",
                "Accompagnement 24/7"
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative animate-fade-in [animation-delay:300ms]">
            <div className="relative z-10 w-full max-w-[500px] mx-auto group">
              {/* Image from user reference (Stylized professional) */}
              <img 
                src="https://media.licdn.com/dms/image/v2/D4E22AQFtkrOlgm7JlQ/feedshare-shrink_800/B4EZ0_d7rpGQAc-/0/1774886304804?e=1777507200&v=beta&t=Aac1w54OmNR4Lr3gmmuxUpfMShcgMplLlGt2lLwiJd0" 
                alt="Candidate épanoui BNJ Skills Maker" 
                className="relative z-10 rounded-[2rem] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] border-4 border-white/10"
              />
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 bg-brand-accent p-6 rounded-2xl shadow-xl animate-bounce [animation-duration:3s]">
                 <TrendingUp className="w-8 h-8 text-brand-dark" />
                 <p className="text-[10px] font-black uppercase text-brand-dark mt-2">+40% Succès</p>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl rotate-3">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="text-[10px] font-bold text-slate-400">SESSION COACHING</span>
                 </div>
                 <p className="text-sm font-black text-slate-900 leading-tight">Prochaine séance<br/>disponible !</p>
              </div>
            </div>
            
            {/* Background geometry */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-gradient-to-br from-brand-primary/40 to-transparent rounded-full blur-[80px]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
