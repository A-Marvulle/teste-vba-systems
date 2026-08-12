import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_EXPIRES_IN',
            '1h',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
