# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Xavi Noguera. Monorepo with two separate apps:
- **`/frontend`** — Nuxt 4 (Vue 3) app, deployed to Netlify
- **`/backend`** — Sanity Studio v5, deployed to sanity.io

Both apps require their own `.env` (copy from `.env.example`).

## Commands

### Frontend (`cd frontend`)
```bash
npm run dev          # dev server at localhost:3000, auto-opens browser
npm run build        # nuxt build + env validation (production)
npm run generate     # static SSG build + env validation
npm run preview      # preview production build locally
```

### Backend (`cd backend`)
```bash
npm run dev          # Sanity Studio at localhost:3333
npm run deploy       # deploy studio to sanity.io
npm run build        # build studio
```

There are no test suites in this project.

## Architecture

### Data Flow
All content lives in Sanity. The frontend fetches it via GROQ queries defined in `frontend/app/data/`. Queries use reusable fragments from `fragments.js`. Data fetching uses Nuxt's `useAsyncData()` for SSR/SSG compatibility.

In production (`APP_ENV=production`), the site fully prerenderers all routes via `nitro.routeRules` and uses Sanity's CDN. In preview mode (`APP_ENV=preview`), SSR is disabled (client-side rendering) to avoid caching issues with draft content.

### Frontend Structure (`frontend/app/`)
- `pages/` — file-based routing: `index.vue` (horizontal scroll gallery), `work/index.vue` (grid archive), `work/[id].vue` (project detail), `legal/[id].vue`
- `data/` — GROQ query functions, one file per content type
- `components/common/` — shared components; `PageBuilder.vue` renders flexible Sanity block content
- `stores/` — Pinia stores for menu state, site URL, and previous route tracking
- `composables/` — `seo.js` (meta/OG tags), `videoPlayer.js`, `cookieConsent.js`

### Key Frontend Behaviors
- **View Transitions API** is enabled (`viewTransition: true`) for shared-element morphing between the homepage thumbnail and `/work/[slug]` hero image
- **PostCSS pxtorem** runs on most CSS properties — write `px` values, they auto-convert to `rem` (and `px` fallback is kept via `replace: false`)
- **GTM**: injected only when `GTM_ID` env var is set
- GROQ queries always filter drafts: `!(_id in path("drafts.**"))`

### Backend Structure (`backend/`)
- `schemaTypes/` — Sanity document/object schemas
- `schemaTypes/singleton/` — single-instance pages (homePage, about, contact, projectsArchive)
- `schemaTypes/blockContentFlexibleObjects/` — embeddable block types (gallery, media)
- `src/structure.js` — Sanity Studio sidebar layout
- `sanity.config.js` — studio config, document preview URLs pointing to Netlify preview domain

### Environment Variables

**Frontend** (required):
- `APP_ENV` — `development` | `preview` | `production`
- `SANITY_PROJECT_ID`, `SANITY_PROJECT_DATASET`, `SANITY_API_VERSION`
- `NUXT_PUBLIC_SITE_URL` — used for canonical URLs and sitemap

**Backend** (required):
- `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_HOST`
- `SANITY_STUDIO_PREVIEW_URL`, `SANITY_STUDIO_PRODUCTION_URL`

## Code Style

Prettier (backend config, follow for frontend too): no semicolons, single quotes, print width 100, no bracket spacing.
