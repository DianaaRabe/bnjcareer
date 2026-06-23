"use client";

import { motion } from "motion/react";

// ─── Testimonial data ─────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Ravo Andriamanantena",
    role: "Développeur Frontend",
    quote:
      "J'ai décroché mon premier emploi au Canada grâce au matching intelligent. Le scoring d'éligibilité PEQ m'a permis de cibler les bonnes offres.",
    avatar: "RA",
    color: "bg-yellow-400",
  },
  {
    name: "Niry Rakotoarisoa",
    role: "Comptable diplômée",
    quote:
      "L'optimisation CV a fait la différence. Mon score ATS est passé de 42 à 91 en quelques minutes. J'ai reçu 3 entretiens en une semaine.",
    avatar: "NR",
    color: "bg-indigo-500",
  },
  {
    name: "Hery Rasolofo",
    role: "Ingénieur en reconversion",
    quote:
      "Les ateliers coaching m'ont aidé à préparer mes entretiens techniques. Le formateur était vraiment à l'écoute de mes besoins spécifiques.",
    avatar: "HR",
    color: "bg-emerald-500",
  },
  {
    name: "Fanja Ramanantsoa",
    role: "Étudiante en Master",
    quote:
      "Centraliser Indeed, LinkedIn et le Guichet Emplois en un seul endroit m'a fait gagner un temps fou. L'interface est vraiment intuitive.",
    avatar: "FR",
    color: "bg-rose-500",
  },
  {
    name: "Tiana Razafimahefa",
    role: "Chef de projet IT",
    quote:
      "Le chatbot IA répond à mes questions 24h/24. C'est comme avoir un conseiller carrière personnel toujours disponible.",
    avatar: "TR",
    color: "bg-sky-500",
  },
  {
    name: "Voahirana Randria",
    role: "Coach certifiée",
    quote:
      "En tant que coach, la plateforme me permet de gérer mes ateliers et de suivre mes candidats efficacement. L'outil de facturation est un plus.",
    avatar: "VR",
    color: "bg-orange-500",
  },
];

// ─── Partner logos ────────────────────────────────────────────────────────────

const partners = [
  "Indeed",
  "LinkedIn",
  "Guichet Emplois",
  "Université d'Antananarivo",
  "Alliance Française",
  "CNAPS",
];

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition-all hover:border-neutral-700 hover:bg-neutral-900/80"
    >
      <div className="flex items-center gap-3">
        <div
          className={`${testimonial.color} flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white`}
        >
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="text-xs text-neutral-500">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-neutral-300">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      {/* Stars */}
      <div className="flex gap-0.5 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SocialProof() {
  return (
    <section className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        {/* Partners marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-neutral-500">
            Ils nous font confiance
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

            <div className="flex animate-marquee items-center gap-12 whitespace-nowrap">
              {[...partners, ...partners].map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="text-lg font-bold text-neutral-600 transition-colors hover:text-neutral-400"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ce que disent{" "}
            <span className="text-yellow-400">nos utilisateurs</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-neutral-400">
            Des centaines de candidats et coachs utilisent déjà Collectif 95:59
            pour accélérer leur carrière.
          </p>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
