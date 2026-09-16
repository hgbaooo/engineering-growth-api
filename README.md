# Engineering Growth API

NestJS REST API for Engineering Growth. It intentionally keeps the runtime path simple: Next.js → HTTP → NestJS → Prisma → PostgreSQL.

## Tech stack and architecture

NestJS, PostgreSQL, Prisma 7, class-validator, and Vitest. Controllers validate HTTP input, services implement application behavior, and Prisma performs data access. See [ARCHITECTURE.md](./ARCHITECTURE.md) for lifecycle, modules, transactions, progress calculation, error handling, and deliberate exclusions.

## Setup

Create a PostgreSQL database, then configure and initialize the application:

```bash
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

The API defaults to `http://localhost:3001`. `DATABASE_URL`, `FRONTEND_URL`, and `PORT` are required at startup; see `.env.example` for local values.

## Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:seed
pnpm db:studio
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e # requires TEST_DATABASE_URL with migrations applied
pnpm build
```

## API overview

- `/overview` supplies aggregate progress, continuation topics, and roadmap summaries.
- `/roadmaps` manages roadmaps and exposes detail by UUID or `/roadmaps/slug/:slug`.
- Nested phase and topic creation lives under the owning roadmap/phase.
- `/phases/:id/move` and `/topics/:id/move` accept `UP` or `DOWN`.
- Topic status, evidence, edit, and deletion routes follow the REST contract in the project specification.

Successful responses return resources directly and deletion returns `204`. Errors consistently return `error.code`, `error.message`, and optional `error.details`; validation, missing records, conflicts, and invalid moves do not leak stack traces.

## Database and future authentication

Roadmaps contain ordered phases, phases contain ordered topics, and topics contain evidence. Cascade foreign keys deliberately remove descendants when a roadmap or phase is deleted. Progress is derived from `APPLIED` topics and never stored.

Authentication is intentionally deferred. A future `User` model and `roadmap.userId` ownership relation can be introduced at the roadmap boundary, then enforced for all nested resources without changing the learning model.
