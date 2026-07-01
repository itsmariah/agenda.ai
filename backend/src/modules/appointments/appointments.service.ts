import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(establishmentId: string, clientId: string, dto: CreateAppointmentDto) {
    const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        employeeId: dto.employeeId,
        status: { notIn: ['CANCELLED'] },
        OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
      },
    });
    if (conflict) throw new BadRequestException('Horário indisponível');

    return this.prisma.appointment.create({
      data: {
        establishmentId,
        clientId,
        employeeId: dto.employeeId,
        serviceId: dto.serviceId,
        startTime,
        endTime,
        notes: dto.notes,
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: true,
      },
    });
  }

  async findByEstablishment(establishmentId: string, filters: { date?: string; status?: string }) {
    const where: any = { establishmentId };
    if (filters.status) where.status = filters.status;
    if (filters.date) {
      where.startTime = {
        gte: new Date(`${filters.date}T00:00:00`),
        lt: new Date(`${filters.date}T23:59:59`),
      };
    }
    return this.prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        employee: { select: { id: true, name: true } },
        service: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        employee: { select: { id: true, name: true } },
        service: true,
        establishment: { select: { id: true, name: true, address: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    return this.prisma.appointment.update({ where: { id }, data: { status: dto.status } });
  }

  async getStats(establishmentId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [total, thisMonth, lastMonth, byService, byEmployee, cancelledThisMonth] =
      await Promise.all([
        this.prisma.appointment.count({ where: { establishmentId } }),
        this.prisma.appointment.count({ where: { establishmentId, startTime: { gte: startOfMonth } } }),
        this.prisma.appointment.count({
          where: { establishmentId, startTime: { gte: startOfLastMonth, lte: endOfLastMonth } },
        }),
        this.prisma.appointment.groupBy({
          by: ['serviceId'],
          where: { establishmentId, status: 'COMPLETED' },
          _count: true,
          orderBy: { _count: { serviceId: 'desc' } },
          take: 5,
        }),
        this.prisma.appointment.groupBy({
          by: ['employeeId'],
          where: { establishmentId, status: 'COMPLETED' },
          _count: true,
          orderBy: { _count: { employeeId: 'desc' } },
        }),
        this.prisma.appointment.count({
          where: { establishmentId, status: 'CANCELLED', startTime: { gte: startOfMonth } },
        }),
      ]);

    return { total, thisMonth, lastMonth, byService, byEmployee, cancelledThisMonth };
  }
}
