import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'Quero agendar um corte de cabelo' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'ID da conversa anterior (omitir para nova conversa)' })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
