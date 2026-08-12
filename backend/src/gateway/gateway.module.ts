import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { GatewayAccount } from './entities/gateway-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GatewayAccount])],
  providers: [GatewayService],
  controllers: [GatewayController],
})
export class GatewayModule {}
