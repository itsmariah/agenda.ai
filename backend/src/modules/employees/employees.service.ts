import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(establishmentId: string, dto: CreateEmployeeDto) {
    const { schedules, ...employeeData } = dto;
    return this.prisma.employee.create({
      data: {
        ...employeeData,
        establishmentId,
        schedules: schedules
          ? { create: schedules }
          : undefined,
      },
      include: { schedules: true },
    });
  }

  async findByEstablishment(establishmentId: string) {
    return this.prisma.employee.findMany({
      where: { establishmentId, active: true },
      include: { schedules: true },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { schedules: true },
    });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');
    return employee;
  }

  async update(id: string, dto: Partial<CreateEmployeeDto>) {
    await this.findOne(id);
    const { schedules, ...rest } = dto;
    return this.prisma.employee.update({
      where: { id },
      data: rest,
      include: { schedules: true },
    });
  }

  async getAvailableSlots(employeeId: string, serviceId: string, date: string) {
    const employee = await this.findOne(employeeId);
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const targetDate = new Date(date);
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = dayNames[targetDate.getDay()];

    const schedule = employee.schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!schedule) return [];

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        employeeId,
        startTime: { gte: new Date(`${date}T00:00:00`), lt: new Date(`${date}T23:59:59`) },
        status: { notIn: ['CANCELLED'] },
      },
      orderBy: { startTime: 'asc' },
    });

    const slots: string[] = [];
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let m = startMinutes; m + service.durationMinutes <= endMinutes; m += service.durationMinutes) {
      const slotStart = new Date(`${date}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`);
      const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60000);

      const conflict = existingAppointments.some(
        (a) => slotStart < a.endTime && slotEnd > a.startTime,
      );
      if (!conflict) slots.push(slotStart.toISOString());
    }

    return slots;
  }
}
