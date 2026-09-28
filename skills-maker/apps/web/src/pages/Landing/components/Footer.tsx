import { Link } from 'react-router-dom'

const LOGO_URL =
  'https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png'
const BNJ_LINKEDIN = 'https://www.linkedin.com/company/bnjteammaker/'
const CONTACT_EMAIL = 'contact@bnjteammaker.fr'

export function Footer() {
  return (
    <footer className="bg-slate-900 py-12 text-sm text-white/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <img src={LOGO_URL} alt="BNJ Skills Maker" className="h-8 opacity-80" />
            <p className="max-w-xs text-center md:text-left">
              BNJ Skills Maker — L'évolution de votre projet professionnel par l'intelligence
              collective et artificielle.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/70 md:gap-8">
            <a
              href={BNJ_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brand-accent"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="transition-colors hover:text-brand-accent"
            >
              Contact
            </a>
            <Link to="/legal" className="transition-colors hover:text-brand-accent">
              Mentions légales
            </Link>
          </div>
        </div>

        <div className="mt-12 space-y-1 border-t border-white/5 pt-8 text-center text-xs">
          <p>
            © {new Date().getFullYear()} BNJ Skills Maker — Une marque de BNJ Team Maker. Tous
            droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
