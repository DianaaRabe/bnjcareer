"use client";

// ─────────────────────────────────────────────────────────────────────────────
// BNJ Community Landing Page
//
// Identity: réseau professionnel privé · premium · chaleureux · communautaire
// Inspiration: LinkedIn Premium × Alumni Network × Cabinet de recrutement haut de gamme
//
// Palette:
//   Navy     #0F172A  (backgrounds, depth)
//   Blue     #1E3A8A  (brand primary)
//   Gold     #D4AF37  (accent, warmth, premium)
//   Ivory    #F8FAFC  (clean sections, space)
//   Sand     #EAD7B7  (warm tint)
//
// Typography: DM Serif Display (injected via layout.tsx for this tenant)
//   → applied on h1/h2 via [data-tenant="community"] CSS rule in globals.css
//   → inline style fallback where needed for more control
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";
import {
  Users, BookOpen, Briefcase, ArrowRight, Star,
  ChevronDown, CheckCircle, Network, GraduationCap, MessageSquare,
} from "lucide-react";

// ─── Shared styles ────────────────────────────────────────────────────────────

const SERIF: React.CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, 'Times New Roman', serif",
  fontWeight: 400,
};

const GOLD = "#D4AF37";
const NAVY = "#0F172A";
const BLUE = "#1E3A8A";
const IVORY = "#F8FAFC";
const SAND = "#EAD7B7";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function CommunityNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3 border-b border-white/8" : "py-5"
      }`}
      style={{ backgroundColor: scrolled ? `${NAVY}ee` : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none" }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo text mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all group-hover:scale-105"
            style={{ background: `${GOLD}1A`, borderColor: `${GOLD}40` }}
          >
            <Star className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-white font-black text-sm tracking-tight">BNJ Community</span>
            <p className="text-[9px] font-medium tracking-widest uppercase" style={{ color: `${GOLD}99` }}>
              Réseau · Excellence
            </p>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
          <a href="#pillars" className="hover:text-white transition-colors">Notre approche</a>
          <a href="#features" className="hover:text-white transition-colors">La plateforme</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Témoignages</a>
        </div>

        {/* CTA */}
        <button
          onClick={() => document.getElementById("hero-cta")?.scrollIntoView({ behavior: "smooth" })}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: GOLD, color: NAVY }}
        >
          Rejoindre <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Mobile */}
        <Link href="/login" className="md:hidden text-white font-bold text-sm px-4 py-2 rounded-lg border border-white/20">
          Connexion
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function CommunityHero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0d1f4f 60%, ${NAVY} 100%)` }}
    >
      {/* Subtle geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gold glow top-right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
        />
        {/* Blue glow bottom-left */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${BLUE} 0%, transparent 70%)` }}
        />
        {/* Grid lines decoration */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Decorative gold horizontal line */}
        <div
          className="absolute left-0 right-0 h-px opacity-20"
          style={{ top: "72px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center space-y-10">

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border"
            style={{ background: `${GOLD}12`, borderColor: `${GOLD}35`, color: GOLD }}
          >
            <Star className="w-3 h-3" strokeWidth={2} />
            Réseau professionnel privé
            <Star className="w-3 h-3" strokeWidth={2} />
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1
              className="text-5xl lg:text-7xl text-white leading-[1.08] tracking-tight"
              style={SERIF}
            >
              L'excellence,{" "}
              <span
                className="relative inline-block"
                style={{ color: GOLD }}
              >
                au service de votre carrière.
                <svg className="absolute -bottom-2 left-0 w-full" height="4" viewBox="0 0 300 4" preserveAspectRatio="none">
                  <path d="M0 2 Q75 0 150 2 Q225 4 300 2" stroke={GOLD} strokeWidth="2" fill="none" strokeOpacity="0.5" />
                </svg>
              </span>
            </h1>
            <p className="text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto font-light" style={{ color: "rgba(255,255,255,0.65)" }}>
              Rejoignez un réseau d'exception. Offres d'emploi exclusives, coaching personnalisé
              et accompagnement humain — par et pour la communauté.
            </p>
          </div>

          {/* CTAs */}
          <div id="hero-cta" className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <AuthButton
              className="w-full sm:w-auto"
              variant="primary"
            />
            <a
              href="#pillars"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all border hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.2)" }}
            >
              Découvrir la plateforme
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 overflow-hidden"
                    style={{ borderColor: NAVY, background: `hsl(${i * 40}, 30%, 40%)` }}
                  >
                    <img src={`https://i.pravatar.cc/100?u=community${i}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                +500 membres actifs
              </p>
            </div>
            <div className="hidden sm:block w-px h-6" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: GOLD }} />
                ))}
              </div>
              <span className="text-sm font-semibold">4.9 / 5 · 200+ avis</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] tracking-widest uppercase font-bold text-white">Découvrir</span>
          <ChevronDown className="w-4 h-4 text-white animate-bounce" />
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: "500+",  label: "Membres actifs" },
    { value: "60+",   label: "Entreprises partenaires" },
    { value: "94%",   label: "Taux de satisfaction" },
    { value: "3 sem", label: "Délai moyen de placement" },
  ];

  return (
    <div className="bg-white border-y" style={{ borderColor: `${SAND}60` }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0" style={{ borderColor: `${SAND}60` }}>
          {stats.map((s) => (
            <div key={s.label} className="px-8 py-10 text-center">
              <p className="text-3xl lg:text-4xl font-black" style={{ ...SERIF, color: NAVY }}>{s.value}</p>
              <p className="text-sm font-medium mt-1" style={{ color: "#64748b" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Value Pillars ────────────────────────────────────────────────────────────

function ValuePillars() {
  const pillars = [
    {
      icon: Network,
      title: "Réseau",
      subtitle: "Des connexions qui comptent",
      desc: "Un cercle professionnel sélectionné. Chaque membre apporte une valeur réelle au collectif — entreprises partenaires, coachs experts, candidats ambitieux.",
      highlight: "Votre réseau, votre capital.",
    },
    {
      icon: Star,
      title: "Excellence",
      subtitle: "Un accompagnement de haut niveau",
      desc: "Des coachs dédiés, des ressources exclusives, des outils IA — le tout au service d'une seule ambition : vous propulser vers le poste que vous méritez.",
      highlight: "Pas de compromis.",
    },
    {
      icon: GraduationCap,
      title: "Transmission",
      subtitle: "Le savoir partagé, pour tous",
      desc: "Notre plateforme valorise l'entraide et le partage de compétences. Les réussites d'hier ouvrent les portes de demain, pour chacun d'entre nous.",
      highlight: "La force du collectif.",
    },
  ];

  return (
    <section id="pillars" className="py-28" style={{ background: IVORY }}>
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>Notre philosophie</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>
          <h2 className="text-4xl lg:text-5xl leading-tight" style={{ ...SERIF, color: NAVY }}>
            Trois piliers. Une communauté.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#64748b" }}>
            BNJ Community n'est pas une plateforme de plus. C'est un réseau fondé sur
            des valeurs qui durent — et des résultats qui se voient.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="group relative rounded-3xl p-10 transition-all duration-500 hover:-translate-y-2 cursor-default"
              style={{
                background: i === 1 ? NAVY : "white",
                border: `1px solid ${i === 1 ? "transparent" : `${SAND}80`}`,
                boxShadow: i === 1 ? `0 20px 60px ${NAVY}25` : "0 2px 20px rgba(0,0,0,0.04)",
              }}
            >
              {/* Gold line top */}
              {i === 1 && (
                <div
                  className="absolute top-0 left-10 right-10 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
                />
              )}
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
                style={{
                  background: i === 1 ? `${GOLD}20` : `${BLUE}10`,
                  color: i === 1 ? GOLD : BLUE,
                }}
              >
                <p.icon className="w-7 h-7" strokeWidth={1.5} />
              </div>
              {/* Number */}
              <p
                className="text-[11px] font-black tracking-[0.2em] uppercase mb-2"
                style={{ color: i === 1 ? `${GOLD}60` : `${BLUE}60` }}
              >
                0{i + 1}
              </p>
              {/* Title */}
              <h3
                className="text-3xl mb-1"
                style={{ ...SERIF, color: i === 1 ? GOLD : NAVY }}
              >
                {p.title}
              </h3>
              <p
                className="text-sm font-semibold mb-4"
                style={{ color: i === 1 ? "rgba(255,255,255,0.5)" : "#94a3b8" }}
              >
                {p.subtitle}
              </p>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: i === 1 ? "rgba(255,255,255,0.7)" : "#64748b" }}
              >
                {p.desc}
              </p>
              <p
                className="text-sm font-bold italic"
                style={{ color: i === 1 ? GOLD : BLUE }}
              >
                {p.highlight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function CommunityFeatures() {
  const features = [
    {
      icon: Briefcase,
      title: "Opportunités exclusives",
      desc: "Des offres d'emploi sélectionnées par l'équipe et les entreprises partenaires — introuvables ailleurs, réservées aux membres.",
    },
    {
      icon: Users,
      title: "Coachs experts dédiés",
      desc: "Pas un algorithme. Un vrai coach qui vous connaît, vous suit dans la durée et ajuste votre stratégie au fil des semaines.",
    },
    {
      icon: BookOpen,
      title: "Bibliothèque premium",
      desc: "Guides, replays d'ateliers, modèles de CV, ressources métiers — un savoir-faire collectif mis à votre disposition.",
    },
    {
      icon: GraduationCap,
      title: "Formations ciblées",
      desc: "Modules courts, directement applicables. Préparez un entretien, maîtrisez LinkedIn, perfectionnez votre pitch en 48h.",
    },
    {
      icon: MessageSquare,
      title: "Messagerie directe",
      desc: "Un lien direct et confidentiel avec votre coach. Posez vos questions, partagez vos doutes, progressez dans la confiance.",
    },
    {
      icon: Network,
      title: "Matching IA + humain",
      desc: "Notre IA identifie les meilleures compatibilités offres / profil. Votre coach valide et personnalise chaque candidature.",
    },
  ];

  return (
    <section
      id="features"
      className="py-28"
      style={{ background: NAVY }}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60)` }} />
            <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: `${GOLD}80` }}>La plateforme</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${GOLD}60, transparent)` }} />
          </div>
          <h2 className="text-4xl lg:text-5xl text-white leading-tight" style={SERIF}>
            Tout ce dont vous avez besoin,{" "}
            <span style={{ color: GOLD }}>au même endroit.</span>
          </h2>
          <p className="text-base font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
            Une plateforme pensée pour la réussite — pas pour l'abonnement.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "24px", overflow: "hidden" }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-10 transition-all duration-300 hover:z-10 relative"
              style={{ background: NAVY }}
            >
              {/* Hover gold border top */}
              <div
                className="absolute top-0 left-8 right-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${GOLD}15`, color: GOLD }}
              >
                <f.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3
                className="text-lg text-white font-bold mb-3 group-hover:text-opacity-100 transition-colors"
                style={{ ...SERIF }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const testimonials = [
    {
      quote: "En trois semaines, j'avais décroché deux entretiens pour des postes que je n'aurais jamais ciblés seul. Mon coach m'a aidé à voir ce que je valais vraiment.",
      name: "David M.",
      role: "Chef de projet IT — Paris",
      initials: "DM",
    },
    {
      quote: "Ce qui m'a frappé, c'est le côté humain. On n'est pas un numéro. Mon coach connaissait mon dossier, mes forces, mes blocages. La différence était immédiate.",
      name: "Sarah L.",
      role: "Responsable RH — Lyon",
      initials: "SL",
    },
    {
      quote: "Les offres disponibles sur la plateforme sont d'un autre niveau. Exclusives, vérifiées, et les entreprises sont vraiment au courant de nos profils.",
      name: "Jonathan K.",
      role: "Développeur Senior — Bordeaux",
      initials: "JK",
    },
  ];

  return (
    <section id="testimonials" className="py-28" style={{ background: IVORY }}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: GOLD }}>Témoignages</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>
          <h2 className="text-4xl lg:text-5xl leading-tight" style={{ ...SERIF, color: NAVY }}>
            Ils l'ont vécu.
          </h2>
          <p style={{ color: "#64748b" }} className="text-base">
            Des membres de la communauté partagent leur expérience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="relative rounded-3xl p-10 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "white",
                border: `1px solid ${SAND}80`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              {/* Quote mark */}
              <div
                className="text-6xl leading-none font-serif mb-4 select-none"
                style={{ color: `${GOLD}30`, fontFamily: "Georgia, serif" }}
              >
                "
              </div>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#475569" }}>
                {t.quote}
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: `${NAVY}10`, color: NAVY }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: NAVY }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{t.role}</p>
                </div>
              </div>
              {/* Stars */}
              <div className="absolute top-10 right-10 flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: GOLD }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function CommunityCTA() {
  const benefits = [
    "Accès aux offres exclusives de la communauté",
    "Mise en relation avec un coach dédié",
    "Bibliothèque de ressources premium",
    "Matching IA sur votre profil",
  ];

  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0d1f4f 100%)` }}
    >
      {/* Decorative gold glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
      />
      {/* Gold top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase border"
            style={{ background: `${GOLD}15`, borderColor: `${GOLD}35`, color: GOLD }}
          >
            <Star className="w-3 h-3" strokeWidth={2} />
            Accès sur invitation ou demande
          </div>

          {/* Headline */}
          <h2
            className="text-4xl lg:text-6xl text-white leading-tight"
            style={SERIF}
          >
            Prêt à rejoindre{" "}
            <span style={{ color: GOLD }}>la communauté ?</span>
          </h2>

          <p className="text-base lg:text-lg font-light max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            La première étape est la plus simple. Créez votre compte — notre équipe
            prend contact avec vous dans les 24 heures.
          </p>

          {/* Benefits list */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: GOLD }} strokeWidth={1.5} />
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <AuthButton className="w-full sm:w-auto" variant="primary" />
            <Link
              href="/login"
              className="text-sm font-semibold transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Déjà membre ? Se connecter →
            </Link>
          </div>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Aucun engagement. Aucune carte bancaire requise pour l'inscription.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function CommunityFooter() {
  return (
    <footer style={{ background: "#080e1f" }} className="py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ background: `${GOLD}15`, borderColor: `${GOLD}35` }}
            >
              <Star className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-black text-sm">BNJ Community</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: `${GOLD}60` }}>
                Réseau · Excellence · Transmission
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 pt-8 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} BNJ Community. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page composition ─────────────────────────────────────────────────────────

export function CommunityLandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <CommunityNavbar />
      <CommunityHero />
      <StatsBar />
      <ValuePillars />
      <CommunityFeatures />
      <Testimonials />
      <CommunityCTA />
      <CommunityFooter />
    </div>
  );
}
