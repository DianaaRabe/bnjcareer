# Analyse de migration — BNJ Skills Maker → stack découplée (GraphQL/Prisma)

> Document d'aide à la décision. Compare deux options pour rendre BNJ Skills Maker
> professionnel et robuste : **durcir la stack actuelle** ou **migrer vers une architecture
> découplée** (backend GraphQL dédié + frontend SPA). Inclut le plan de migration par tranches.
>
> _Rédigé le 21 juillet 2026 — master @ cbb20ae_

---

## 1. Rappel des deux stacks

| | **BNJ (actuel)** | **Stack cible (découplée)** |
|---|---|---|
| **Architecture** | Monolithe Next.js (front + back fusionnés) | **Découplée** : back séparé ↔ front séparé |
| **Frontend** | Next.js 14 App Router (SSR) | **Vite + React SPA** + React Router |
| **Backend** | Route handlers REST dans Next | **Express + Apollo Server (GraphQL)** |
| **API** | REST (`fetch('/api/...')`) | **GraphQL** + codegen (types auto) |
| **Base + Auth** | Supabase (Postgres managé + Auth + RLS) | **Postgres auto-géré + Prisma + JWT/bcrypt** |
| **Realtime** | Supabase Realtime | **graphql-ws** (WebSocket subscriptions) |
| **Fichiers** | Supabase Storage | **S3 / Cloudinary** |
| **UI** | Tailwind seul | Tailwind + **Radix UI** + codegen |

**En clair :** on passe d'un modèle « tout-en-un Supabase + Next » à un modèle
« backend Node/GraphQL fait maison + frontend SPA », une architecture standard et
largement adoptée dans l'industrie.

---

## 2. Faisabilité

**Oui, c'est faisable — toutes les fonctionnalités peuvent être conservées.**
Les fonctionnalités sont de la *logique métier* ; elles survivent à un changement de techno.
Ce qui change, c'est tout ce qui les branche ensemble.

⚠️ Ce n'est **pas un changement de config** : c'est une **réécriture de la plomberie**
(data, auth, API, routing, rendu).

### Ce qui CHANGE (à réécrire)

1. **Tout le frontend** — Next App Router → SPA Vite. Plus de Server Components ni de SSR ;
   routing via React Router, données via Apollo Client au lieu de `fetch`.
2. **Toute la couche API** — les 30 `route.ts` REST → schéma GraphQL modulaire
   (resolvers + services), organisé par domaine (`modules/auth`, `modules/cv`…).
3. **Auth complète** — Supabase Auth + Google OAuth + RLS → JWT + bcrypt + RBAC applicatif.
   Le OAuth Google et le RLS n'ont pas d'équivalent gratuit : à reconstruire à la main.
4. **Base de données** — schéma SQL Supabase → schéma **Prisma + migrations**
   + migration des données existantes.
5. **Messagerie temps réel** — Supabase Realtime → subscriptions graphql-ws.
6. **Système multi-tenant** — aujourd'hui basé sur le `middleware.ts` Next + injection SSR
   de variables CSS. En SPA il n'y a **pas de middleware serveur** : la détection passe côté
   client + un *tenant context* dans le backend GraphQL. **Point le plus délicat.**

### Ce qui RESTE (technos spécifiques, réutilisables)

Code Node/TS portable, indépendant du framework. Se recolle avec peu de modifs
côté nouveau backend Express :

