import { Module } from '@nestjs/common';
import { EvidenceModule } from './evidence/evidence.module';
import { OverviewModule } from './overview/overview.module';
import { PhasesModule } from './phases/phases.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { TopicsModule } from './topics/topics.module';

@Module({ imports: [PrismaModule, OverviewModule, RoadmapsModule, PhasesModule, TopicsModule, EvidenceModule] })
export class AppModule {}
