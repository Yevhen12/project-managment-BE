import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
} from '@/shared/constants/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TASK_STATUSES)
  status: TASK_STATUSES;

  @IsEnum(TASK_PRIORITIES)
  priority: TASK_PRIORITIES;

  @IsEnum(TASK_TYPES)
  type: TASK_TYPES;

  @IsUUID()
  assignee: string;

  @IsNumber()
  estimate: number;

  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  sprintId?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  labelIds?: string[];
}
