import { BarChart3, FileText, Search, Sparkles, Target, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: "CV Optimisé par l'IA",
    description:
      'Générez un CV professionnel adapté à votre profil et aux attentes des recruteurs en quelques secondes.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Target,
    title: 'Matching Intelligent',
    description:
      'Ne perdez plus de temps. Identifiez les offres qui vous correspondent vraiment grâce à notre score de compatibilité.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Users,
    title: 'Coaching Personnalisé',
    description:
      'Échangez avec des experts pour préparer vos entretiens et affiner votre stratégie de recherche.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Search,
    title: "Agrégateur d'Offres",
    description:
      "Accédez aux meilleures offres d'Indeed, Welcome to the Jungle et plus encore, centralisées sur un seul dashboard.",
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Suivi de Progression',
    description:
      "Gardez un œil sur vos objectifs et visualisez l'évolution de votre recherche d'emploi en temps réel.",
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: FileText,
    title: 'Ressources Exclusives',
    description:
      "Accédez à une bibliothèque de documents, vidéos et replays d'ateliers pour booster vos compétences.",
    color: 'bg-indigo-100 text-indigo-600',
  },
]

export function Features() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-20 max-w-3xl space-y-4 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-primary">
            Nos outils à votre service
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 lg:text-5xl">
            Une plateforme complète pour votre réussite.
          </p>
          <div className="mx-auto h-1.5 w-20 rounded-full bg-brand-accent" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group cursor-default rounded-[2rem] border border-slate-100 bg-slate-50 p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/5"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-[10deg] ${feature.color}`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-brand-primary">
                {feature.title}
              </h3>
              <p className="font-medium leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
