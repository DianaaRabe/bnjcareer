# Skills Maker — Refonte (stack découplée)

Nouveau socle technique, isolé de l'app Next actuelle (`../apps/web`) qui reste en production
pendant la migration.

## Stack

- **Backend** (`apps/api`) — Node + Express + Apollo Server (GraphQL) + Prisma + PostgreSQL
- **Frontend** (`apps/web`) — Vite + React (SPA) + Apollo Client + codegen
- **Partagé** (`packages/`) — types & config

## Démarrage

```bash
cd skills-maker
npm install

# Backend
cp apps/api/.env.example apps/api/.env   # renseigner DATABASE_URL, JWT_SECRET...
npm run db:migrate
npm run codegen -w apps/api   # types des resolvers (typescript-resolvers)
npm run dev:api               # http://localhost:4000/graphql

# Frontend
npm run codegen -w apps/web   # types des queries (client preset)
npm run dev:web               # http://localhost:5173
```

Voir `../docs/BOILERPLATE-STRUCTURE.md` pour la structure détaillée et le flux de données.

## État

Squelette de départ : bootstrap serveur + module `auth` complet (exemple de référence).
Les autres modules (`profiles`, `cv`, `jobs`, `coaching`, `formations`, `messaging`,
`resources`, `admin`) suivent le même patron — voir `apps/api/src/graphql/modules/auth/`.
