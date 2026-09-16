import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../src/prisma/prisma.service';
import { TopicsService } from '../src/topics/topics.service';

describe('TopicsService', () => {
  it('updates topic status and touches its containing phase and roadmap', async () => {
    const transaction = { topic: { update: vi.fn().mockResolvedValue({ id: 'topic-id', status: 'APPLIED' }) }, phase: { update: vi.fn() }, roadmap: { update: vi.fn() } };
    const prisma = {
      topic: { findUnique: vi.fn().mockResolvedValue({ id: 'topic-id', phaseId: 'phase-id', phase: { id: 'phase-id', roadmapId: 'roadmap-id' } }) },
      $transaction: vi.fn(async (callback: (client: typeof transaction) => Promise<unknown>) => callback(transaction))
    } as unknown as PrismaService;
    const service = new TopicsService(prisma);
    await expect(service.updateStatus('topic-id', { status: 'APPLIED' })).resolves.toEqual({ id: 'topic-id', status: 'APPLIED' });
    expect(transaction.topic.update).toHaveBeenCalledWith({ where: { id: 'topic-id' }, data: { status: 'APPLIED' } });
    expect(transaction.phase.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'phase-id' } }));
    expect(transaction.roadmap.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'roadmap-id' } }));
  });
});
