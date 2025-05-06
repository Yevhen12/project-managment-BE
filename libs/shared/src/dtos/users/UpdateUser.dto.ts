// dtos/UpdateUserProfileDto.ts
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
