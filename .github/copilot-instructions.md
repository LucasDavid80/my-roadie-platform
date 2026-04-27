# Copilot instructions — My Roadie Platform

This file summarizes repository-specific commands, architecture notes, and conventions Copilot should follow when helping in this repo.

---

## Where to run commands
- Most repo tasks run in subprojects: `frontend-web/` and `backend/`. CI runs commands with working-directory set to those folders.
- Node version used in CI: 20 (use `actions/setup-node@v4` style environment).

## Build, test, and lint
Front-end (frontend-web):
- Install: `cd frontend-web && npm ci`
- Dev server: `cd frontend-web && npm run dev`
- Build: `cd frontend-web && npm run build`
- Start (prod): `cd frontend-web && npm run start`
- Lint: `cd frontend-web && npm run lint -- <path or glob>`
- Note: frontend package.json has no test script (CI comments indicate Jest/Vitest are possible but commented out).

Back-end (backend):
- Install: `cd backend && npm ci`
- Prisma: run `cd backend && npx prisma generate` after install and before build/start
- Build: `cd backend && npm run build` (script uses `nest build`)
- Start (dev): `cd backend && npm run start:dev` ; Start prod: `cd backend && npm run start:prod`
- Lint: `cd backend && npm run lint -- <path or glob>` (script runs eslint with fix)
- Run tests (all): `cd backend && npm test` (Jest)
- Run a single test file: `cd backend && npx jest path/to/file.spec.ts`
- Run tests by name: `cd backend && npm test -- -t "pattern"`
- E2E tests: `cd backend && npm run test:e2e`

CI notes: see `.github/workflows/ci.yml` — jobs run `npm ci`, lint, then build. Node 20 is assumed.

## High-level architecture (big picture)
- Monorepo with two primary apps:
  - frontend-web: Next.js app (pinned to Next 16), React 19, Tailwind CSS. Acts as the user-facing frontend.
  - backend: NestJS (v11) TypeScript API service. Uses Prisma as the ORM. Jest is configured for unit tests; e2e runner available.
- Typical flow: frontend calls backend REST/HTTP endpoints (API contract lives in backend). Backend manages DB via Prisma; CI runs `npx prisma generate` before build.
- Each subproject is an isolated npm package with its own lockfile and scripts; treat them as distinct services when running commands.

## Key conventions and repo-specific patterns
- Working-directory patterns: CI uses `defaults.run.working-directory` to scope actions. When running commands locally, `cd` into the subfolder first.
- Node and package manager: Use Node 20 and `npm ci` in CI. Lockfiles are present per subproject (package-lock.json).
- Linting: ESLint is the canonical linter. Backend lint script auto-fixes. Frontend uses `eslint` and `eslint-config-next`.
- TypeScript: TS is enabled in both projects. Backend uses `tsconfig-paths` and related test helpers (ts-jest).
- Tests: Backend test files use `*.spec.ts` and Jest's rootDir is `src` — tests are expected under `src/` (see jest config in backend/package.json).
- Prisma: Always run `npx prisma generate` after installing deps and before build/start.
- Next.js note: frontend pins `next` to 16. There are agent-notes in `frontend-web/CLAUDE.md` — read that before making framework assumptions.
- AI assistant artifacts: frontend contains `CLAUDE.md` and `AGENTS.md` that document local AI/agent rules — Copilot should read them when operating in frontend.

## Files to consult
- `.github/workflows/ci.yml` — CI job flow and node version
- `frontend-web/package.json`, `frontend-web/CLAUDE.md`, `frontend-web/AGENTS.md`
- `backend/package.json` (scripts, jest config, prisma requirement)
- `docs/` — architecture, testing, and contributing notes (consult as needed)

---

Would you like an MCP server configured for this project (e.g., Playwright for frontend end-to-end tests)?