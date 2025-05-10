import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class AddCommentDto {
  @IsUUID()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
