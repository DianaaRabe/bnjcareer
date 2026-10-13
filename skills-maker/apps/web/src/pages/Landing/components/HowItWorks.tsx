import { Rocket, Trophy, UserPlus, Wand2 } from 'lucide-react'

import { AuthButton } from './AuthButton'

const STEPS = [
  {
    icon: UserPlus,
    title: 'Inscrivez-vous en 2 secondes',
    desc: 'Créez votre compte en quelques clics et rejoignez la communauté BNJ.',
  },
  {
    icon: Wand2,
    title: 'Créez votre profil IA',
    desc: 'Laissez notre assistant intelligent structurer vos expériences et compétences.',
  },
  {
    icon: Rocket,
    title: 'Postulez avec précision',
    desc: 'Accédez aux offres qui correspondent à votre profil avec un score de matching réaliste.',
  },
  {
    icon: Trophy,
    title: 'Décrochez le job idéal',
    desc: "Bénéficiez d'un suivi jusqu'à la signature de votre contrat.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-brand-bg py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-extrabold leading-tight text-slate-900 lg:text-5xl">
              Comment ça marche ? <br />
              <span className="text-brand-primary">C'est simple comme bonjour.</span>
            </h2>
            <div className="space-y-12">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative flex gap-6">
                  {i !== STEPS.length - 1 && (
                    <div className="absolute left-8 top-16 h-12 w-0.5 bg-slate-200" />
                  )}
                  <div className="z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-lg">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">{step.title}</h3>
                    <p className="max-w-sm font-medium text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[3rem] bg-brand-dark p-12 text-white shadow-2xl">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-accent/20 blur-[80px]" />

            <div className="relative z-10 space-y-8 text-center sm:text-left">
              <h3 className="text-3xl font-extrabold text-brand-accent">
                Prêt à passer à l'étape suivante ?
              </h3>
              <p className="text-lg font-medium leading-relaxed text-white/70">
                Rejoignez des milliers de candidats qui ont transformé leur recherche d'emploi grâce
                à BNJ Skills Maker.
              </p>

              <div className="pt-6">
                <AuthButton variant="white" className="w-full" />
              </div>

              <p className="pt-4 text-center text-xs text-white/40">
                Inscription gratuite. Juste vous et votre futur job.
              </p>
            </div>

            <div className="mt-12 flex justify-center">
              <img
                src="/illustrations/BNJ-landing-2.jpeg"
                alt="Processus BNJ Skills Maker"
                className="w-full max-w-[400px] rounded-2xl shadow-xl transition-transform hover:rotate-1"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
