import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateAvatarDto {
  @ApiProperty({ description: 'Imagem em base64 (data URI)' })
  @IsString()
  @MaxLength(3_000_000)
  avatarUrl: string;
}
