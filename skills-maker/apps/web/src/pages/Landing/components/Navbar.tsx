import { ArrowLeft, LogIn, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { AuthButton } from './AuthButton'

const LOGO_URL =
  'https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png'

type NavbarProps = {
  /** "candidate" (default) shows Outils/Le concept/Espace Coach links. "coach" shows only the "Espace Candidat" return link. */
  variant?: 'candidate' | 'coach'
}

export function Navbar({ variant = 'candidate' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isCoach = variant === 'coach'
  const closeMobile = () => setMobileOpen(false)

  const desktopLinks = isCoach ? (
    <Link to="/" className="flex items-center gap-2 transition-colors hover:text-brand-accent">
      <ArrowLeft className="h-4 w-4" />
      Espace Candidat
    </Link>
  ) : (
    <>
      <a href="#features" className="transition-colors hover:text-brand-accent">
        Outils
      </a>
      <a href="#how-it-works" className="transition-colors hover:text-brand-accent">
        Le concept
      </a>
      <Link to="/coach-landing" className="transition-colors hover:text-brand-accent">
        Espace Coach
      </Link>
    </>
  )

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/10 bg-brand-dark/80 py-4 backdrop-blur-lg'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link to={isCoach ? '/coach-landing' : '/'} className="flex shrink-0 items-center gap-2">
            <img src={LOGO_URL} alt="BNJ Skills Maker" className="h-8 object-contain sm:h-10" />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-white/80 md:flex">
            {desktopLinks}
          </div>

          <div className="hidden md:block">
            {isCoach ? (
              <Link
                to={ROUTES.login}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-accent px-6 py-2.5 text-sm font-extrabold text-brand-dark shadow-xl shadow-brand-accent/20 transition-all hover:-translate-y-0.5 hover:bg-brand-accent/90 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Espace Coach
              </Link>
            ) : (
              <AuthButton className="px-6 py-2.5 text-sm" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/15 md:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex animate-fade-in flex-col bg-brand-dark/95 px-6 pb-10 pt-24 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2 text-lg font-bold text-white">
            {isCoach ? (
              <Link
                to="/"
                onClick={closeMobile}
                className="flex items-center gap-3 border-b border-white/10 py-4 transition-colors hover:text-brand-accent"
              >
                <ArrowLeft className="h-5 w-5" />
                Espace Candidat
              </Link>
            ) : (
              <>
                <a
                  href="#features"
                  onClick={closeMobile}
                  className="border-b border-white/10 py-4 transition-colors hover:text-brand-accent"
                >
                  Outils
                </a>
                <a
                  href="#how-it-works"
                  onClick={closeMobile}
                  className="border-b border-white/10 py-4 transition-colors hover:text-brand-accent"
                >
                  Le concept
                </a>
                <Link
                  to="/coach-landing"
                  onClick={closeMobile}
                  className="border-b border-white/10 py-4 transition-colors hover:text-brand-accent"
                >
                  Espace Coach
                </Link>
              </>
            )}
          </div>

          <div className="mt-auto pt-8">
            {isCoach ? (
              <Link
                to={ROUTES.login}
                onClick={closeMobile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-accent px-6 py-4 text-base font-extrabold text-brand-dark shadow-xl shadow-brand-accent/20 transition-all"
              >
                <LogIn className="h-5 w-5" />
                Accéder à l'espace Coach
              </Link>
            ) : (
              <AuthButton className="w-full py-4 text-base" />
            )}
            <p className="mt-4 text-center text-xs text-white/40">
              BNJ Skills Maker — Une marque de BNJ Team Maker
            </p>
          </div>
        </div>
      )}
    </>
  )
}
