import { Injectable } from '@nestjs/common';
import { Prisma, Roadmap } from '../generated/prisma/client';
import { calculateProgress } from '../common/progress';
import { conflict, notFound } from '../common/errors';
import { CreateRoadmapDto, UpdateRoadmapDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

const roadmapDetailInclude = {
  phases: {
    orderBy: { order: 'asc' },
    include: {
      topics: {
        orderBy: { order: 'asc' },
        include: { evidence: { orderBy: { createdAt: 'asc' } } }
      }
    }
  }
} satisfies Prisma.RoadmapInclude;

type RoadmapDetail = Prisma.RoadmapGetPayload<{ include: typeof roadmapDetailInclude }>;

@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roadmaps = await this.prisma.roadmap.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { phases: { include: { topics: { select: { status: true } } } } }
    });
    return roadmaps.map(({ phases, ...roadmap }) => ({
      ...roadmap,
      progress: calculateProgress(phases.flatMap((phase) => phase.topics))
    }));
  }

  async findById(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id }, include: roadmapDetailInclude });
    if (!roadmap) throw notFound('Roadmap');
    return this.present(roadmap);
  }

  async findBySlug(slug: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { slug }, include: roadmapDetailInclude });
    if (!roadmap) throw notFound('Roadmap');
    return this.present(roadmap);
  }

  async create(dto: CreateRoadmapDto) {
    const slug = dto.slug ?? await this.nextSlug(dto.title);
    if (dto.slug && await this.prisma.roadmap.findUnique({ where: { slug } })) throw conflict('That roadmap slug is already in use.');
    const roadmap = await this.prisma.roadmap.create({ data: { ...dto, slug } });
    return this.findById(roadmap.id);
  }

  async update(id: string, dto: UpdateRoadmapDto) {
    await this.ensureRoadmap(id);
    if (dto.slug) {
      const existing = await this.prisma.roadmap.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) throw conflict('That roadmap slug is already in use.');
    }
    await this.prisma.roadmap.update({ where: { id }, data: dto });
    return this.findById(id);
  }

  async remove(id: string) {
    await this.ensureRoadmap(id);
    await this.prisma.roadmap.delete({ where: { id } });
  }

  async ensureRoadmap(id: string): Promise<Roadmap> {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap) throw notFound('Roadmap');
    return roadmap;
  }

  private present(roadmap: RoadmapDetail) {
    const phases = roadmap.phases.map((phase) => ({ ...phase, progress: calculateProgress(phase.topics) }));
    return { ...roadmap, phases, progress: calculateProgress(roadmap.phases.flatMap((phase) => phase.topics)) };
  }

  private async nextSlug(title: string) {
    const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'roadmap';
    let candidate = base;
    let suffix = 2;
    while (await this.prisma.roadmap.findUnique({ where: { slug: candidate }, select: { id: true } })) candidate = `${base}-${suffix++}`;
    return candidate;
  }
}
