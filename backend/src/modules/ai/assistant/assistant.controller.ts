import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AssistantService } from './assistant.service';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('ai/assistant')
export class AssistantController {
  constructor(private readonly service: AssistantService) {}

  @Post(':establishmentId')
  @ApiOperation({ summary: 'Chat com o assistente do estabelecimento (gestor)' })
  chat(
    @Param('establishmentId') establishmentId: string,
    @CurrentUser() user: any,
    @Body() dto: ChatMessageDto,
  ) {
    return this.service.chat(establishmentId, user.id, dto.message, dto.conversationId);
  }
}
