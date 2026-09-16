import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const enabled = Boolean(process.env.TEST_DATABASE_URL);
describe.skipIf(!enabled)('roadmap HTTP lifecycle', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.PORT = '3001';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.roadmap.deleteMany();
  });
  afterAll(async () => { await app?.close(); });
  it('creates, retrieves, updates status, and cascades phase deletion', async () => {
    const server = app.getHttpServer();
    const roadmap = (await request(server).post('/roadmaps').send({ title: 'Test Systems' }).expect(201)).body;
    const phase = (await request(server).post(`/roadmaps/${roadmap.id}/phases`).send({ title: 'Correctness' }).expect(201)).body;
    const topic = (await request(server).post(`/phases/${phase.id}/topics`).send({ title: 'Transactions' }).expect(201)).body;
    const evidence = (await request(server).post(`/topics/${topic.id}/evidence`).send({ title: 'Experiment', url: 'https://example.com' }).expect(201)).body;
    await request(server).patch(`/topics/${topic.id}/status`).send({ status: 'APPLIED' }).expect(200);
    const detail = (await request(server).get(`/roadmaps/${roadmap.id}`).expect(200)).body;
    expect(detail.progress).toMatchObject({ totalTopics: 1, appliedTopics: 1, percentage: 100 });
    await request(server).delete(`/phases/${phase.id}`).expect(204);
    expect(await prisma.evidence.findUnique({ where: { id: evidence.id } })).toBeNull();
  });
});
