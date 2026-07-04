import { Body, Controller, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  me(@CurrentUser() user: any) {
    const { passwordHash: _, resetPasswordToken: __, resetPasswordExpires: ___, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar meu perfil' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Atualizar minha foto de perfil' })
  updateAvatar(@CurrentUser() user: any, @Body() dto: UpdateAvatarDto) {
    return this.usersService.updateAvatar(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Excluir minha própria conta' })
  removeSelf(@CurrentUser() user: any) {
    return this.usersService.remove(user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lista todos os usuários (apenas ADMIN)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Busca usuário por ID (apenas ADMIN)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove usuário (apenas ADMIN)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
