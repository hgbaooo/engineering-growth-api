import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateRoadmapDto, UpdateRoadmapDto } from '../common/dto';
import { RoadmapsService } from './roadmaps.service';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmaps: RoadmapsService) {}
  @Get() findAll() { return this.roadmaps.findAll(); }
  @Get('slug/:slug') findBySlug(@Param('slug') slug: string) { return this.roadmaps.findBySlug(slug); }
  @Get(':id') findById(@Param('id', ParseUUIDPipe) id: string) { return this.roadmaps.findById(id); }
  @Post() create(@Body() dto: CreateRoadmapDto) { return this.roadmaps.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoadmapDto) { return this.roadmaps.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id', ParseUUIDPipe) id: string) { await this.roadmaps.remove(id); }
}
