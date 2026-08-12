import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { GatewayAccount } from './entities/gateway-account.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GatewayAccount]),
    UsersModule,
    AuthModule,
  ],
  providers: [GatewayService],
  controllers: [GatewayController],
  exports: [GatewayService],
})
export class GatewayModule {}
