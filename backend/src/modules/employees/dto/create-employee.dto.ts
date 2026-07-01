import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '@prisma/client';

export class ScheduleSlotDto {
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  endTime: string;
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Carlos Silva' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'carlos@barbearia.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '11988888888' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [ScheduleSlotDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  schedules?: ScheduleSlotDto[];
}
