import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppointmentsService } from '../../appointments/appointments.service';

const INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      description: 'Lista de insights gerados com base nos dados',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['success', 'warning', 'info', 'opportunity'],
            description: 'Tipo visual do card',
          },
          title: { type: 'string', description: 'Título curto e impactante do insight' },
          description: {
            type: 'string',
            description: 'Descrição clara com contexto e recomendação de ação',
          },
          metric: {
            type: 'string',
            description: 'Métrica principal em destaque (ex: "+23%", "R$4.200", "8 cancelamentos")',
          },
        },
        required: ['type', 'title', 'description', 'metric'],
        additionalProperties: false,
      },
      minItems: 3,
      maxItems: 5,
    },
  },
  required: ['insights'],
  additionalProperties: false,
};

export interface InsightCard {
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  metric: string;
}

@Injectable()
export class InsightsService {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async generate(establishmentId: string): Promise<{ insights: InsightCard[] }> {
    const [establishment, services, employees, stats] = await Promise.all([
      this.prisma.establishment.findUnique({ where: { id: establishmentId } }),
      this.prisma.service.findMany({
        where: { establishmentId, active: true },
        select: { id: true, name: true, price: true },
      }),
      this.prisma.employee.findMany({
        where: { establishmentId, active: true },
        select: { id: true, name: true },
      }),
      this.appointmentsService.getStats(establishmentId),
    ]);

    const serviceMap = Object.fromEntries(services.map(s => [s.id, s.name]));
    const employeeMap = Object.fromEntries(employees.map(e => [e.id, e.name]));

    const enrichedStats = {
      ...stats,
      byService: stats.byService.map(s => ({
        serviceName: serviceMap[s.serviceId] ?? s.serviceId,
        count: s._count,
      })),
      byEmployee: stats.byEmployee.map(e => ({
        employeeName: employeeMap[e.employeeId] ?? e.employeeId,
        count: e._count,
      })),
    };

    const systemPrompt = `Você é um analista de dados especializado em negócios de serviços.
Responda APENAS com JSON válido seguindo exatamente este esquema (sem markdown, sem texto adicional):
${JSON.stringify(INSIGHTS_SCHEMA, null, 2)}`;

    const prompt = `Analise os dados do estabelecimento "${establishment?.name}" e gere entre 3 e 5 insights acionáveis para o gestor.

Dados de agendamentos:
${JSON.stringify(enrichedStats, null, 2)}

Serviços: ${JSON.stringify(services.map(s => ({ nome: s.name, preco: `R$${s.price}` })))}
Funcionários ativos: ${employees.length}

Gere insights variados (sucessos, alertas, oportunidades, informações) com métricas claras e recomendações específicas.`;

    const response = await this.client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }).finalMessage();

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    if (!textBlock?.text) throw new Error('Resposta inesperada da IA');

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta da IA');

    return JSON.parse(jsonMatch[0]) as { insights: InsightCard[] };
  }
}
