import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';

@Injectable()
export class EstablishmentsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateEstablishmentDto) {
    return this.prisma.establishment.create({
      data: { ...dto, ownerId },
    });
  }

  async findAll() {
    return this.prisma.establishment.findMany({
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: string) {
    const est = await this.prisma.establishment.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        services: { where: { active: true } },
        employees: { where: { active: true } },
      },
    });
    if (!est) throw new NotFoundException('Estabelecimento não encontrado');
    return est;
  }

  async update(id: string, ownerId: string, dto: Partial<CreateEstablishmentDto>) {
    const est = await this.findOne(id);
    if (est.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.establishment.update({ where: { id }, data: dto });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.establishment.findUnique({ where: { ownerId } });
  }

  async remove(id: string, ownerId: string) {
    const est = await this.findOne(id);
    if (est.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.establishment.delete({ where: { id } });
  }
}
