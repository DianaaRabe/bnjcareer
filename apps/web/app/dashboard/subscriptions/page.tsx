"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Shield,
  Zap,
  AlertCircle,
  Gift,
  Sparkles,
  CheckCircle2,
  Loader2,
  X,
  Lock,
} from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "34.80",
    description: "L'essentiel pour démarrer votre recherche d'emploi.",
    features: [
      "Accès complet aux offres d'emploi",
      "Création de 2 CVs professionnels par mois",
      "Suivi basique des candidatures",
      "Accès aux formations gratuites",
      "Support par email classique",
    ],
    icon: Shield,
    color: "from-blue-500 to-blue-600",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "50.00",
    description: "Tous les outils avancés pour accélérer votre carrière.",
    features: [
      "Tout ce qui est inclus dans Basic",
      "Génération de CVs illimitée",
      "Matching IA avancé avec suggestions",
      "Accès illimité à toutes les formations",
      "Certifications PDF incluses",
      "Messagerie prioritaire avec les coachs",
      "Mise en avant de votre profil",
    ],
    icon: Zap,
    color: "from-brand-accent to-brand-primary",
    popular: true,
  },
];

// ── JUIN GRATUIT promo period ───────────────────────────────────────────────
const PROMO_START = new Date("2026-06-01T00:00:00+02:00");
const PROMO_END   = new Date("2026-06-30T23:59:59+02:00");

function isPromoActive(): boolean {
  const now = new Date();
  return now >= PROMO_START && now <= PROMO_END;
}

interface CurrentSub {
  planId: "basic" | "pro";
  name: string;
  expiresAt: string;
  status: "actif";
  source: "free_june" | "stripe" | "mangopay";
}