- ✅ **LLM** (Groq / OpenRouter, rotation de clés, extracteurs anti-hallucination) — portable tel quel
- ✅ **Scraping Apify + Puppeteer** — se rebranche dans un resolver GraphQL
- ✅ **Brevo (email)** — portable tel quel
- ✅ **Génération CV / PDF** — BNJ utilise `html2pdf` (navigateur) ; adaptable en génération serveur si besoin
- ✅ **Extension Chrome** — indépendante (juste l'URL du bridge à changer)
- ✅ **Logique métier** — matching, scoring, config des 3 tenants, types

---

## 3. Comparaison : Migrer vs Durcir sur place

| Critère | 🔵 **Durcir BNJ (Next + Supabase)** | 🟣 **Migrer vers la stack découplée** |
|---|---|---|
| **Effort** | Faible — 1 à 2 semaines | Élevé — plusieurs semaines à mois |
| **Risque** | Faible (on ajoute, on ne casse rien) | Élevé (réécriture, gel des features) |
| **Robustesse gagnée** | ~80 % (RLS, zod, tests, CI) | ~95 % (+ back découplé, GraphQL typé) |
| **SEO / landing publiques** | ✅ conservé (SSR Next) | ⚠️ à reconstruire (SPA) |
| **Auth / OAuth Google** | ✅ déjà là (Supabase) | ❌ à refaire (JWT maison) |
| **Types de bout en bout** | Bon (codegen Supabase) | Excellent (GraphQL codegen) |
| **Découplage / réutilisable (mobile…)** | ❌ non (monolithe) | ✅ oui |
| **Pérennité / indépendance technique** | ❌ dépendance forte à Supabase | ✅ oui — **le vrai argument** |
| **Coût d'ops** | Faible (Supabase gère) | Plus élevé (tout auto-hébergé) |

### Ce que la migration fait GAGNER

- Backend découplé réutilisable (une future app mobile taperait le même GraphQL)
- GraphQL + codegen → types de bout en bout, éliminerait une bonne part des 112 `any`
- Prisma + migrations → schéma versionné (contre le `schema.prisma` vide actuel)
- Architecture standard, patterns éprouvés (structure modulaire, RBAC, tests) à appliquer
- Fin du lock-in Supabase

### Ce que la migration fait PERDRE / risques

- **SSR et SEO** : Next rend côté serveur (utile pour landing publiques + référencement des
  offres). Une SPA Vite est rendue côté client → **SEO affaibli**, à anticiper via une
  solution de pré-rendu.
- **Turnkey Supabase** (auth, storage, realtime prêts à l'emploi) → tout à redévelopper et héberger.
- **Gel des fonctionnalités** pendant la migration.

### Comment décider — la seule vraie question

- **But = « BNJ fiable et pro, rapidement »** → **Durcir sur place.**
  Le gros du gain sans risque. La migration serait de l'énergie mal placée.
- **But = « une architecture découplée, réutilisable et pérenne »**
  → **Migrer.** Le bénéfice n'est pas la robustesse (acquise des deux côtés) mais
  **le découplage et l'indépendance vis-à-vis du fournisseur**.

> **Recommandation :** ne migrer **que** si l'objectif est le découplage / la pérennité technique.
> Si c'est juste « robuste », la migration est disproportionnée. Et même en migrant,
> **durcir d'abord le backend GraphQL** (zod, tests, autorisation) — c'est le socle réutilisable.

---

## 4. Plan de migration par tranches

> Ce découpage en 5 tranches est le raisonnement initial. L'exécution détaillée et à jour
> (8 phases, incluant le paiement et les chantiers remontés du cahier des charges) vit dans
> `PLAN-DEVELOPPEMENT.md` — s'y référer pour le suivi réel.

Principe : **jamais de big-bang.** À chaque tranche, l'app reste fonctionnelle. On construit
le nouveau backend à côté, puis on bascule le front morceau par morceau. **L'ancienne app BNJ
reste en prod jusqu'à validation de chaque tranche ; on ne débranche Supabase qu'à la fin.**

### Tranche 0 — Fondations
- Créer `apps/api` (Express + Apollo Server) et `apps/web` (Vite + React)
- Modéliser le schéma **Prisma** à partir du `schema.sql` Supabase actuel (15 tables) + `prisma migrate`
- Script de **migration des données** Supabase → nouveau Postgres
- Mettre en place la structure GraphQL modulaire, les patterns RBAC, la config codegen, les tests

### Tranche 1 — Auth (socle de tout le reste)
- Réécrire l'auth : JWT + bcrypt (module `auth` comme référence de patron)
- Reconstruire le **Google OAuth** (point sensible : plus de Supabase Auth)
- Porter le RBAC candidat / coach / admin en resolvers GraphQL
- ✅ Livrable : login fonctionnel sur le nouveau stack

### Tranche 2 — Backend métier « portable »
Rebrancher les technos spécifiques **dans des resolvers GraphQL** (quasi inchangées) :
- LLM (Groq/OpenRouter) → resolvers `optimizeCV`, `matchJob`, `chat`
- Scraping Apify/Puppeteer → resolver `scrapeJobs`
- Brevo email, génération PDF
- ✅ Livrable : logique métier exposée en GraphQL, testée

### Tranche 3 — Frontend, module par module
Migrer du plus simple au plus complexe (Apollo Client + Radix UI) :
1. Landing + auth
2. Dashboard candidat (profil, CV, jobs)
3. Espace coach
4. Admin (Community)
- ✅ Livrable : chaque espace basculé indépendamment

### Tranche 4 — Points délicats
- **Multi-tenant en SPA** : détection côté client + tenant context dans les requêtes GraphQL
  (remplace le `middleware.ts` Next)
- **Messagerie temps réel** : Supabase Realtime → subscriptions graphql-ws
- **Fichiers** : Supabase Storage → S3/Cloudinary
- **SEO** : décider du pré-rendu pour les pages publiques

### Tranche 5 — Finitions
- Migrer l'extension Chrome (URL du bridge)
- CI/CD, monitoring (Sentry), environnements staging / prod
- Bascule DNS, dépréciation de l'ancien Supabase

### Ordre de bascule résumé

```
0. Fondations (Prisma + squelette api/web)
1. Auth ──────────────► socle
2. Backend métier ────► resolvers (LLM, scraping, email)
3. Frontend par module ► landing → candidat → coach → admin
4. Points durs ───────► tenant, realtime, storage, SEO
5. Finitions ─────────► extension, CI, monitoring, DNS
```

---

## 5. Alternative : durcir sans changer de stack

Si l'objectif est seulement la robustesse, ~80 % du gain s'obtient **sans migration** :

1. **RLS Supabase** — policies par table (`profiles`, `cvs`, `messages`, `applications`…)
2. **Validation `zod`** sur les routes sensibles (auth, paiement formations, admin)
3. **Tests** des parcours critiques (auth, RBAC, envoi CV, réservation) — Vitest + Playwright
4. **CI GitHub Actions** (lint + typecheck + build + test)
5. **Types Supabase générés** (`supabase gen types`) → réduit les 112 `any`
6. **Nettoyage de dette** : un seul gestionnaire de paquets, `schema.prisma`, URL prod
   dupliquée dans le manifest de l'extension
