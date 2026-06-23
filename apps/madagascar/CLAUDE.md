# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Collectif 95:59** — an employment assistance platform for Madagascar. Helps job seekers (students, graduates, career changers) improve their employability via job aggregation, CV optimization, coaching, and immigration pathways (especially Canada).

Part of the BNJ Career Turborepo monorepo at `apps/madagascar/`.

### Target Users (ICPs)

- **ICP1 (Candidates):** Students, recent graduates, career changers, passive job seekers
- **ICP2 (Coaches/Trainers):** Certified coaches and trainers managing workshops, resources, and candidates

## Tech Stack

- **Next.js 16.2** with App Router (React 19, RSC by default)
- **Tailwind CSS 4.3** (v4 syntax — `@import "tailwindcss"`, `@theme inline`, no tailwind.config.js)
- **Shadcn/ui** (radix-nova style, oklch colors, CSS variables)
- **Aceternity UI** — registered as `@aceternity` in components.json for `npx shadcn@latest add @aceternity/<component>`
- **Framer Motion** via `motion` package (import from `"motion/react"`, NOT `"framer-motion"`)
- **@tabler/icons-react** + **lucide-react** for icons

## Commands

```bash
# From monorepo root (E:\BNJ Career)
npm run dev              # Starts all apps (turbo)

# From apps/madagascar/
npm run dev              # Next.js dev server (port 3001 if 3000 taken)
npm run build            # Production build
npm run lint             # ESLint

# Adding Shadcn components
npx shadcn@latest add button
npx shadcn@latest add @aceternity/3d-marquee  # Aceternity registry
```

## Architecture

```
apps/madagascar/
├── app/
│   ├── layout.tsx       # Root layout: Geist fonts, metadata, dark class
│   ├── page.tsx          # Landing page (home)
│   └── globals.css       # Tailwind v4 imports + shadcn CSS variables (oklch)
├── components/
│   ├── ui/               # Shadcn & Aceternity primitives
│   └── landing/          # Landing page section components (Hero, Features, CTA, etc.)
├── lib/
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
└── public/               # Static assets (images, noise.webp, logos)
```

## Key Conventions

- **All user-facing text in French** — this is a Madagascar-focused platform
- **Dark theme by default** — the landing page uses a dark aesthetic (slate-800/gray-900 backgrounds)
- **Tailwind v4 syntax**: No `tailwind.config.js`. Theme extension via `@theme inline` in globals.css. Custom colors use oklch format.
- **Motion imports**: Always `import { motion } from "motion/react"` (NOT `framer-motion`)
- **Path alias**: `@/*` maps to the app root
- **Components**: Each landing section is a separate component in `components/landing/`. UI primitives live in `components/ui/`.
- **Images**: Use Next.js `<Image>` for optimized images. Placeholder images from Unsplash or `/public/` folder.
- **Responsive**: Mobile-first design, all sections must be fully responsive

## AGENTS.md Warning

Next.js 16 has breaking changes from earlier versions. If unsure about an API, check `node_modules/next/dist/docs/` before writing code.
