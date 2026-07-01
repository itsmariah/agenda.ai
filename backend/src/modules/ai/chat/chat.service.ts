import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmployeesService } from '../../employees/employees.service';
import { AppointmentsService } from '../../appointments/appointments.service';

interface ToolContext {
  establishmentId: string;
  clientId: string;
}

const BOOKING_TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_services',
    description: 'Lista os serviços disponíveis para agendamento',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'list_employees',
    description: 'Lista os profissionais disponíveis',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_available_slots',
    description: 'Retorna os horários disponíveis para um profissional, serviço e data específicos',
    input_schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string', description: 'ID do profissional' },
        serviceId: { type: 'string', description: 'ID do serviço' },
        date: { type: 'string', description: 'Data no formato YYYY-MM-DD' },
      },
      required: ['employeeId', 'serviceId', 'date'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Realiza o agendamento após o cliente confirmar todos os detalhes',
    input_schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string', description: 'ID do profissional' },
        serviceId: { type: 'string', description: 'ID do serviço' },
        startTime: { type: 'string', description: 'Horário de início em ISO 8601' },
        notes: { type: 'string', description: 'Observações do cliente (opcional)' },
      },
      required: ['employeeId', 'serviceId', 'startTime'],
    },
  },
];

@Injectable()
export class ChatService {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(
    private readonly prisma: PrismaService,
    private readonly employeesService: EmployeesService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async chat(establishmentId: string, clientId: string, message: string, conversationId?: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    let conversation = conversationId
      ? await this.prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null;

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userId: clientId, establishmentId, context: 'CLIENT' },
        include: { messages: true },
      });
    }

    const now = new Date();
    const systemPrompt = `Você é um assistente de agendamento amigável do estabelecimento "${establishment?.name}".

Seu objetivo é ajudar o cliente a marcar um horário de forma conversacional e natural. Siga este fluxo:
1. Pergunte qual serviço o cliente deseja (use list_services para listar as opções)
2. Pergunte a data desejada
3. Liste os profissionais disponíveis (use list_employees)
4. Mostre os horários disponíveis (use get_available_slots com o profissional, serviço e data)
5. Confirme todos os detalhes com o cliente antes de agendar
6. Realize o agendamento (use book_appointment) somente após confirmação explícita

Regras:
- Seja simpático, objetivo e claro
- Sempre confirme os detalhes (serviço, profissional, data e horário) antes de efetivar o agendamento
- Hoje é ${now.toLocaleDateString('pt-BR')}
- Mostre preços e duração dos serviços ao listar`;

    const history: Anthropic.MessageParam[] = (conversation.messages ?? []).map(m => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
    }));
    history.push({ role: 'user', content: message });

    await this.prisma.conversationMessage.create({
      data: { conversationId: conversation.id, role: 'USER', content: message },
    });

    const toolCtx: ToolContext = { establishmentId, clientId };
    let currentMessages: Anthropic.MessageParam[] = [...history];

    let response = await this.client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: currentMessages,
      tools: BOOKING_TOOLS,
    }).finalMessage();

    // Agentic tool-use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (tb) => ({
          type: 'tool_result' as const,
          tool_use_id: tb.id,
          content: JSON.stringify(
            await this.executeTool(tb.name, tb.input as Record<string, string>, toolCtx),
          ),
        })),
      );

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];

      response = await this.client.messages.stream({
        model: 'claude-opus-4-8',
        max_tokens: 4096,
        thinking: { type: 'adaptive' },
        system: systemPrompt,
        messages: currentMessages,
        tools: BOOKING_TOOLS,
      }).finalMessage();
    }

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    await this.prisma.conversationMessage.create({
      data: { conversationId: conversation.id, role: 'ASSISTANT', content: reply },
    });

    return { conversationId: conversation.id, reply };
  }

  private async executeTool(
    name: string,
    input: Record<string, string>,
    ctx: ToolContext,
  ): Promise<unknown> {
    switch (name) {
      case 'list_services':
        return this.prisma.service.findMany({
          where: { establishmentId: ctx.establishmentId, active: true },
          select: { id: true, name: true, description: true, durationMinutes: true, price: true },
        });

      case 'list_employees':
        return this.prisma.employee.findMany({
          where: { establishmentId: ctx.establishmentId, active: true },
          select: { id: true, name: true },
        });

      case 'get_available_slots':
        return this.employeesService.getAvailableSlots(
          input.employeeId,
          input.serviceId,
          input.date,
        );

      case 'book_appointment':
        return this.appointmentsService.create(ctx.establishmentId, ctx.clientId, {
          employeeId: input.employeeId,
          serviceId: input.serviceId,
          startTime: input.startTime,
          notes: input.notes,
        });

      default:
        return { error: `Ferramenta desconhecida: ${name}` };
    }
  }
}
