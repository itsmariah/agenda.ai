import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(establishmentId: string, dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: { ...dto, establishmentId },
    });
  }

  async findByEstablishment(establishmentId: string) {
    return this.prisma.service.findMany({
      where: { establishmentId, active: true },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Serviço não encontrado');
    return service;
  }

  async update(id: string, dto: Partial<CreateServiceDto>) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: { active: false } });
  }
}
