import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post(':establishmentId')
  @ApiOperation({ summary: 'Chat de agendamento para o cliente' })
  chat(
    @Param('establishmentId') establishmentId: string,
    @CurrentUser() user: any,
    @Body() dto: ChatMessageDto,
  ) {
    return this.service.chat(establishmentId, user.id, dto.message, dto.conversationId);
  }
}
