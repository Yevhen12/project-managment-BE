import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
} from '@/shared/constants/enums';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsNumber,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TASK_STATUSES)
  @IsOptional()
  status?: TASK_STATUSES;

  @IsEnum(TASK_PRIORITIES)
  @IsOptional()
  priority?: TASK_PRIORITIES;

  @IsEnum(TASK_TYPES)
  @IsOptional()
  type?: TASK_TYPES;

  @IsUUID()
  @IsOptional()
  assignee?: string;

  @IsNumber()
  @IsOptional()
  loggedTime?: number;

  @IsNumber()
  @IsOptional()
  estimate?: number;

  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsUUID()
  @IsOptional()
  sprintId?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  labelIds?: string[];

  @IsUUID()
  @IsOptional()
  reporter?: string;
}
