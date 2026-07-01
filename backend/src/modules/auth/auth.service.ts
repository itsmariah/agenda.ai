import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = this.signToken(user.id, user.email, user.role);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.signToken(user.id, user.email, user.role);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  private signToken(sub: string, email: string, role: string) {
    return this.jwt.sign({ sub, email, role });
  }
}
