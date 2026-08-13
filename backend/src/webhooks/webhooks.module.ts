import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookEvent } from './entities/webhook-event.entity';
import { CheckoutLink } from '../payments/entities/checkout-link.entity';
import { Order } from '../payments/entities/order.entity';
import { Withdrawal } from '../withdrawals/entities/withdrawal.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEvent, CheckoutLink, Order, Withdrawal]),
    GatewayModule,
    AuthModule,
  ],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
