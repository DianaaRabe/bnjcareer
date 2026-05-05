"use client";

import { Check, CreditCard, Shield, Zap, AlertCircle } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "9.80",
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
    price: "16.00",
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

export default function SubscriptionsPage() {
  // Mock d'abonnement actuel pour la démonstration
  const currentSubscription = {
    planId: "basic",
    name: "Basic",
    expiresAt: "14 Mai 2026",
    status: "actif"
  };

  const handlePayment = (planName: string, method: "mongopay" | "visa" | "mastercard") => {
    alert(`Redirection vers la passerelle de paiement ${method.toUpperCase()} pour le plan ${planName}...`);
  };

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir résilier votre abonnement ? Vous perdrez vos avantages à la fin de la période.")) {
      alert(`Votre demande de résiliation a été prise en compte. Votre abonnement prendra fin le ${currentSubscription.expiresAt}.`);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Gérez votre Abonnement
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Consultez votre forfait actuel et découvrez les offres pour débloquer tout le potentiel de BNJ Skills Maker.
        </p>
      </div>

      {/* Current Subscription Banner */}
      {currentSubscription && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Ligne bleue de décoration */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Mon Forfait Actuel : {currentSubscription.name}</h2>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Actif
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Renouvellement le <span className="font-semibold text-slate-700">{currentSubscription.expiresAt}</span>
              </p>
            </div>

            <div>
              {/* Le bouton de résiliation a été déplacé en bas de page pour plus de subtilité */}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id;

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
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} text-white flex items-center justify-center mb-6 shadow-lg`}
                >
                  <plan.icon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}€</span>
                  <span className="text-slate-500 font-medium">/mois</span>
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

              {/* Payment Actions */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-4">
                  {isCurrentPlan ? "Déjà inclus" : "Payer avec"}
                </p>
                <button
                  disabled={isCurrentPlan}
                  onClick={() => handlePayment(plan.name, "visa")}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    isCurrentPlan
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : plan.popular
                      ? "bg-brand-primary text-white hover:bg-brand-dark shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {isCurrentPlan ? "Forfait actif" : "Carte Visa"}
                </button>
                
                {!isCurrentPlan && (
                  <button
                    onClick={() => handlePayment(plan.name, "mongopay")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#001f3f] text-white hover:bg-[#00152b] transition-all shadow-md"
                  >
                    {/* MongoPay icon placeholder - simple text or generic icon */}
                    <span className="text-xl leading-none">💳</span>
                    MongoPay
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Footer / Cancel Action */}
      <div className="pt-12 pb-8 border-t border-slate-100 flex flex-col items-center space-y-4">
        <p className="text-slate-400 text-xs max-w-md text-center leading-relaxed">
          Votre abonnement est renouvelé automatiquement chaque mois. Vous pouvez gérer vos préférences de facturation ou résilier votre contrat à tout moment depuis cet espace.
        </p>
        <button 
          onClick={handleCancel}
          className="text-slate-300 hover:text-red-400 text-[10px] font-medium transition-colors hover:underline"
        >
          Résilier mon abonnement
        </button>
      </div>
    </div>
  );
}
