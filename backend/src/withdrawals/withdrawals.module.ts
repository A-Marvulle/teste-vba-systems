import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { Withdrawal } from './entities/withdrawal.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Withdrawal]), GatewayModule, AuthModule],
  providers: [WithdrawalsService],
  controllers: [WithdrawalsController],
})
export class WithdrawalsModule {}
