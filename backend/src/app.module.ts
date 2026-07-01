import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EstablishmentsModule } from './modules/establishments/establishments.module';
import { ServicesModule } from './modules/services/services.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EstablishmentsModule,
    ServicesModule,
    EmployeesModule,
    AppointmentsModule,
    AiModule,
  ],
})
export class AppModule {}
