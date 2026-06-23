// ─────────────────────────────────────────────────────────────────────────────
// French translations — default locale
// ─────────────────────────────────────────────────────────────────────────────

const fr = {
  nav: {
    dashboard:   'Tableau de bord',
    jobs:        'Offres d\'emploi',
    formations:  'Formations',
    resources:   'Ressources',
    messages:    'Messages',
    coaching:    'Coaching',
    settings:    'Paramètres',
    logout:      'Se déconnecter',
  },
  jobs: {
    search:          'Rechercher une offre...',
    searchKeywords:  'Mots-clés, poste...',
    searchLocation:  'Ville, région...',
    noResults:       'Aucune offre trouvée',
    noResultsHint:   'Modifiez vos critères de recherche',
    apply:           'Postuler',
    applyViaEmail:   'Postuler par email',
    viewDetails:     'Voir l\'offre',
    postedOn:        'Publiée le',
    postedAgo:       'il y a',
    filters:         'Filtres',
    contractType:    'Type de contrat',
    experienceLevel: 'Niveau d\'expérience',
    remote:          'Télétravail',
    salary:          'Salaire',
    source:          'Source',
    loading:         'Chargement des offres...',
  },
  common: {
    save:        'Sauvegarder',
    cancel:      'Annuler',
    delete:      'Supprimer',
    edit:        'Modifier',
    create:      'Créer',
    confirm:     'Confirmer',
    back:        'Retour',
    next:        'Suivant',
    previous:    'Précédent',
    loading:     'Chargement...',
    error:       'Une erreur est survenue',
    success:     'Succès',
    required:    'Champ obligatoire',
    optional:    'Optionnel',
    search:      'Rechercher',
    filter:      'Filtrer',
    all:         'Tous',
    yes:         'Oui',
    no:          'Non',
    close:       'Fermer',
    open:        'Ouvrir',
    download:    'Télécharger',
    upload:      'Uploader',
    share:       'Partager',
    view:        'Voir',
    seeMore:     'Voir plus',
    seeLess:     'Voir moins',
  },
  auth: {
    login:          'Se connecter',
    register:       'S\'inscrire',
    logout:         'Se déconnecter',
    email:          'Adresse email',
    password:       'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount:      'Pas encore de compte ?',
    hasAccount:     'Déjà un compte ?',
  },
  admin: {
    companies:      'Entreprises',
    addCompany:     'Ajouter une entreprise',
    editCompany:    'Modifier l\'entreprise',
    deleteCompany:  'Supprimer l\'entreprise',
    jobs:           'Offres d\'emploi',
    addJob:         'Ajouter une offre',
    editJob:        'Modifier l\'offre',
    deleteJob:      'Supprimer l\'offre',
    publishJob:     'Publier',
    unpublishJob:   'Dépublier',
  },
} as const

// Recursive type that maps all leaf string values to `string`
// so other locales (en, he…) don't need to match the exact French strings
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>
}

export type TranslationKeys = DeepString<typeof fr>
export default fr
