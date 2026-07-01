import { Module } from '@nestjs/common';
import { AssistantController } from './assistant/assistant.controller';
import { AssistantService } from './assistant/assistant.service';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { InsightsController } from './insights/insights.controller';
import { InsightsService } from './insights/insights.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [AppointmentsModule, EmployeesModule],
  controllers: [AssistantController, ChatController, InsightsController],
  providers: [AssistantService, ChatService, InsightsService],
})
export class AiModule {}
