import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TopicStatus } from '../src/generated/prisma/client';

const roadmap = {
  title: 'Systems Engineering',
  slug: 'systems-engineering',
  goal: 'Junior → Mid-level → Senior → Staff / Technical Ownership',
  description: 'Build the mental models required to design, operate, debug, scale, and own real software systems.'
};

const phases = [
  ['Data & Correctness', 'Learn how systems preserve correct data under concurrency, failures, and competing operations.', ['Relational data modeling', 'Database constraints', 'SQL fundamentals', 'JOIN & aggregation', 'Indexes', 'Composite indexes', 'Partial indexes', 'EXPLAIN ANALYZE', 'Query planner', 'ACID', 'Transactions', 'Isolation levels', 'Optimistic locking', 'Pessimistic locking', 'Race conditions', 'Deadlocks']],
  ['Runtime & Concurrency', 'Understand what actually happens beneath application code.', ['Node.js Event Loop', 'Async I/O', 'Microtasks & macrotasks', 'Process vs Thread', 'Worker Threads', 'CPU-bound vs I/O-bound', 'Connection pools', 'Backpressure', 'Operating System fundamentals', 'Memory fundamentals', 'File descriptors', 'Sockets']],
  ['Networking & API', 'Understand communication between clients, services, and infrastructure.', ['DNS', 'TCP fundamentals', 'HTTP', 'HTTP/1.1', 'HTTP/2 concepts', 'TLS', 'Keep-alive', 'Connection pooling', 'REST semantics', 'Authentication', 'Authorization', 'Pagination', 'Rate limiting', 'Timeouts']],
  ['Failure Engineering', 'Stop designing only for the happy path.\nAsk: What can fail?', ['Timeout strategy', 'Retry', 'Exponential backoff', 'Jitter', 'Idempotency', 'Circuit breaker', 'Graceful degradation', 'Health checks', 'Retry storms', 'Failure injection', 'Partial failure']],
  ['Messaging & Async Systems', 'Understand asynchronous processing and reliable message delivery.', ['Message Queue fundamentals', 'BullMQ', 'Producer / Consumer', 'Acknowledgement', 'At-most-once delivery', 'At-least-once delivery', 'Retry', 'Dead Letter Queue', 'Message ordering', 'Duplicate messages', 'Idempotent consumers', 'Backpressure', 'Transactional Outbox']],
  ['Cache & Consistency', 'Improve performance without losing control of data correctness.', ['Redis fundamentals', 'Cache-aside', 'TTL', 'Eviction', 'Cache invalidation', 'Stale data', 'Cache stampede', 'Hot keys', 'Source of truth', 'Consistency trade-offs', 'Distributed locking concepts']],
  ['Observability', 'Understand what production systems are actually doing.\n\nDo not guess why production is slow.\nMeasure it.', ['Structured logging', 'Request ID', 'Correlation ID', 'Metrics', 'Distributed tracing', 'OpenTelemetry', 'p50 latency', 'p95 latency', 'p99 latency', 'Throughput', 'Error rate', 'Saturation', 'Alerting']],
  ['Distributed Systems', 'Reason about systems where components communicate over unreliable networks.', ['Replication', 'Partitioning', 'Sharding', 'Leader / Follower', 'Consistency models', 'Availability', 'Network partitions', 'Eventual consistency', 'CAP theorem', 'Distributed transactions', 'Saga', 'Event-driven architecture', 'Consensus fundamentals']],
  ['Scalability & Performance', 'Measure bottlenecks and evolve systems as load grows.\n\nMeasure → Find bottleneck → Optimize → Measure again', ['Vertical scaling', 'Horizontal scaling', 'Load balancing', 'Stateless services', 'Database connection limits', 'Read replicas', 'Partitioning', 'Caching layers', 'Async processing', 'Rate limiting', 'Bottleneck analysis', 'Load testing', 'Capacity planning']],
  ['Security', 'Treat security as a property of the entire system, not a feature added at the end.', ['Authentication vs Authorization', 'Sessions', 'JWT', 'OAuth', 'OpenID Connect', 'Password hashing', 'Secrets management', 'SQL Injection', 'XSS', 'CSRF', 'SSRF', 'CORS', 'Access control', 'Encryption in transit', 'Encryption at rest', 'OWASP Top 10', 'Threat modeling']],
  ['Production Engineering', 'Learn how software survives outside the development machine.', ['Linux fundamentals', 'Docker', 'CI/CD', 'Reverse proxy', 'Load balancing', 'Configuration management', 'Rolling deployment', 'Blue-green deployment', 'Canary deployment', 'Database migrations', 'Rollback', 'Backup', 'Restore', 'Disaster recovery']],
  ['Architecture & Technical Ownership', 'Move from implementing requirements to owning technical decisions and system evolution.\n\nBusiness Requirement\n↓\nDomain Model\n↓\nData Ownership\n↓\nConsistency\n↓\nFailure Scenarios\n↓\nSecurity\n↓\nObservability\n↓\nScalability\n↓\nCost\n↓\nArchitecture\n↓\nTechnical Decision', ['Modular Monolith', 'Microservices trade-offs', 'Domain boundaries', 'DDD fundamentals', 'Clean Architecture', 'Hexagonal Architecture', 'Architecture Decision Records', 'SLO', 'SLA', 'Reliability vs Cost', 'Maintainability', 'Architecture trade-offs', 'System Design', 'Capacity planning', 'Technical ownership']]
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required to seed the database.');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await prisma.roadmap.upsert({
      where: { slug: roadmap.slug },
      update: {},
      create: {
        ...roadmap,
        phases: {
          create: phases.map(([title, description, topics], phaseIndex) => ({
            title,
            description,
            order: phaseIndex + 1,
            topics: {
              create: topics.map((title, topicIndex) => ({
                title,
                order: topicIndex + 1,
                status: TopicStatus.NOT_STARTED
              }))
            }
          }))
        }
      }
    });
    console.log('Systems Engineering roadmap is ready.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
