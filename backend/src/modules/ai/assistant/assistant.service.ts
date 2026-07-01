import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AssistantService {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(private readonly prisma: PrismaService) {}

  async chat(establishmentId: string, userId: string, message: string, conversationId?: string) {
    const [establishment, services, employees] = await Promise.all([
      this.prisma.establishment.findUnique({ where: { id: establishmentId } }),
      this.prisma.service.findMany({ where: { establishmentId, active: true } }),
      this.prisma.employee.findMany({ where: { establishmentId, active: true } }),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [total, thisMonth] = await Promise.all([
      this.prisma.appointment.count({ where: { establishmentId } }),
      this.prisma.appointment.count({ where: { establishmentId, startTime: { gte: startOfMonth } } }),
    ]);

    let conversation = conversationId
      ? await this.prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null;

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userId, establishmentId, context: 'ASSISTANT' },
        include: { messages: true },
      });
    }

    const systemPrompt = `Você é um assistente de gestão inteligente para o estabelecimento "${establishment?.name}".

Dados atuais do estabelecimento:
- Serviços: ${JSON.stringify(services.map(s => ({ id: s.id, nome: s.name, preco: `R$${s.price}`, duracao: `${s.durationMinutes}min` })))}
- Funcionários ativos: ${JSON.stringify(employees.map(e => ({ id: e.id, nome: e.name })))}
- Total de agendamentos histórico: ${total}
- Agendamentos este mês: ${thisMonth}

Responda perguntas sobre o negócio de forma clara, profissional e objetiva. Ofereça insights e recomendações quando pertinente. Hoje é ${now.toLocaleDateString('pt-BR')}.`;

    const history: Anthropic.MessageParam[] = (conversation.messages ?? []).map(m => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
    }));
    history.push({ role: 'user', content: message });

    await this.prisma.conversationMessage.create({
      data: { conversationId: conversation.id, role: 'USER', content: message },
    });

    const response = await this.client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: history,
    }).finalMessage();

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    await this.prisma.conversationMessage.create({
      data: { conversationId: conversation.id, role: 'ASSISTANT', content: reply },
    });

    return { conversationId: conversation.id, reply };
  }
}
