import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CheckoutLink } from './entities/checkout-link.entity';
import { Order } from './entities/order.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { AuthModule } from '../auth/auth.module';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutLink, Order]),
    GatewayModule,
    AuthModule,
    FeesModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
