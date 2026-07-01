import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('ai/insights')
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Get(':establishmentId')
  @ApiOperation({ summary: 'Gera cards de insights de IA para o estabelecimento' })
  generate(@Param('establishmentId') establishmentId: string) {
    return this.service.generate(establishmentId);
  }
}
