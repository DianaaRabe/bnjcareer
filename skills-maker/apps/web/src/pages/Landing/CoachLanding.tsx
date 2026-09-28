import { ArrowRight, ShieldCheck, Video } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'

const CALENDLY_URL = 'https://calendly.com/benjaminparienty/30min'

export function CoachLanding() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-brand-dark font-sans">
      <Navbar variant="coach" />

      <main className="relative flex-1 pb-20 pt-24">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute left-10 top-20 h-96 w-96 rounded-full bg-brand-primary/40 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-80 w-80 rounded-full bg-brand-light/20 blur-[80px]" />

        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
            {/* Text Content */}
            <div className="z-10 flex-1 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/20 px-4 py-2 text-sm font-bold tracking-wide text-brand-accent">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-accent" />
                </span>
                PORTAIL COACH
              </div>

              <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
                Devenez le mentor qui propulse les{' '}
                <span className="bg-gradient-to-r from-brand-accent to-brand-light bg-clip-text font-black text-transparent">
                  talents de demain.
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/70 md:text-xl lg:mx-0">
                Aidez nos candidats à se démarquer. Partagez votre expertise, optimisez leur
                employabilité et faites grandir votre réseau sur la plateforme BNJ Skills Maker.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  to={ROUTES.login}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-8 py-4 text-lg font-black text-brand-dark shadow-xl shadow-brand-accent/20 transition-all hover:scale-[1.02] sm:w-auto"
                >
                  Devenir Coach
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10 sm:w-auto"
                >
                  Plus d'informations
                </a>
              </div>
            </div>

            {/* Graphic / Image Content */}
            <div className="relative z-10 w-full max-w-lg flex-1 lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl xl:origin-left xl:scale-110">
                <img
                  src="/illustrations/BNJ-coach-landing-2.jpg"
                  alt="Devenir Coach BNJ"
                  className="h-full w-full transform object-cover object-top transition-transform duration-700 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-dark to-transparent" />
              </div>

              {/* Floating feature badges */}
              <div className="absolute -left-6 bottom-16 flex animate-float-slow items-center gap-3 rounded-xl border border-white/10 bg-brand-dark/90 p-4 shadow-xl backdrop-blur-md">
                <div className="rounded-lg bg-green-500/20 p-2 text-green-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">100% Qualifié</p>
                  <p className="text-xs text-white/50">Candidats vérifiés</p>
                </div>
              </div>

              <div className="absolute -right-8 top-24 flex animate-float-delayed items-center gap-3 rounded-xl border border-white/10 bg-brand-dark/90 p-4 shadow-xl backdrop-blur-md">
                <div className="rounded-lg border border-brand-light/30 bg-brand-primary p-2 text-brand-light">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sessions 1:1</p>
                  <p className="text-xs text-white/50">Tableau de bord IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
