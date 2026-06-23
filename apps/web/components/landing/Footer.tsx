"use client";

import Link from "next/link";

const BNJ_LINKEDIN = "https://www.linkedin.com/company/bnjteammaker/";
const CONTACT_EMAIL = "contact@bnjteammaker.fr";

export function Footer() {
  return (
    <footer className="bg-slate-900 py-12 text-white/50 text-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src="https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png"
              alt="BNJ Skills Maker"
              className="h-8 opacity-80"
            />
            <p className="max-w-xs text-center md:text-left">
              BNJ Skills Maker — L'évolution de votre projet professionnel par
              l'intelligence collective et artificielle.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-white/70">
            <a
              href={BNJ_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-accent transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-brand-accent transition-colors"
            >
              Contact
            </a>
            <Link
              href="/legal"
              className="hover:text-brand-accent transition-colors"
            >
              Mentions légales
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs space-y-1">
          <p>
            © {new Date().getFullYear()} BNJ Skills Maker — Une marque de BNJ
            Team Maker. Tous droits réservés.
          </p>
          {/* <p className="text-white/30">
            Plateforme conçue et développée par Fanilonombana Diana RABEMANANTSOA.
          </p> */}
        </div>
      </div>
    </footer>
  );
}
