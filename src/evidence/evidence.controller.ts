import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateEvidenceDto, UpdateEvidenceDto } from '../common/dto';
import { EvidenceService } from './evidence.service';

@Controller()
export class EvidenceController {
  constructor(private readonly evidence: EvidenceService) {}
  @Post('topics/:topicId/evidence') create(@Param('topicId', ParseUUIDPipe) topicId: string, @Body() dto: CreateEvidenceDto) { return this.evidence.create(topicId, dto); }
  @Patch('evidence/:id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEvidenceDto) { return this.evidence.update(id, dto); }
  @Delete('evidence/:id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id', ParseUUIDPipe) id: string) { await this.evidence.remove(id); }
}
