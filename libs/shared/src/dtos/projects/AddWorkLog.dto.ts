import { IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class AddWorkLogDto {
  @IsUUID()
  taskId: string;

  @IsNumber()
  @Min(1)
  timeSpent: number;

  @IsDateString()
  workDate: string; // ⬅️ дата, яку обрав юзер (yyyy-mm-dd)
}
