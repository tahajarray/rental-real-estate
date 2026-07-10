# Rental Real Estate Agency — Next.js

Migrated from a Vite + React Router project (Figma export) to Next.js 15 (App Router).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Auth & data

There is no external database. `AuthContext.tsx` and `EstatesContext.tsx` use local mock
state (auth is persisted to `localStorage` so a session survives a page refresh; property
listings reset to the seed data on every reload).

A seeded admin account is included so `/admin` works out of the box:

- **Email:** `admin@nestfinder.com`
- **Password:** `admin123`

Sign up normally through `/signup` to create a regular (non-admin) account.

## What changed in the migration

- **Routing**: `react-router` → Next.js App Router. Each page from `src/app/pages/*Page.tsx`
  now lives at `src/app/<route>/page.tsx` (file-based routing).
- **Navigation**: `useNavigate()` → `useRouter()` (`next/navigation`), `<Link to="">` → `<Link href="">`.
- **Dynamic route**: `/estate/:id` → `src/app/estate/[id]/page.tsx`. This is a Server Component
  that awaits `params` and passes `id` to `src/components/EstateDetailClient.tsx` (Client Component),
  since Client Components can't directly receive async `params` in Next.js 15.
- **Search params**: `/explore` uses `useSearchParams()`, which requires a `<Suspense>` boundary in
  Next.js — see the wrapper at the bottom of `src/app/explore/page.tsx`.
- **Protected routes**: `<ProtectedRoute>` (any logged-in user) and `<AdminRoute>` (must have
  `role === "admin"`) redirect client-side via `useRouter().replace()` in a `useEffect`.
- **Styling**: Tailwind v4 + your original design tokens (`src/styles/theme.css`) untouched.

## Still TODO for you

- **`src/components/SearchBar.tsx`** has hardcoded French cities (Paris, Lyon, Marseille...) —
  swap these for Tunisian governorates before using this for the Tunisia version.

## Project structure

```
src/
  app/            → routes (page.tsx per screen)
  components/      → shared UI + shadcn/ui components
  context/         → AuthContext, EstatesContext (mock/local state)
  styles/          → globals.css, theme.css, fonts.css
```
