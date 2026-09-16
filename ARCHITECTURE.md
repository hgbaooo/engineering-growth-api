# Engineering Growth API Architecture

## Request lifecycle

```text
HTTP Request
  ↓
Controller
  ↓
Validation
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

The API deliberately uses Nest modules, controllers, services, and Prisma directly. This keeps a personal application understandable without CQRS, repositories, event buses, or other speculative layers.

## Modules and data

`Roadmaps`, `Phases`, `Topics`, `Evidence`, and `Overview` own their HTTP behavior. `PrismaModule` owns the single database client. A roadmap has ordered phases; a phase has ordered topics; a topic has evidence. Foreign keys use cascade deletion, so deleting a roadmap removes its phases, topics, and evidence; deleting a phase removes its topics and evidence.

Progress is never persisted. It is derived from topic statuses: only `APPLIED` counts as complete. Shared pure helpers produce a total, applied count, status distribution, and percentage. This preserves topic status as the single source of truth.

## Errors and transactions

DTO validation runs at the HTTP boundary. A global exception filter returns predictable `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INVALID_MOVE`, and `INTERNAL_ERROR` payloads without exposing stack traces.

Creating, deleting, and moving ordered children uses Prisma transactions. Moves swap adjacent positions through a temporary value so unique order constraints remain valid. Child mutations touch their containing phase and roadmap timestamps; roadmap list recency therefore reflects real learning activity.

## Deliberately excluded

V1 has no authentication, caching, background jobs, queues, microservices, WebSockets, Docker setup, deployment pipeline, or external evidence integration.

## Possible future evolution

Authentication can add a user foreign key to roadmaps and filter all nested access through that ownership boundary. Redis caching, background jobs, observability, rate limiting, Docker, and CI/CD are useful future engineering exercises once the simple HTTP → NestJS → PostgreSQL path is well understood.
