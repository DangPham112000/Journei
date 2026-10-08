# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Journey Planner ("Journei") is a trip-planning web app: a React SPA (`frontend/`) talking to an Express + Apollo GraphQL server (`backend/`) backed by MongoDB. It is a pnpm workspace with those two packages.

The repo uses **pnpm** (migrated from Yarn; see `pnpm-workspace.yaml`, `.npmrc` with `shamefully-hoist=true`). Use `pnpm` for everything.

## Commands

Run from the repo root unless noted.

| Command | What it does |
| --- | --- |
| `pnpm install` | Install all workspace dependencies |
| `pnpm start` | Run backend + frontend in **Mock Mode** (see below) |
| `pnpm start:prod` | Run backend + frontend against a real MongoDB and real Google APIs (needs `.env` files) |
| `pnpm dev:backend` / `pnpm dev:frontend` | Run one side only (non-mock) |
| `pnpm generate` | Regenerate GraphQL types for both packages |
| `pnpm build:backend` / `pnpm build:frontend` | `tsc` build (backend also copies `schema.gql` to `dist/`); frontend runs `tsc -b && vite build` |
| `pnpm --filter frontend lint` | ESLint (frontend only; the backend has no lint script or ESLint config) |

There is no test suite or test runner configured in either package. The type-check via the build commands and the frontend lint are the only automated checks.

Frontend dev server is `http://localhost:5173`; backend is `http://localhost:4000/graphql`. Vite proxies `/graphql` to the backend, and the Apollo client uses the relative `/graphql` URI with `credentials: 'include'`, so the frontend never needs a backend URL.

## Mock Mode

`pnpm start` sets `MOCK_MODE=true VITE_MOCK_MODE=true` and is the default way to develop without Google credentials or a database. It works at two separate layers:

- **Backend** runs `src/mock-index.ts` instead of `src/index.ts`. It starts a `mongodb-memory-server`, points `MONGODB_URI` at it, seeds data via `src/utils/seed.ts`, intercepts Google HTTP calls with `nock`, monkey-patches `OAuth2Client.prototype.verifyIdToken`, and then `require`s `index.ts`. Data is reset on every backend restart (including nodemon reloads).
- **Frontend** `vite.config.ts` aliases `@react-oauth/google` and `@vis.gl/react-google-maps` to stubs in `src/__mocks__/` when `VITE_MOCK_MODE` is true. The stubbed login immediately returns a fake auth code, which the mocked backend accepts as the seeded "Mock User".

Application code contains no mock branches; if you add a new export usage from either aliased package, add it to the matching stub too. Likewise, new models that need dev data go in `seed.ts`.

`mock-index.ts` does not set `JWT_SECRET`, and `loginWithGoogle` throws without it, so mock login still needs `JWT_SECRET` in `backend/.env`.

## Environment variables

- `backend/.env`: `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `FRONTEND_URL` (CORS origin, defaults to `http://localhost:5173`), `GEMINI_API_KEY`, `PORT`, `LOG_LEVEL`.
- `frontend/.env`: `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_MAPS_API_KEY`. In production these are baked into the image as Docker build args from GitHub Secrets.

## GraphQL workflow

`backend/src/schema.gql` is the single source of truth for the API.

- The backend reads it from disk at startup (`readFileSync` next to the compiled entry point, which is why `build` copies it into `dist/`).
- Backend codegen emits resolver types to `backend/src/__generated__/graphql.ts`.
- Frontend codegen reads the **backend's** schema (`../backend/src/**/*.gql`) plus operation documents in `frontend/src/**/*.gql`, and emits typed Apollo hooks (`useGetMyPlansQuery`, `useLoginWithGoogleMutation`, ...) to `frontend/src/__generated__/graphql.ts`.

To change the API: edit `schema.gql`, update `backend/src/graphql/resolvers.ts`, add/adjust operations in `frontend/src/graphql/*.gql`, then run `pnpm generate`. Both `__generated__` files are committed and ESLint-ignored; never edit them by hand. Components should import the generated hooks rather than writing inline `gql` documents.

## Backend architecture

