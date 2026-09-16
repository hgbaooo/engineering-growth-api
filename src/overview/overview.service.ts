import { Injectable } from '@nestjs/common';
import { calculateProgress } from '../common/progress';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const roadmaps = await this.prisma.roadmap.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: { topics: { orderBy: { order: 'asc' }, select: { id: true, title: true, status: true, order: true } } }
        }
      }
    });
    const allTopics = roadmaps.flatMap((roadmap) => roadmap.phases.flatMap((phase) => phase.topics));
    const active = roadmaps.flatMap((roadmap) => roadmap.phases.flatMap((phase) => phase.topics.map((topic) => ({
      ...topic,
      phase: { id: phase.id, title: phase.title },
      roadmap: { id: roadmap.id, title: roadmap.title, slug: roadmap.slug }
    }))));
    const rank = { PRACTICING: 0, LEARNING: 1, NOT_STARTED: 2, APPLIED: 3 } as const;
    const continueLearning = active.filter((topic) => topic.status !== 'APPLIED').sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 4);
    return {
      progress: calculateProgress(allTopics),
      continueLearning,
      roadmaps: roadmaps.map(({ phases, ...roadmap }) => ({
        ...roadmap,
        progress: calculateProgress(phases.flatMap((phase) => phase.topics))
      }))
    };
  }
}
