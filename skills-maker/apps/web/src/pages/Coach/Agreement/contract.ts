// French only: translating a contract governed by French law is a legal call, not a dev one.
// Any edit here must bump CURRENT_CONTRACT_VERSION in the API.
export const CONTRACT_TITLE = 'Convention de collaboration entre le Coach et BNJ Team Maker'

export type ContractArticle = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  footnote?: string
}

export const CONTRACT_ARTICLES: ContractArticle[] = [
  {
    heading: 'Article 1 — Objet',
    paragraphs: [
      "La présente convention a pour objet de définir les modalités de collaboration entre le Coach (ci-après « le Coach ») et la société BNJ Team Maker, opératrice de la plateforme BNJ Skills Maker (ci-après « la Plateforme »), dans le cadre des prestations d'accompagnement, de formation et de coaching dispensées via la Plateforme.",
    ],
  },
  {
    heading: 'Article 2 — Identité et compétences du Coach',
    paragraphs: [
      "Le Coach déclare exercer son activité de manière indépendante et garantit la véracité des informations communiquées lors de son inscription (identité, parcours professionnel, certifications, domaines d'expertise). Toute fausse déclaration entraînera la résiliation immédiate de la présente convention.",
    ],
  },
  {
    heading: 'Article 3 — Répartition des revenus liés aux abonnements candidats',
    paragraphs: [
      "Lorsqu'un candidat souscrit un abonnement payant à la Plateforme et qu'il est inscrit à au moins une formation proposée par le Coach, la rémunération mensuelle est répartie comme suit :",
    ],
    bullets: [
      '25 % du montant net encaissé reviennent au Coach concerné ;',
      '75 % du montant net encaissé reviennent à BNJ Team Maker.',
    ],
    footnote:
      "Si un candidat est inscrit à des formations de plusieurs coachs, la part de 25 % est répartie au prorata du nombre de formations actives par coach.",
  },
  {
    heading: 'Article 4 — Répartition des revenus liés aux formations et ateliers payants',
    paragraphs: [
      'Le Coach fixe librement le prix de ses formations et ateliers payants vendus directement sur la Plateforme. La rémunération est répartie comme suit :',
    ],
    bullets: [
      '75 % du prix de vente reviennent au Coach ;',
      '25 % sont retenus par BNJ Team Maker à titre de commission de plateforme.',
    ],
    footnote:
      'Les frais de transaction du prestataire de paiement (Stripe, MangoPay) sont déduits du montant brut avant calcul de la répartition.',
  },
  {
    heading: 'Article 5 — Versement des rémunérations',
    paragraphs: [
      'Les rémunérations dues au Coach sont calculées mensuellement et versées sur le compte bancaire ou le wallet de paiement renseigné par le Coach, dans un délai maximum de 30 jours suivant la clôture du mois concerné. Le Coach reçoit un récapitulatif détaillé des transactions et de la répartition.',
    ],
  },
  {
    heading: 'Article 6 — Indépendance et statut juridique',
    paragraphs: [
      "Le Coach intervient en qualité de prestataire indépendant. La présente convention ne crée aucun lien de subordination entre les parties et ne constitue ni un contrat de travail, ni une société de fait, ni un mandat commercial. Le Coach est seul responsable de ses obligations fiscales et sociales auprès des administrations compétentes.",
    ],
  },
  {
    heading: 'Article 7 — Confidentialité et données personnelles',
    paragraphs: [
      "Le Coach s'engage à respecter la confidentialité des informations personnelles des candidats avec lesquels il interagit via la Plateforme, conformément au Règlement Général sur la Protection des Données (RGPD).",
    ],
  },
  {
    heading: 'Article 8 — Durée, résiliation et révision',
    paragraphs: [
      "La présente convention est conclue pour une durée indéterminée. Chacune des parties peut la résilier à tout moment moyennant un préavis de 30 jours par notification écrite. BNJ Team Maker se réserve le droit de proposer une mise à jour des termes ; le Coach sera invité à accepter la nouvelle version pour continuer à utiliser la Plateforme.",
    ],
  },
  {
    heading: 'Article 9 — Droit applicable',
    paragraphs: [
      "La présente convention est régie par le droit français. Tout litige relatif à son interprétation ou à son exécution sera soumis, à défaut de résolution amiable, à la compétence des tribunaux français.",
    ],
  },
]
