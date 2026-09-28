# Plan de développement — Refonte Skills Maker (stack découplée)

> Feuille de route d'exécution, dérivée de :
> - `MIGRATION-ANALYSE.md` (décision & tranches)
> - `BOILERPLATE-STRUCTURE.md` (structure cible)
> - le boilerplate généré dans `../skills-maker/`
>
> Principe directeur : **migration progressive, sans interruption**. L'app Next actuelle
> (`apps/web`) reste en production jusqu'à la bascule finale.

---

## ✅ Phase 0 — Fondations (FAIT)

- [x] Monorepo `skills-maker/` (npm workspaces + Turbo)
- [x] Backend `apps/api` : bootstrap Express + Apollo Server
- [x] Module `auth` complet (référence) : typeDefs, resolvers, service, JWT, mappers
- [x] Libs socle : `prisma`, `auth` (bcrypt), `rbac`, `config/env` (validation zod)
- [x] **Schéma Prisma complet** (15 tables portées depuis `schema.sql`) — validé
- [x] Frontend `apps/web` : squelette Vite + React + Apollo Client + codegen

---

## Phase 1 — Base de données & authentification opérationnelles

Objectif : login/register fonctionnels de bout en bout sur la nouvelle stack.

- [ ] Provisionner une base **PostgreSQL** (dev local + instance de staging)
- [ ] Renseigner `apps/api/.env` (`DATABASE_URL`, `JWT_SECRET`)
- [ ] `npm install` puis `npm run db:migrate` (crée les tables + client Prisma typé)
- [ ] Écrire `prisma/seed.ts` (users de test : 1 candidat, 1 coach, 1 admin)
- [ ] Tester `register` / `login` / `me` via l'explorateur GraphQL (`/graphql`)
- [ ] **Reconstruire l'OAuth Google** (remplacement de Supabase Auth) — point sensible
- [ ] Tests unitaires du module `auth` (service + RBAC)

**Jalon :** un utilisateur peut se créer un compte, se connecter et être authentifié.

---

## Phase 2 — Services métier portables

Objectif : rapatrier le code réutilisable de l'app actuelle (peu de modifications).

- [ ] `services/llm/` — Groq / OpenRouter + rotation de clés + garde-fous anti-hallucination
- [ ] `services/scraping/` — acteurs Apify (Indeed, LinkedIn, HelloWork) + Puppeteer
- [ ] `services/email/` — Brevo (envoi CV + lettre)
- [ ] `services/pdf/` — génération PDF (revoir `html2pdf` → génération côté serveur si besoin)

**Jalon :** les intégrations externes sont disponibles pour les resolvers.

---

## Phase 3 — Modules GraphQL par domaine

Chaque module suit le patron `auth/` : `typeDefs` + `resolvers` + `xService` + `xMappers` + `__tests__`, puis enregistrement dans `graphql/schema.ts`. Les modèles Prisma existent déjà.

Ordre suggéré (du plus structurant au plus périphérique) :

- [ ] `profiles` — lecture/mise à jour du profil
- [ ] `cv` — extraction, édition, optimisation IA (générale + ciblée), lettre de motivation, export PDF
- [ ] `jobs` — agrégation (scraping) + offres locales curées
- [ ] `applications` — Candiboost (envoi CV+lettre) + suivi de candidature
- [ ] `coaching` — agenda, réservations, accord coach signé
- [ ] `formations` — ⚠️ **modèle Prisma à créer** (absent des 15 tables initiales, ajouté plus tard côté Supabase) : catalogue, inscription, progression, prix
- [ ] `messaging` — conversations, messages, accusés de lecture
- [ ] `resources` — bibliothèque, contenus verrouillés/payants
- [ ] `admin` — CRUD entreprises & offres, gestion des membres

**Jalon :** toute la logique métier est exposée en GraphQL et testée.

---

## Phase 4 — Frontend par espace

Migration écran par écran avec Apollo Client + Radix UI. Écrire les requêtes dans
`src/graphql/`, régénérer les types (`npm run codegen`), construire les pages.

- [ ] Fondations UI : `layouts/` (Auth, Dashboard, Coach, Admin), composants `ui/`, i18n
- [ ] Auth : login, register, mot de passe oublié
- [ ] Espace **candidat** (`/dashboard`) : profil, CV, jobs, candidatures, messages, ressources, formations
- [ ] Espace **coach** (`/coach`) : candidats, agenda, formations, messages
- [ ] Espace **admin** (`/admin`) : entreprises, offres, membres

**Jalon :** chaque espace est utilisable de bout en bout sur la nouvelle stack.

---

## Phase 5 — Points techniques délicats

- [ ] **Messagerie temps réel** : subscriptions GraphQL (graphql-ws) en remplacement de Supabase Realtime
- [ ] **Stockage fichiers** : S3 / Cloudinary (avatars, CV PDF, pièces jointes) en remplacement de Supabase Storage
- [ ] **Paiement** : intégration **Stripe / MangoPay** — chantier prioritaire signalé au cahier des charges (aujourd'hui simulé en `localStorage`), + répartition revenus coach 25/75, webhooks
- [ ] **SEO / pages publiques** : solution de pré-rendu pour les landing (compensation de la perte du SSR Next)

**Jalon :** parité fonctionnelle complète avec l'app actuelle.

---

## Phase 6 — Qualité & exploitation

- [ ] Suite de tests (Vitest côté web, tests natifs node côté api) sur parcours critiques
- [ ] **CI/CD** (GitHub Actions) : lint + typecheck + build + tests bloquants avant merge
- [ ] **Rate limiting** sur routes coûteuses (IA, email, scraping)
- [ ] Supervision : monitoring d'erreurs (ex. Sentry) + logs structurés
- [ ] Environnements séparés **staging ≠ production**

---

## Phase 7 — Migration des données & bascule

- [ ] Script de migration Supabase → nouveau PostgreSQL (les `@@map` facilitent le mapping)
- [ ] Migration de l'extension navigateur (URL du bridge)
- [ ] Recette complète sur staging (tous les parcours)
- [ ] Bascule DNS progressive
- [ ] Dépréciation / archivage de l'app Next + Supabase

---

## Chantiers transverses (à traiter en continu / au plus tôt)

- [ ] 🔴 **Sécurité — fuite de secrets** : retirer du dépôt actuel (et de l'historique git) le fichier de notes contenant des identifiants en clair, puis **régénérer toutes les clés** (Supabase, OpenRouter…). Signalé §6.2 du cahier des charges.
- [ ] Trancher le sort de `apps/madagascar` (« Collectif 95:59 ») : produit à part ou intégration future.
- [ ] Documentation développeur maintenue à jour (README, structure, conventions).

---

## Récapitulatif visuel

```
Phase 0  ✅ Fondations (scaffold + schéma Prisma)
Phase 1  ▶  DB + Auth (+ OAuth Google)            ← prochaine étape
Phase 2     Services portables (LLM, scraping, email, PDF)
Phase 3     Modules GraphQL (profiles → admin)
Phase 4     Frontend par espace (auth → candidat → coach → admin)
Phase 5     Points durs (realtime, storage, PAIEMENT, SEO)
Phase 6     Qualité & ops (tests, CI, monitoring)
Phase 7     Migration données + bascule
```
