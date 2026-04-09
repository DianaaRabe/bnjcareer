"use client";

import { 
  FileText, 
  Search, 
  Users, 
  Sparkles, 
  Target, 
  BarChart3 
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "CV Optimisé par l'IA",
    description: "Générez un CV professionnel adapté à votre profil et aux attentes des recruteurs en quelques secondes.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Target,
    title: "Matching Intelligent",
    description: "Ne perdez plus de temps. Identifiez les offres qui vous correspondent vraiment grâce à notre score de compatibilité.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Users,
    title: "Coaching Personnalisé",
    description: "Échangez avec des experts pour préparer vos entretiens et affiner votre stratégie de recherche.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Search,
    title: "Agrégateur d'Offres",
    description: "Accédez aux meilleures offres d'Indeed, Welcome to the Jungle et plus encore, centralisées sur un seul dashboard.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: BarChart3,
    title: "Suivi de Progression",
    description: "Gardez un œil sur vos objectifs et visualisez l'évolution de votre recherche d'emploi en temps réel.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: FileText,
    title: "Ressources Exclusives",
    description: "Accédez à une bibliothèque de documents, vidéos et replays d'ateliers pour booster vos compétences.",
    color: "bg-indigo-100 text-indigo-600",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-brand-primary font-bold text-sm tracking-widest uppercase">
            Nos outils à votre service
          </h2>
          <p className="text-3xl lg:text-5xl font-extrabold text-slate-900">
            Une plateforme complète pour votre réussite.
          </p>
          <div className="w-20 h-1.5 bg-brand-accent mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <div 
              key={feature.title} 
              className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 cursor-default hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-[10deg] ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
