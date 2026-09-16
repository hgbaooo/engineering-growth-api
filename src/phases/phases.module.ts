import { Module } from '@nestjs/common';
import { PhasesController } from './phases.controller';
import { PhasesService } from './phases.service';
@Module({ controllers: [PhasesController], providers: [PhasesService] })
export class PhasesModule {}