- `src/index.ts` wires Express middleware (pino-http, CORS with credentials, cookie-parser) and mounts Apollo Server at `/graphql`. The context function verifies a JWT from the `token` cookie (or a `Bearer` header) and exposes `{ user, req, res }`, where `user` is the decoded payload `{ id, email }` or `null`.
- `src/graphql/resolvers.ts` holds all resolvers in one file. Protected resolvers are wrapped in `requireAuth(...)`. Resolvers are currently typed with `any` rather than the generated resolver types.
- **Auth flow**: the frontend uses the Google `auth-code` popup flow and sends the code to the `loginWithGoogle` mutation. The backend exchanges it (redirect URI must be `'postmessage'`), upserts the `User` (storing the Google refresh token), and sets a 7-day httpOnly `token` cookie. There is no logout mutation and there are no REST auth routes.
- **Data model and ownership** (`src/models/`): `Plan` belongs to a `User` and references many `Destination`s. `Place` belongs to a `Plan` and references one `Destination` and one `Category`. `ScheduledActivity` references a `Place`. Only `Plan` carries `userId`, so authorization for places and activities is done by walking up to the owning plan and comparing `plan.userId` to `context.user.id`; follow that pattern for new resolvers. Deletes cascade manually in the resolver (plan → places → activities).
- `Category` and `Destination` are global, shared across users, and `create*` for them is get-or-create by unique name. `recommendedPlaces` intentionally returns places from all users for a destination.
- **Field naming mismatch**: Mongoose stores references as `destinationId` / `categoryId` / `placeId`, while the GraphQL types expose `destination` / `category` / `place`. Queries must `.populate()` those paths and the type-level resolvers (`Place.destination`, `ScheduledActivity.place`, ...) map the populated field across. Dates are stored as `Date` and exposed as `String`.
- `src/utils/ai.ts` implements the `askAssistant` mutation using Gemini function calling (`getUserProfile`, `getUserPlans`, `draftPlan`). `draftPlan` does not write anything; it returns a `draftEvent` for the client to confirm.
- Logging uses pino (`src/utils/logger.ts`, pretty-printed outside production) plus an Apollo plugin in `src/utils/graphqlLogger.ts`.

## Frontend architecture

- `src/main.tsx` sets up Apollo, `GoogleOAuthProvider`, and the routes. Everything except `/login` renders inside `layouts/MainLayout.tsx`, which is the auth guard: it runs the `Me` query and redirects to `/login` when there is no user.
- The main feature lives in `src/pages/plans/` (`ManagePlansPage`, `PlanDetailsPage`) with operations in `src/graphql/plans.gql`.
- UI primitives in `src/components/ui/` are shadcn components generated with the `base-nova` style, which is built on **Base UI**, not Radix. Composition uses the `render` prop (e.g. `<Button render={<RouterLink to="/plans" />}>`), not `asChild`. Add new primitives with the shadcn CLI per `components.json`.
- `@/` aliases `frontend/src/`. Styling is Tailwind v3 with CSS variables defined in `src/index.css`.
- `tsconfig.app.json` enables `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noUnusedLocals`/`noUnusedParameters`, so use `import type` for type-only imports and avoid enums and parameter properties; the build fails otherwise.

### Unfinished / legacy areas

- `src/pages/Assistant/index.tsx` is not routed, uses inline `gql`, and calls a `createEvent` mutation that does not exist in the schema. The backend `askAssistant` mutation works, but this page needs rework before it can be wired up.
- `/app` (`App.tsx` with `JourneyPlanner`, `LocationInput`, `Map`) is the original prototype screen with TODO placeholders for map pins. It is routed but not linked from the nav.
- Google Calendar integration is not implemented: `Plan.googleEventId` and the stored refresh token are unused, and `index.ts` only has a TODO for it.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which **deploys to production**: it builds both Docker images (build context is the repo root so the pnpm workspace resolves), pushes them to GHCR, copies `docker-compose.yml` and `nginx/` to the VPS, and restarts the stack. `DEPLOYMENT.md` has the full setup guide.

- Production topology: `nginx-proxy` routes `/graphql` to `backend:4000` and everything else to the `frontend` container (its own nginx with SPA fallback in `frontend/nginx.conf`), with MongoDB on the internal Docker network. Cloudflare terminates TLS.
- The `Cross-Origin-Opener-Policy: same-origin-allow-popups` header is required for the Google login popup and is set in three places that must stay in sync: `frontend/vite.config.ts`, `frontend/nginx.conf`, and `nginx/nginx.conf`.
- New backend env vars must be added to the `environment:` list in `docker-compose.yml` as well as the VPS `.env`, or the container will not receive them.
- `.github/workflows/clear-mongodb.yml` is a manual workflow that wipes the production database volume.

## Code style

Prettier config (`.prettierrc`): semicolons, single quotes, trailing commas, 100-column width, 2-space indent.
