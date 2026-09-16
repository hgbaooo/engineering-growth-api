import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateTopicDto, MoveDto, UpdateTopicDto, UpdateTopicStatusDto } from '../common/dto';
import { TopicsService } from './topics.service';

@Controller()
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}
  @Post('phases/:phaseId/topics') create(@Param('phaseId', ParseUUIDPipe) phaseId: string, @Body() dto: CreateTopicDto) { return this.topics.create(phaseId, dto); }
  @Patch('topics/:id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTopicDto) { return this.topics.update(id, dto); }
  @Patch('topics/:id/status') status(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTopicStatusDto) { return this.topics.updateStatus(id, dto); }
  @Post('topics/:id/move') move(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MoveDto) { return this.topics.move(id, dto); }
  @Delete('topics/:id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id', ParseUUIDPipe) id: string) { await this.topics.remove(id); }
}
