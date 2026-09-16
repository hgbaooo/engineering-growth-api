import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreatePhaseDto, MoveDto, UpdatePhaseDto } from '../common/dto';
import { PhasesService } from './phases.service';

@Controller()
export class PhasesController {
  constructor(private readonly phases: PhasesService) {}
  @Post('roadmaps/:roadmapId/phases') create(@Param('roadmapId', ParseUUIDPipe) roadmapId: string, @Body() dto: CreatePhaseDto) { return this.phases.create(roadmapId, dto); }
  @Patch('phases/:id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePhaseDto) { return this.phases.update(id, dto); }
  @Post('phases/:id/move') move(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MoveDto) { return this.phases.move(id, dto); }
  @Delete('phases/:id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id', ParseUUIDPipe) id: string) { await this.phases.remove(id); }
}
