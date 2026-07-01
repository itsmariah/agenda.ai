import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte Masculino' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Corte tradicional com tesoura e máquina' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  durationMinutes: number;

  @ApiProperty({ example: 45.0 })
  @IsNumber()
  @Min(0)
  price: number;
}
