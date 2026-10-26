import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'

import { AuthButton } from './AuthButton'

const BENEFITS = [
  'Matching IA ultra-précis',
  'Coaching humain & personnalisé',
  'CV générés en 1 clic',
  'Accompagnement 24/7',
]

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-brand-dark pb-32 pt-28">
      {/* Decorative blobs */}
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-[500px] w-[500px] animate-pulse rounded-full bg-brand-primary/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-[400px] w-[400px] rounded-full bg-brand-accent/10 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Left Content */}
          <div className="max-w-2xl flex-1 animate-fade-in space-y-8 text-center lg:text-left">
            <div className="inline-flex animate-slide-up items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold tracking-wide text-brand-accent backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              L'accompagnement Nouvelle Génération
            </div>

            <h1 className="animate-slide-up text-5xl font-extrabold leading-[1.1] text-white [animation-delay:100ms] lg:text-7xl">
              Évoluez avec <span className="text-brand-accent">BNJ Skills Maker</span> et l'IA.
            </h1>

            <p className="max-w-xl animate-slide-up text-lg font-medium leading-relaxed text-white/70 [animation-delay:200ms] lg:text-xl">
              Propulsez votre recherche d'emploi grâce à notre plateforme intelligente. Bénéficiez
              d'un coaching sur mesure soutenu par des algorithmes de pointe.
            </p>

            <div className="flex animate-slide-up flex-col items-center gap-4 pt-4 [animation-delay:300ms] sm:flex-row">
              <AuthButton className="w-full sm:w-auto" />
              <div className="flex items-center gap-4 px-6 text-sm font-semibold text-white/60">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-brand-dark bg-slate-200"
                    >
                      <img
                        src={`https://i.pravatar.cc/100?u=${i}`}
                        alt=""
                        className="h-full w-full rounded-full"
                      />
                    </div>
                  ))}
                </div>
                <span>+2k candidats coachés</span>
              </div>
            </div>

            <div className="grid animate-slide-up grid-cols-1 gap-4 pt-8 [animation-delay:400ms] sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-white/80">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex-1 animate-fade-in [animation-delay:300ms]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-primary/40 to-transparent blur-[80px]" />

            <div className="group relative z-10 mx-auto w-full max-w-[500px] animate-float">
              <img
                src="/illustrations/BNJ-landing-1.jpeg"
                alt="Candidate épanoui BNJ Skills Maker"
                className="relative z-10 rounded-[2rem] border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />

              <div className="absolute -right-3 -top-3 z-20 animate-float-delayed rounded-xl bg-brand-accent p-3 shadow-xl sm:-right-6 sm:-top-6 sm:rounded-2xl sm:p-6">
                <TrendingUp className="h-5 w-5 text-brand-dark sm:h-8 sm:w-8" />
                <p className="mt-1 text-[9px] font-black uppercase text-brand-dark sm:mt-2 sm:text-[10px]">
                  +40% Succès
                </p>
              </div>

              <div className="absolute -bottom-3 -left-3 z-20 animate-wobble rounded-xl bg-white p-3 shadow-xl sm:-bottom-6 sm:-left-6 sm:rounded-2xl sm:p-6">
                <div className="mb-1 flex items-center gap-2 sm:mb-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span className="text-[9px] font-bold text-slate-400 sm:text-[10px]">
                    SESSION COACHING
                  </span>
                </div>
                <p className="text-xs font-black leading-tight text-slate-900 sm:text-sm">
                  Prochaine séance
                  <br />
                  disponible !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
