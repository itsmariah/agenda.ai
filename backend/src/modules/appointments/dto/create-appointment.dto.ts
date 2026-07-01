import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'uuid-do-funcionario' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'uuid-do-servico' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: '2026-06-25T14:30:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ example: 'Quero o corte mais curto possível' })
  @IsOptional()
  @IsString()
  notes?: string;
}
