import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('employees')
@Controller('establishments/:establishmentId/employees')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cadastrar funcionário' })
  create(@Param('establishmentId') estId: string, @Body() dto: CreateEmployeeDto) {
    return this.service.create(estId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar funcionários do estabelecimento' })
  findAll(@Param('establishmentId') estId: string) {
    return this.service.findByEstablishment(estId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um funcionário' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar funcionário' })
  update(@Param('id') id: string, @Body() dto: CreateEmployeeDto) {
    return this.service.update(id, dto);
  }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Horários disponíveis de um funcionário para um serviço e data' })
  @ApiQuery({ name: 'serviceId', required: true })
  @ApiQuery({ name: 'date', required: true, example: '2026-06-25' })
  getSlots(
    @Param('id') id: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.service.getAvailableSlots(id, serviceId, date);
  }
}
