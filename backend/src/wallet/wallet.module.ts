import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [GatewayModule, AuthModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
