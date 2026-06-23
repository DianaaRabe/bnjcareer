import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachAgreementForm } from "./AgreementForm";
import { Shield, Coins, Users, CalendarCheck, ScrollText, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Bump this when the contract content changes. Existing signatures stay valid
// for the version they signed.
export const CURRENT_CONTRACT_VERSION = "2026-06-01";

export const metadata = {
  title: "Convention Coach — BNJ Skills Maker",
  description: "Acceptation des conditions de collaboration coach BNJ Skills Maker.",
};

export default async function CoachAgreementPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/coach-login");

  // Only coaches may see this page
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "coach") redirect("/dashboard");

  // If already signed for the current version, skip back to coach space
  const { data: existing } = await supabase
    .from("coach_agreements")
    .select("id, contract_version, accepted_at")
    .eq("coach_id", user.id)
    .is("revoked_at", null)
    .eq("contract_version", CURRENT_CONTRACT_VERSION)
    .maybeSingle();

  if (existing) redirect("/coach");

  const defaultName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Slim header */}
      <header className="border-b border-white/10 bg-brand-dark/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black">Convention Coach</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">BNJ Skills Maker</p>
            </div>
          </div>
          <p className="text-xs text-white/40">Version {CURRENT_CONTRACT_VERSION}</p>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">

          {/* Intro */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold">Bienvenue sur l'espace Coach</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Avant d'accéder à votre tableau de bord, merci de lire et accepter les conditions de
              collaboration ci-dessous. Cet accord régit la répartition des revenus entre vous et la plateforme.
            </p>
          </div>

          {/* Key terms — visual cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/15 flex items-center justify-center text-brand-accent">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold">Abonnements candidats</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Vous percevez <strong className="text-brand-accent">25 %</strong> du montant de l'abonnement
                de chaque candidat <em>inscrit à l'une de vos formations</em>.
              </p>
              <p className="text-xs text-white/40">
                Les <strong>75 %</strong> restants reviennent à la plateforme.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/15 flex items-center justify-center text-brand-accent">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold">Formations & ateliers payants</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Vous fixez librement le prix. La plateforme prélève une commission de{" "}
                <strong className="text-brand-accent">25 %</strong> sur chaque inscription payante.
              </p>
              <p className="text-xs text-white/40">
                Les <strong>75 %</strong> reviennent au coach.
              </p>
            </div>
          </div>

          {/* Full legal text */}
          <article className="bg-white text-slate-700 rounded-3xl shadow-2xl p-8 md:p-10 space-y-6 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <ScrollText className="w-4 h-4" /> Texte intégral de la convention
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 -mt-3">
              Convention de collaboration entre le Coach et BNJ Team Maker
            </h2>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 1 — Objet</h3>
              <p>
                La présente convention a pour objet de définir les modalités de collaboration entre le
                Coach (ci-après "le Coach") et la société BNJ Team Maker, opératrice de la plateforme
                BNJ Skills Maker (ci-après "la Plateforme"), dans le cadre des prestations
                d'accompagnement, de formation et de coaching dispensées via la Plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 2 — Identité et compétences du Coach</h3>
              <p>
                Le Coach déclare exercer son activité de manière indépendante et garantit la véracité des
                informations communiquées lors de son inscription (identité, parcours professionnel,
                certifications, domaines d'expertise). Toute fausse déclaration entraînera la résiliation
                immédiate de la présente convention.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 3 — Répartition des revenus liés aux abonnements candidats</h3>
              <p className="mb-2">
                Lorsqu'un candidat souscrit un abonnement payant à la Plateforme et qu'il est inscrit à
                au moins une formation proposée par le Coach, la rémunération mensuelle est répartie
                comme suit :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>25 %</strong> du montant net encaissé reviennent au Coach concerné ;</li>
                <li><strong>75 %</strong> du montant net encaissé reviennent à BNJ Team Maker.</li>
              </ul>
              <p className="mt-2 text-sm text-slate-600">
                Si un candidat est inscrit à des formations de plusieurs coachs, la part de 25 % est
                répartie au prorata du nombre de formations actives par coach.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 4 — Répartition des revenus liés aux formations et ateliers payants</h3>
              <p className="mb-2">
                Le Coach fixe librement le prix de ses formations et ateliers payants vendus directement
                sur la Plateforme. La rémunération est répartie comme suit :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>75 %</strong> du prix de vente reviennent au Coach ;</li>
                <li><strong>25 %</strong> sont retenus par BNJ Team Maker à titre de commission de plateforme.</li>
              </ul>
              <p className="mt-2 text-sm text-slate-600">
                Les frais de transaction du prestataire de paiement (Stripe, MangoPay) sont déduits du
                montant brut avant calcul de la répartition.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 5 — Versement des rémunérations</h3>
              <p>
                Les rémunérations dues au Coach sont calculées mensuellement et versées sur le compte
                bancaire ou le wallet de paiement renseigné par le Coach, dans un délai maximum de 30 jours
                suivant la clôture du mois concerné. Le Coach reçoit un récapitulatif détaillé des
                transactions et de la répartition.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 6 — Indépendance et statut juridique</h3>
              <p>
                Le Coach intervient en qualité de prestataire indépendant. La présente convention ne crée
                aucun lien de subordination entre les parties et ne constitue ni un contrat de travail,
                ni une société de fait, ni un mandat commercial. Le Coach est seul responsable de ses
                obligations fiscales et sociales auprès des administrations compétentes.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 7 — Confidentialité et données personnelles</h3>
              <p>
                Le Coach s'engage à respecter la confidentialité des informations personnelles des
                candidats avec lesquels il interagit via la Plateforme, conformément au Règlement Général
                sur la Protection des Données (RGPD).
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 8 — Durée, résiliation et révision</h3>
              <p>
                La présente convention est conclue pour une durée indéterminée. Chacune des parties peut
                la résilier à tout moment moyennant un préavis de 30 jours par notification écrite.
                BNJ Team Maker se réserve le droit de proposer une mise à jour des termes ; le Coach sera
                invité à accepter la nouvelle version pour continuer à utiliser la Plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-extrabold text-slate-900 mb-2">Article 9 — Droit applicable</h3>
              <p>
                La présente convention est régie par le droit français. Tout litige relatif à son
                interprétation ou à son exécution sera soumis, à défaut de résolution amiable, à la
                compétence des tribunaux français.
              </p>
            </section>
          </article>

          {/* Sign form (client component) */}
          <CoachAgreementForm
            contractVersion={CURRENT_CONTRACT_VERSION}
            defaultName={defaultName}
            userEmail={user.email || ""}
          />

          {/* Back link */}
          <div className="text-center pt-4">
            <Link href="/coach-login" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quitter et me déconnecter plus tard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
