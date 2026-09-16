import { Injectable } from '@nestjs/common';
import { CreatePhaseDto, MoveDto, UpdatePhaseDto } from '../common/dto';
import { invalidMove, notFound } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(roadmapId: string, dto: CreatePhaseDto) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) throw notFound('Roadmap');
    return this.prisma.$transaction(async (tx) => {
      const max = await tx.phase.aggregate({ where: { roadmapId }, _max: { order: true } });
      const phase = await tx.phase.create({ data: { roadmapId, ...dto, order: (max._max.order ?? 0) + 1 } });
      await tx.roadmap.update({ where: { id: roadmapId }, data: { updatedAt: new Date() } });
      return phase;
    });
  }

  async update(id: string, dto: UpdatePhaseDto) {
    const phase = await this.withRoadmap(id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.phase.update({ where: { id }, data: dto });
      await tx.roadmap.update({ where: { id: phase.roadmapId }, data: { updatedAt: new Date() } });
      return updated;
    });
  }

  async move(id: string, dto: MoveDto) {
    const phase = await this.withRoadmap(id);
    const adjacentOrder = phase.order + (dto.direction === 'UP' ? -1 : 1);
    const adjacent = await this.prisma.phase.findUnique({ where: { roadmapId_order: { roadmapId: phase.roadmapId, order: adjacentOrder } } });
    if (!adjacent) throw invalidMove();
    return this.prisma.$transaction(async (tx) => {
      await tx.phase.update({ where: { id: phase.id }, data: { order: 0 } });
      await tx.phase.update({ where: { id: adjacent.id }, data: { order: phase.order } });
      await tx.phase.update({ where: { id: phase.id }, data: { order: adjacent.order } });
      await tx.roadmap.update({ where: { id: phase.roadmapId }, data: { updatedAt: new Date() } });
      return [{ id: phase.id, order: adjacent.order }, { id: adjacent.id, order: phase.order }];
    });
  }

  async remove(id: string) {
    const phase = await this.withRoadmap(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.phase.delete({ where: { id } });
      await tx.phase.updateMany({ where: { roadmapId: phase.roadmapId, order: { gt: phase.order } }, data: { order: { decrement: 1 } } });
      await tx.roadmap.update({ where: { id: phase.roadmapId }, data: { updatedAt: new Date() } });
    });
  }

  private async withRoadmap(id: string) {
    const phase = await this.prisma.phase.findUnique({ where: { id } });
    if (!phase) throw notFound('Phase');
    return phase;
  }
}
