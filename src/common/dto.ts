import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { TOPIC_STATUSES } from './progress';

const trim = Transform(({ value }) => typeof value === 'string' ? value.trim() : value);

export class CreateRoadmapDto {
  @trim @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @trim @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(180) slug?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) goal?: string;
}
export class UpdateRoadmapDto {
  @trim @IsOptional() @IsString() @MinLength(1) @MaxLength(160) title?: string;
  @trim @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(180) slug?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string | null;
  @trim @IsOptional() @IsString() @MaxLength(10000) goal?: string | null;
}
export class CreatePhaseDto {
  @trim @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string;
}
export class UpdatePhaseDto {
  @trim @IsOptional() @IsString() @MinLength(1) @MaxLength(160) title?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string | null;
}
export class CreateTopicDto {
  @trim @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) notes?: string;
}
export class UpdateTopicDto {
  @trim @IsOptional() @IsString() @MinLength(1) @MaxLength(200) title?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string | null;
  @trim @IsOptional() @IsString() @MaxLength(10000) notes?: string | null;
}
export class UpdateTopicStatusDto {
  @IsIn(TOPIC_STATUSES) status!: (typeof TOPIC_STATUSES)[number];
}
export class CreateEvidenceDto {
  @trim @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @trim @IsString() @IsUrl({ require_tld: false }) @MaxLength(2048) url!: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string;
}
export class UpdateEvidenceDto {
  @trim @IsOptional() @IsString() @MinLength(1) @MaxLength(200) title?: string;
  @trim @IsOptional() @IsString() @IsUrl({ require_tld: false }) @MaxLength(2048) url?: string;
  @trim @IsOptional() @IsString() @MaxLength(10000) description?: string | null;
}
export class MoveDto { @IsIn(['UP', 'DOWN']) direction!: 'UP' | 'DOWN'; }
