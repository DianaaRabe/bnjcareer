"use client";

import { motion } from "motion/react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

// ─── Plan data ────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "yearly";

interface Plan {
  name: string;
  description: string;
  price: { monthly: string; yearly: string };
  priceNote?: { monthly?: string; yearly?: string };
  highlight?: boolean;
  badge?: string;
  cta: string;
  features: { text: string; included: boolean }[];
}

const plans: Plan[] = [
  {
    name: "Découverte",
    description: "Pour explorer la plateforme et commencer à postuler.",
    price: { monthly: "0", yearly: "0" },
    priceNote: { monthly: "Gratuit pour toujours" },
    cta: "Créer un compte",
    features: [
      { text: "Accès aux offres Indeed & LinkedIn", included: true },
      { text: "5 recherches / jour", included: true },
      { text: "Profil candidat basique", included: true },
      { text: "Chatbot IA (limité)", included: true },
      { text: "Optimisation CV", included: false },
      { text: "Matching poste & immigration", included: false },
      { text: "Accès formations & ateliers", included: false },
      { text: "Messagerie coachs", included: false },
    ],
  },
  {
    name: "Essentiel",
    description: "L'essentiel pour optimiser sa recherche d'emploi.",
    price: { monthly: "9 900", yearly: "7 900" },
    priceNote: { yearly: "soit 94 800 Ar/an" },
    highlight: true,
    badge: "Populaire",
    cta: "Choisir Essentiel",
    features: [
      { text: "Tout de Découverte", included: true },
      { text: "Recherches illimitées", included: true },
      { text: "Optimisation CV ATS (illimité)", included: true },
      { text: "Matching poste intelligent", included: true },
      { text: "Guichet Emplois Canada", included: true },
      { text: "Chatbot IA complet", included: true },
      { text: "Accès aux ressources", included: true },
      { text: "Messagerie coachs", included: false },
    ],
  },
  {
    name: "Premium",
    description: "Accompagnement complet avec coaching personnalisé.",
    price: { monthly: "24 900", yearly: "19 900" },
    priceNote: { yearly: "soit 238 800 Ar/an" },
    cta: "Choisir Premium",
    features: [
      { text: "Tout d'Essentiel", included: true },
      { text: "Éligibilité immigration (PEQ, PSTQ)", included: true },
      { text: "Messagerie directe coachs", included: true },
      { text: "Accès formations & ateliers", included: true },
      { text: "CV multi-templates (Canada, Europass…)", included: true },
      { text: "Lettre de motivation IA", included: true },
      { text: "Priorité support", included: true },
      { text: "Sessions coaching 1-to-1 (2/mois)", included: true },
    ],
  },
];

const coachPlan: Plan = {
  name: "Coach / Formateur",
  description:
    "Pour les professionnels certifiés qui accompagnent les candidats.",
  price: { monthly: "0", yearly: "0" },
  priceNote: { monthly: "Commission sur revenus générés" },
  cta: "Devenir coach partenaire",
  features: [
    { text: "Création & gestion d'ateliers", included: true },
    { text: "Publication de formations", included: true },
    { text: "Gestion de vos candidats", included: true },
    { text: "Messagerie intégrée", included: true },
    { text: "Tableau de bord revenus", included: true },
    { text: "Partage de ressources", included: true },
    { text: "Chatbot IA assistant", included: true },
    { text: "Visibilité plateforme", included: true },
  ],
};

// ─── Price card component ─────────────────────────────────────────────────────

function PriceCard({
  plan,
  billing,
  index,
}: {
  plan: Plan;
  billing: BillingCycle;
  index: number;
}) {
  const price = plan.price[billing];
  const note = plan.priceNote?.[billing] ?? plan.priceNote?.monthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
        plan.highlight
          ? "border-yellow-400/50 bg-neutral-900/90 shadow-xl shadow-yellow-400/5"
          : "border-neutral-800 bg-neutral-900/60"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-black">
          {plan.badge}
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
        <p className="mt-1 text-sm text-neutral-400">{plan.description}</p>
      </div>

      <div className="mb-6">
        {price === "0" ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">Gratuit</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">{price}</span>
            <span className="text-sm text-neutral-400">Ar/mois</span>
          </div>
        )}
        {note && (
          <p className="mt-1 text-xs text-neutral-500">{note}</p>
        )}
      </div>

      <a
        href="/signup"
        className={`mb-6 block rounded-xl px-4 py-3 text-center text-sm font-bold transition-all ${
          plan.highlight
            ? "bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20"
            : "bg-neutral-800 text-white hover:bg-neutral-700"
        }`}
      >
        {plan.cta}
      </a>

      <ul className="flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            {f.included ? (
              <IconCheck
                size={16}
                className="mt-0.5 shrink-0 text-yellow-400"
                stroke={2.5}
              />
            ) : (
              <IconX
                size={16}
                className="mt-0.5 shrink-0 text-neutral-600"
                stroke={2}
              />
            )}
            <span
              className={
                f.included ? "text-neutral-300" : "text-neutral-600"
              }
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <section className="relative bg-black pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Des tarifs <span className="text-yellow-400">adaptés</span> à
            chaque parcours
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-400 sm:text-lg">
            Commencez gratuitement, évoluez quand vous êtes prêt. Tous les prix
            sont en Ariary malgache (MGA).
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              billing === "monthly"
                ? "bg-yellow-400 text-black"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              billing === "yearly"
                ? "bg-yellow-400 text-black"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            Annuel
            <span className="ml-1.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
              -20%
            </span>
          </button>
        </div>

        {/* Candidate plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} billing={billing} index={i} />
          ))}
        </div>

        {/* Separator */}
        <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

        {/* Coach plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Vous êtes <span className="text-yellow-400">coach</span> ou{" "}
            <span className="text-yellow-400">formateur</span> ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-neutral-400">
            Rejoignez notre réseau de professionnels et monétisez votre
            expertise auprès de candidats motivés.
          </p>
        </motion.div>

        <div className="mx-auto max-w-md">
          <PriceCard plan={coachPlan} billing={billing} index={0} />
        </div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-neutral-500">
            Une question sur nos tarifs ?{" "}
            <a
              href="mailto:contact@collectif9559.com"
              className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
            >
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
