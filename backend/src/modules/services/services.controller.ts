import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('services')
@Controller('establishments/:establishmentId/services')
export class ServicesController {
  constructor(private service: ServicesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Criar serviço no estabelecimento' })
  create(@Param('establishmentId') estId: string, @Body() dto: CreateServiceDto) {
    return this.service.create(estId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar serviços do estabelecimento' })
  findAll(@Param('establishmentId') estId: string) {
    return this.service.findByEstablishment(estId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um serviço' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar serviço' })
  update(@Param('id') id: string, @Body() dto: CreateServiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Desativar serviço' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
