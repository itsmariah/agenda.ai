import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
