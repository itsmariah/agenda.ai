import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private service: AppointmentsService) {}

  @Post(':establishmentId')
  @ApiOperation({ summary: 'Criar agendamento' })
  create(
    @Param('establishmentId') estId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.service.create(estId, user.id, dto);
  }

  @Get('establishment/:establishmentId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Listar agendamentos do estabelecimento' })
  @ApiQuery({ name: 'date', required: false, example: '2026-06-25' })
  @ApiQuery({ name: 'status', required: false })
  findByEstablishment(
    @Param('establishmentId') estId: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findByEstablishment(estId, { date, status });
  }

  @Get('my')
  @ApiOperation({ summary: 'Meus agendamentos (cliente)' })
  findMine(@CurrentUser() user: any) {
    return this.service.findByClient(user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Atualizar status do agendamento' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Get('establishment/:establishmentId/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Estatísticas do estabelecimento (para IA de Insights)' })
  getStats(@Param('establishmentId') estId: string) {
    return this.service.getStats(estId);
  }
}
