"use client";

import { AuthButton } from "@/components/auth/AuthButton";
import { UserPlus, Wand2, Rocket, Trophy } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Inscrivez-vous en 2 secondes",
    desc: "Connectez-vous avec votre compte Google et rejoignez la communauté BNJ.",
  },
  {
    icon: Wand2,
    title: "Créez votre profil IA",
    desc: "Laissez notre assistant intelligent structurer vos expériences et compétences.",
  },
  {
    icon: Rocket,
    title: "Postulez avec précision",
    desc: "Accédez aux offres qui correspondent à votre profil avec un score de matching réaliste.",
  },
  {
    icon: Trophy,
    title: "Décrochez le job idéal",
    desc: "Bénéficiez d'un suivi jusqu'à la signature de votre contrat.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-brand-bg relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Comment ça marche ? <br/>
              <span className="text-brand-primary">C'est simple comme bonjour.</span>
            </h2>
            <div className="space-y-12">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-6 relative">
                  {i !== STEPS.length - 1 && (
                    <div className="absolute top-16 left-8 w-0.5 h-12 bg-slate-200"></div>
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-brand-primary shrink-0 z-10">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 font-medium max-w-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 bg-brand-dark rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 space-y-8 text-center sm:text-left">
              <h3 className="text-3xl font-extrabold text-brand-accent">
                Prêt à passer à l'étape suivante ?
              </h3>
              <p className="text-white/70 text-lg leading-relaxed font-medium">
                Rejoignez des milliers de candidats qui ont transformé leur recherche d'emploi grâce à BNJ Skills Maker.
              </p>
              
              <div className="pt-6">
                <AuthButton variant="white" className="w-full" />
              </div>
              
              <p className="text-xs text-center text-white/40 pt-4">
                Pas de formulaire interminable. Juste vous et votre futur job.
              </p>
            </div>
            
            {/* Minimalist 3D character placeholder/image */}
            <div className="mt-12 flex justify-center">
               <img 
                 src="https://media.licdn.com/dms/image/v2/D5622AQG2y2QW7aWL1g/feedshare-shrink_800/B56Z0v96DOH8Ac-/0/1774626251232?e=1777507200&v=beta&t=Bq8758vFe-HY_jpyDeCi0hArkaZCbaQUk719LKyRInA" 
                 alt="Processus BNJ Skills Maker"
                 className="w-full max-w-[400px] rounded-2xl shadow-xl hover:rotate-1 transition-transform"
               />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
