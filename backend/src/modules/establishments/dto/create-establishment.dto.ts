import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateEstablishmentDto {
  @ApiProperty({ example: 'Barbearia do João' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '11999999999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'A melhor barbearia da cidade' })
  @IsOptional()
  @IsString()
  description?: string;
}
