import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { CreateEvidenceDto, UpdateEvidenceDto } from '../common/dto';
import { notFound } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(topicId: string, dto: CreateEvidenceDto) {
    const topic = await this.withParents(topicId);
    return this.prisma.$transaction(async (tx) => {
      const evidence = await tx.evidence.create({ data: { topicId, ...dto } });
      await this.touch(tx, topic.phase.roadmapId, topic.phaseId, topicId);
      return evidence;
    });
  }

  async update(id: string, dto: UpdateEvidenceDto) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id }, include: { topic: { include: { phase: true } } } });
    if (!evidence) throw notFound('Evidence');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.evidence.update({ where: { id }, data: dto });
      await this.touch(tx, evidence.topic.phase.roadmapId, evidence.topic.phaseId, evidence.topicId);
      return updated;
    });
  }

  async remove(id: string) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id }, include: { topic: { include: { phase: true } } } });
    if (!evidence) throw notFound('Evidence');
    await this.prisma.$transaction(async (tx) => {
      await tx.evidence.delete({ where: { id } });
      await this.touch(tx, evidence.topic.phase.roadmapId, evidence.topic.phaseId, evidence.topicId);
    });
  }

  private async withParents(id: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id }, include: { phase: true } });
    if (!topic) throw notFound('Topic');
    return topic;
  }

  private async touch(tx: Prisma.TransactionClient, roadmapId: string, phaseId: string, topicId: string) {
    const now = new Date();
    await tx.topic.update({ where: { id: topicId }, data: { updatedAt: now } });
    await tx.phase.update({ where: { id: phaseId }, data: { updatedAt: now } });
    await tx.roadmap.update({ where: { id: roadmapId }, data: { updatedAt: now } });
  }
}
