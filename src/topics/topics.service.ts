import { Injectable } from '@nestjs/common';
import { Prisma, TopicStatus } from '../generated/prisma/client';
import { CreateTopicDto, MoveDto, UpdateTopicDto, UpdateTopicStatusDto } from '../common/dto';
import { invalidMove, notFound } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(phaseId: string, dto: CreateTopicDto) {
    const phase = await this.prisma.phase.findUnique({ where: { id: phaseId } });
    if (!phase) throw notFound('Phase');
    return this.prisma.$transaction(async (tx) => {
      const max = await tx.topic.aggregate({ where: { phaseId }, _max: { order: true } });
      const topic = await tx.topic.create({ data: { phaseId, ...dto, order: (max._max.order ?? 0) + 1 } });
      await this.touch(tx, phase.roadmapId, phaseId);
      return topic;
    });
  }

  async update(id: string, dto: UpdateTopicDto) {
    const topic = await this.withPhase(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.topic.update({ where: { id }, data: dto });
      await this.touch(tx, topic.phase.roadmapId, topic.phaseId);
      return updated;
    });
  }

  async updateStatus(id: string, dto: UpdateTopicStatusDto) {
    const topic = await this.withPhase(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.topic.update({ where: { id }, data: { status: dto.status as TopicStatus } });
      await this.touch(tx, topic.phase.roadmapId, topic.phaseId);
      return updated;
    });
  }

  async move(id: string, dto: MoveDto) {
    const topic = await this.withPhase(id);
    const adjacentOrder = topic.order + (dto.direction === 'UP' ? -1 : 1);
    const adjacent = await this.prisma.topic.findUnique({ where: { phaseId_order: { phaseId: topic.phaseId, order: adjacentOrder } } });
    if (!adjacent) throw invalidMove();
    return this.prisma.$transaction(async (tx) => {
      await tx.topic.update({ where: { id }, data: { order: 0 } });
      await tx.topic.update({ where: { id: adjacent.id }, data: { order: topic.order } });
      await tx.topic.update({ where: { id }, data: { order: adjacent.order } });
      await this.touch(tx, topic.phase.roadmapId, topic.phaseId);
      return [{ id, order: adjacent.order }, { id: adjacent.id, order: topic.order }];
    });
  }

  async remove(id: string) {
    const topic = await this.withPhase(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.topic.delete({ where: { id } });
      await tx.topic.updateMany({ where: { phaseId: topic.phaseId, order: { gt: topic.order } }, data: { order: { decrement: 1 } } });
      await this.touch(tx, topic.phase.roadmapId, topic.phaseId);
    });
  }

  private async withPhase(id: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id }, include: { phase: true } });
    if (!topic) throw notFound('Topic');
    return topic;
  }

  private async touch(tx: Prisma.TransactionClient, roadmapId: string, phaseId: string) {
    const now = new Date();
    await tx.phase.update({ where: { id: phaseId }, data: { updatedAt: now } });
    await tx.roadmap.update({ where: { id: roadmapId }, data: { updatedAt: now } });
  }
}
