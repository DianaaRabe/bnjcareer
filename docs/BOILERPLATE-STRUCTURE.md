# Boilerplate — Nouvelle structure Skills Maker (stack découplée)

> Structure cible pour la refonte : backend GraphQL dédié + frontend SPA.
> Architecture modulaire par domaine, typée de bout en bout.

---

## Vue d'ensemble du monorepo

```
skills-maker/
├── apps/
│   ├── api/          # Backend — Node + Express + Apollo Server (GraphQL)
│   └── web/          # Frontend — Vite + React (SPA)
├── packages/
│   ├── types/        # Types partagés back ↔ front
│   └── config/       # ESLint, tsconfig, prettier partagés
├── package.json      # workspaces npm
└── turbo.json
```

---

## Backend — `apps/api`

Architecture **modulaire par domaine** : chaque fonctionnalité est un module GraphQL
autonome (typeDefs + resolvers + services + tests).

```
apps/api/
├── prisma/
│   ├── schema.prisma          # LE schéma (dérivé du schema.sql actuel)
│   ├── migrations/            # migrations versionnées
│   └── seed.ts
├── src/
│   ├── index.ts               # bootstrap Express + Apollo + WebSocket
│   ├── context.ts             # contexte GraphQL (user, prisma)
│   │
│   ├── graphql/
│   │   ├── schema.ts          # assemble tous les modules
│   │   ├── resolvers/         # scalars, resolvers racine
│   │   └── modules/           # ← un dossier par domaine
│   │       ├── auth/
│   │       │   ├── typeDefs.ts
│   │       │   ├── resolvers.ts
│   │       │   ├── authService.ts
│   │       │   ├── authTokenService.ts     # JWT
│   │       │   ├── authMappers.ts
│   │       │   └── __tests__/
│   │       ├── profiles/
│   │       ├── cv/            # extraction, optimisation IA, PDF
│   │       ├── jobs/          # scraping Apify / offres locales
│   │       ├── applications/  # Candiboost, suivi candidatures
│   │       ├── coaching/      # agenda, réservations, accord coach
│   │       ├── formations/
│   │       ├── messaging/     # conversations + subscriptions
│   │       ├── resources/
│   │       └── admin/         # entreprises, offres, membres
│   │
│   ├── services/              # intégrations métier PORTABLES (réutilisées telles quelles)
│   │   ├── llm/               # Groq / OpenRouter + rotation clés
│   │   ├── scraping/          # Apify + Puppeteer
│   │   ├── email/             # Brevo
│   │   └── pdf/
│   │
│   ├── lib/
│   │   ├── prisma.ts          # client Prisma singleton
│   │   ├── auth.ts            # bcrypt, vérif token
│   │   ├── rbac.ts            # contrôle d'accès par rôle
│   │   ├── uploads/           # S3 / Cloudinary
│   │   └── __tests__/
│   │
│   └── config/                # env validé (zod), constantes
├── package.json
└── tsconfig.json
```

### Anatomie d'un module (le pattern à répéter partout)

| Fichier | Rôle |
|---|---|
| `typeDefs.ts` | le schéma GraphQL du domaine (types, queries, mutations) |
| `resolvers.ts` | branche les queries/mutations sur les services |
| `xService.ts` | **la logique métier** (Prisma, règles) — découpée en plusieurs fichiers si gros |
| `xMappers.ts` | conversion entité DB → type GraphQL |
| `__tests__/` | tests unitaires du service |

---

## Frontend — `apps/web`

```
apps/web/
├── codegen.ts                 # génère les types depuis le schéma GraphQL
├── src/
│   ├── main.tsx               # point d'entrée (ApolloProvider, Router)
│   ├── App.tsx                # routes
│   │
│   ├── graphql/               # requêtes SOURCE (.ts : queries + mutations)
│   ├── gql/                   # types GÉNÉRÉS par codegen (ne pas éditer)
│   │
│   ├── pages/                 # une page par écran
│   │   ├── auth/
│   │   ├── dashboard/         # espace candidat (profil, cv, jobs, messages…)
│   │   ├── coach/
│   │   └── admin/
│   │
│   ├── layouts/               # DashboardLayout, CoachLayout, AuthLayout
│   ├── components/            # UI réutilisable (+ Radix UI)
│   │   └── ui/
│   ├── lib/
│   │   ├── apollo.ts          # client Apollo (auth header)
│   │   └── auth.tsx           # contexte session
│   ├── constants/
│   └── locales/               # i18n
├── index.html
├── vite.config.ts
└── tailwind.config.ts
```

---

## Le flux de données (schéma mental)

```
React (page)
  → requête GraphQL (src/graphql) typée par codegen (src/gql)
    → Apollo Client (header: token)
      → Apollo Server (apps/api)
        → resolver du module
          → service métier  →  Prisma  →  PostgreSQL
          └→ ou service portable (LLM, scraping, email)
```

---

## Points clés

1. **Services portables** : le dossier `services/` (LLM, scraping, Brevo, PDF) est du
   **copier-coller quasi direct** depuis l'app Next actuelle — c'est là que la réutilisation
   est maximale.
2. **`schema.prisma`** enfin rempli et versionné, dérivé du `schema.sql` actuel (15 tables).
3. **Typage de bout en bout** : le codegen génère les types front à partir du schéma GraphQL,
   supprimant les erreurs d'intégration back ↔ front.
