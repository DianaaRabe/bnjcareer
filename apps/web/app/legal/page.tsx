import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Shield, Mail, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Mentions légales — BNJ Skills Maker",
  description:
    "Mentions légales, droits d'auteur et propriété intellectuelle de la plateforme BNJ Skills Maker.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/20 border border-brand-primary/30 mb-4 text-brand-accent text-xs font-black uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              Informations légales
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Mentions légales
            </h1>
            <p className="text-white/60 mt-3 text-sm">
              Dernière mise à jour :{" "}
              {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>

          {/* Content card */}
          <article className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">
            {/* 1. Éditeur */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                1. Éditeur du site
              </h2>
              <p className="mb-3">
                La plateforme <strong>BNJ Skills Maker</strong> est éditée et
                opérée par la société <strong>BNJ Team Maker</strong>, dirigée
                par <strong>Monsieur Benjamin Parienty</strong>,
                Président-Directeur Général.
              </p>
              <p className="mb-3">
                <strong>BNJ Skills Maker</strong>, fondée en{" "}
                <strong>2026</strong>, n'est pas une entité juridique
                indépendante : il s'agit d'une sous-tutelle directe et d'une
                marque opérationnelle de la société BNJ Team Maker. À ce titre,
                elle hérite de la charte graphique, de la gouvernance et des
                conditions générales de la maison mère.
              </p>
              <ul className="space-y-1.5 text-sm mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <li>
                  <strong>Dénomination :</strong> BNJ Team Maker
                </li>
                <li>
                  <strong>Marque / Plateforme :</strong> BNJ Skills Maker
                </li>
                <li>
                  <strong>Représentant légal :</strong> Benjamin Parienty, CEO
                </li>
                <li>
                  <strong>Contact :</strong>{" "}
                  <a
                    href="mailto:contact@bnjteammaker.fr"
                    className="text-brand-primary hover:underline font-semibold"
                  >
                    contact@bnjteammaker.fr
                  </a>
                </li>
              </ul>
            </section>

            {/* 2. Propriété intellectuelle */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                2. Propriété intellectuelle
              </h2>
              <p className="mb-3">
                L'intégralité du code source, de l'architecture logicielle, des
                algorithmes, des interfaces, des modèles de données et des
                composants techniques de la plateforme BNJ Skills Maker a été
                conçue, développée et réalisée par :
              </p>
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 border border-brand-primary/20 rounded-2xl p-6 my-4">
                <p className="font-extrabold text-slate-900 text-lg mb-2">
                  Mme Fanilonombana Diana RABEMANANTSOA
                </p>
                <p className="text-sm text-slate-700 mb-1">
                  <strong>Statut :</strong> Développeuse full-stack freelance
                </p>
                <p className="text-sm text-slate-700 mb-1">
                  <strong>Cadre contractuel :</strong> Contrat freelance d'une
                  durée d'un (1) an conclu avec la société BNJ Team Maker
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Pièce d'identité :</strong> disponible sur demande
                  pour vérification auprès des autorités compétentes
                </p>
              </div>
              <p className="mb-3">
                Conformément aux articles L.111-1 et suivants du Code de la
                propriété intellectuelle, ainsi qu'aux conventions
                internationales applicables, Mme Fanilonombana Diana
                RABEMANANTSOA est titulaire des <strong>droits moraux</strong>{" "}
                sur l'œuvre logicielle BNJ Skills Maker, droits qui sont
                imprescriptibles, inaliénables et perpétuels.
              </p>
              <p className="mb-3">
                Les <strong>droits patrimoniaux</strong> d'exploitation
                (reproduction, représentation, adaptation, commercialisation)
                font l'objet d'un accord contractuel entre l'auteur et la
                société BNJ Team Maker, pour la durée et selon les conditions
                définies dans le contrat freelance liant les deux parties.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication,
                transmission ou exploitation totale ou partielle du code, du
                design, des contenus ou des éléments graphiques de la
                plateforme, par quelque procédé que ce soit, sans l'autorisation
                expresse et écrite de l'auteur et de l'éditeur, est strictement
                interdite et constituerait une contrefaçon sanctionnée par les
                articles L.335-2 et suivants du Code de la propriété
                intellectuelle.
              </p>
            </section>

            {/* 3. Marques */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                3. Marques et identité visuelle
              </h2>
              <p>
                Les marques <strong>BNJ Team Maker</strong> et{" "}
                <strong>BNJ Skills Maker</strong>, les logos, slogans et chartes
                graphiques associés sont la propriété de la société BNJ Team
                Maker. Toute utilisation non autorisée de ces marques est
                interdite et engage la responsabilité de son auteur. La charte
                graphique appliquée à BNJ Skills Maker est celle de la maison
                mère BNJ Team Maker, conformément à son statut de sous-tutelle.
              </p>
            </section>

            {/* 4. Hébergement */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                4. Hébergement
              </h2>
              <p className="mb-2">La plateforme est hébergée par :</p>
              <ul className="space-y-1.5 text-sm bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <li>
                  <strong>Vercel Inc.</strong>
                </li>
                <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
                <li>
                  Site :{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline inline-flex items-center gap-1"
                  >
                    vercel.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                La base de données et l'authentification utilisateur sont
                opérées par Supabase Inc. (San Francisco, CA, États-Unis),
                conformément à ses propres conditions et politiques de
                confidentialité.
              </p>
            </section>

            {/* 5. Données personnelles */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                5. Données personnelles (RGPD)
              </h2>
              <p className="mb-3">
                Les données personnelles collectées sur la plateforme (nom,
                email, parcours professionnel, compétences, etc.) sont
                nécessaires à la fourniture du service de coaching et
                d'accompagnement. Elles sont traitées conformément au Règlement
                Général sur la Protection des Données (RGPD — Règlement UE
                2016/679) et à la loi française Informatique et Libertés du 6
                janvier 1978 modifiée.
              </p>
              <p className="mb-3">
                Conformément à la réglementation en vigueur, l'utilisateur
                dispose à tout moment d'un droit d'accès, de rectification,
                d'effacement, de portabilité, d'opposition et de limitation du
                traitement de ses données personnelles. Pour exercer ces droits,
                l'utilisateur peut adresser sa demande à :{" "}
                <a
                  href="mailto:contact@bnjteammaker.fr"
                  className="text-brand-primary hover:underline font-semibold"
                >
                  contact@bnjteammaker.fr
                </a>
                .
              </p>
              <p>
                Les données sont conservées pendant la durée strictement
                nécessaire à la finalité du traitement, puis archivées ou
                supprimées conformément aux durées légales applicables.
              </p>
            </section>

            {/* 6. Cookies */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                6. Cookies
              </h2>
              <p>
                La plateforme utilise uniquement des cookies techniques
                strictement nécessaires à son fonctionnement (session
                d'authentification, préférences utilisateur, détection du tenant
                d'affichage). Aucun cookie de tracking publicitaire ou de
                profilage tiers n'est déposé sans le consentement explicite de
                l'utilisateur.
              </p>
            </section>

            {/* 7. Responsabilité */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                7. Limitation de responsabilité
              </h2>
              <p className="mb-3">
                BNJ Team Maker s'efforce d'assurer l'exactitude et la mise à
                jour des informations diffusées sur la plateforme. Toutefois,
                l'éditeur ne saurait être tenu responsable des erreurs ou
                omissions, ni de l'indisponibilité temporaire du service due à
                des opérations de maintenance, à des défaillances techniques ou
                à des cas de force majeure.
              </p>
              <p>
                Les conseils, recommandations et outils proposés par la
                plateforme (notamment ceux générés par intelligence
                artificielle) constituent une aide à la décision et ne sauraient
                se substituer à un accompagnement professionnel personnalisé.
                L'utilisateur reste seul responsable des décisions qu'il prend
                sur la base de ces informations.
              </p>
            </section>

            {/* 8. Droit applicable */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                8. Droit applicable et juridiction
              </h2>
              <p>
                Les présentes mentions légales sont régies par le droit
                français. Tout litige relatif à l'interprétation ou à
                l'exécution des présentes sera soumis, à défaut de résolution
                amiable, à la compétence exclusive des tribunaux français.
              </p>
            </section>

            {/* Contact CTA */}
            <section className="mt-12 pt-8 border-t border-slate-100">
              <div className="bg-brand-dark rounded-2xl p-6 md:p-8 text-white text-center">
                <Mail className="w-8 h-8 mx-auto mb-3 text-brand-accent" />
                <h3 className="text-lg sm:text-xl font-extrabold mb-2">
                  Une question juridique ?
                </h3>
                <p className="text-white/70 text-sm mb-5 max-w-md mx-auto">
                  Pour toute question relative aux présentes mentions ou à la
                  protection de vos données.
                </p>
                <a
                  href="mailto:contact@bnjteammaker.fr"
                  className="inline-flex max-w-full items-center justify-center gap-2 bg-brand-accent text-brand-dark font-extrabold py-3 px-4 sm:px-6 rounded-xl hover:bg-brand-accent/90 transition-all text-xs sm:text-sm md:text-base break-all"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="break-all">contact@bnjteammaker.fr</span>
                </a>
              </div>
            </section>
          </article>

          {/* Back link */}
          <div className="text-center mt-10">
            <Link
              href="/"
              className="text-white/60 hover:text-brand-accent text-sm font-semibold transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