export default function SubscriptionsPage() {
  const promoActive = isPromoActive();

  // Demo-only: persist promo activation in localStorage so the UI feels real
  // (will be replaced by a real DB-backed subscription in the next iteration).
  const [currentSub, setCurrentSub] = useState<CurrentSub | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "info" | "error"; text: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bnj_subscription");
      if (stored) setCurrentSub(JSON.parse(stored));
    } catch {}
  }, []);

  const showToast = (kind: "success" | "info" | "error", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4500);
  };

  const persistSub = (sub: CurrentSub | null) => {
    setCurrentSub(sub);
    try {
      if (sub) localStorage.setItem("bnj_subscription", JSON.stringify(sub));
      else localStorage.removeItem("bnj_subscription");
    } catch {}
  };

  const activateFreeJune = async (planId: "basic" | "pro", planName: string) => {
    setLoading(`free-${planId}`);
    // Simulate a small server call (the real one ships next iteration)
    await new Promise((r) => setTimeout(r, 600));
    persistSub({
      planId,
      name: planName,
      expiresAt: "30 juin 2026",
      status: "actif",
      source: "free_june",
    });
    setLoading(null);
    showToast("success", `✨ Plan ${planName} activé gratuitement jusqu'au 30 juin !`);
  };

  const handlePayment = (planName: string, method: "mangopay" | "visa" | "mastercard") => {
    showToast(
      "info",
      `Le paiement ${method.toUpperCase()} pour le plan ${planName} sera disponible dès le 1er juillet 2026. En attendant, profitez de JUIN GRATUIT !`,
    );
  };

  const handleCancel = () => {
    if (!currentSub) return;
    if (
      confirm(
        "Êtes-vous sûr de vouloir résilier votre abonnement ? Vous perdrez vos avantages à la fin de la période.",
      )
    ) {
      persistSub(null);
      showToast("success", `Votre abonnement a été résilié. Il prend fin le ${currentSub.expiresAt}.`);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">

      {/* ──────────────── JUIN GRATUIT BANNER ──────────────── */}
      {promoActive && !currentSub && (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-purple-600 to-brand-accent" />
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-brand-accent/30 blur-3xl pointer-events-none" />

          <div className="relative px-6 py-8 md:px-12 md:py-10 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-4 ring-white/10">
                <Gift className="w-9 h-9 md:w-11 md:h-11" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  Offre de lancement — Juin 2026
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                  🎉 BNJ Skills Maker est <span className="text-yellow-200">100 % GRATUIT</span> tout le mois de juin !
                </h2>
                <p className="text-white/85 text-sm md:text-base max-w-2xl">
                  Profitez de l'<strong>accès complet</strong> à toutes nos fonctionnalités (matching IA, coaching,
                  formations, CV illimités) <strong>sans aucun paiement</strong> jusqu'au 30 juin.
                  Activez votre plan en un clic, le paiement reprendra le 1<sup>er</sup> juillet seulement si vous le souhaitez.
                </p>
              </div>

              <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                <span className="text-5xl font-black leading-none">0€</span>
                <span className="text-xs uppercase tracking-widest text-white/70">jusqu'au 30 juin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active free-June banner (when activated) ───────────────────────── */}
      {promoActive && currentSub?.source === "free_june" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Offre JUIN activée</p>
            <h3 className="text-lg font-extrabold text-green-900">
              Plan {currentSub.name} actif gratuitement jusqu'au {currentSub.expiresAt}
            </h3>
            <p className="text-sm text-green-700/80 mt-0.5">
              Aucune information bancaire requise. Vous pourrez choisir un mode de paiement en juillet.
            </p>
          </div>
        </div>
      )}

      {/* ──────────────── Header ──────────────── */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Gérez votre Abonnement
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Consultez votre forfait actuel et découvrez les offres pour débloquer tout le potentiel de BNJ Skills Maker.
        </p>
      </div>

      {/* Current Subscription Banner (paid version) */}
      {currentSub && currentSub.source !== "free_june" && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Mon Forfait Actuel : {currentSub.name}</h2>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Actif
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Renouvellement le <span className="font-semibold text-slate-700">{currentSub.expiresAt}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Pricing Cards ──────────────── */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentSub?.planId === plan.id;
          const isLoadingThis = loading === `free-${plan.id}`;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
                plan.popular ? "border-brand-primary shadow-xl shadow-brand-primary/10" : "border-slate-100 shadow-sm"
              } ${isCurrentPlan ? "ring-4 ring-blue-50/50" : ""}`}
            >
              {plan.popular && !isCurrentPlan && (
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Le plus choisi
                  </span>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Forfait actuel
                  </span>
                </div>
              )}

              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} text-white flex items-center justify-center mb-6 shadow-lg`}>
                  <plan.icon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  {promoActive ? (
                    <>
                      <span className="text-4xl font-extrabold text-green-600">0€</span>
                      <span className="text-slate-400 line-through font-medium">{plan.price}€</span>
                      <span className="text-slate-500 text-xs font-medium">/mois (en juin)</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold text-slate-900">{plan.price}€</span>
                      <span className="text-slate-500 font-medium">/mois</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className={`w-5 h-5 shrink-0 ${plan.popular ? "text-brand-primary" : "text-blue-500"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── CTA ─────────────────────────────────────────────────── */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                {isCurrentPlan ? (
                  <div className="text-center py-3 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Forfait actif
                  </div>
                ) : promoActive ? (
                  <>
                    {/* JUIN gratuit primary CTA */}
                    <button
                      onClick={() => activateFreeJune(plan.id as "basic" | "pro", plan.name)}
                      disabled={isLoadingThis}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100 ${
                        plan.popular
                          ? "bg-gradient-to-r from-brand-primary to-brand-accent shadow-brand-primary/30"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/20"
                      }`}
                    >
                      {isLoadingThis ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Activation…
                        </>
                      ) : (
                        <>
                          <Gift className="w-5 h-5" />
                          Activer gratuitement (JUIN)
                        </>
                      )}
                    </button>

                    {/* Disabled payment buttons during promo */}
                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider pt-3">
                      Modes de paiement disponibles dès le 1<sup>er</sup> juillet
                    </p>
                    <div className="grid grid-cols-2 gap-2 opacity-50">
                      <button
                        onClick={() => handlePayment(plan.name, "visa")}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3" />
                        <CreditCard className="w-3.5 h-3.5" /> Stripe
                      </button>
                      <button
                        onClick={() => handlePayment(plan.name, "mangopay")}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3" />
                        💳 MangoPay
                      </button>
                    </div>
                  </>
                ) : (
                  // Outside promo period: normal payment buttons
                  <>
                    <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-2">
                      Payer avec
                    </p>
                    <button
                      onClick={() => handlePayment(plan.name, "visa")}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                        plan.popular
                          ? "bg-brand-primary text-white hover:bg-brand-dark shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Carte (Stripe)
                    </button>
                    <button
                      onClick={() => handlePayment(plan.name, "mangopay")}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#001f3f] text-white hover:bg-[#00152b] transition-all shadow-md"
                    >
                      <span className="text-xl leading-none">💳</span>
                      MangoPay
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ──────────────── Footer / Cancel ──────────────── */}
      <div className="pt-12 pb-8 border-t border-slate-100 flex flex-col items-center space-y-4">
        <p className="text-slate-400 text-xs max-w-md text-center leading-relaxed">
          {promoActive
            ? "Aucune carte bancaire n'est requise pendant la période promotionnelle. Vous pouvez résilier à tout moment."
            : "Votre abonnement est renouvelé automatiquement chaque mois. Vous pouvez gérer vos préférences de facturation ou résilier votre contrat à tout moment depuis cet espace."}
        </p>
        {currentSub && (
          <button
            onClick={handleCancel}
            className="text-slate-300 hover:text-red-400 text-[10px] font-medium transition-colors hover:underline"
          >
            Résilier mon abonnement
          </button>
        )}
      </div>

      {/* ──────────────── Toast ──────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 max-w-sm rounded-2xl shadow-2xl border p-4 flex items-start gap-3 animate-slide-up z-50 ${
            toast.kind === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : toast.kind === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
          ) : toast.kind === "error" ? (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          ) : (
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
          )}
          <p className="text-sm font-semibold leading-relaxed flex-1">{toast.text}</p>
          <button
            onClick={() => setToast(null)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
