// shared/dtos/projects/CreateSprint.dto.ts
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSprintDto {
  @IsNotEmpty()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  projectId: string;
}
