import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CheckoutLink } from './checkout-link.entity';
import { GatewayStatus } from '../../common/enums/gateway-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => CheckoutLink, (checkoutLink) => checkoutLink.order, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  checkoutLink: CheckoutLink;

  @Column({ type: 'varchar', nullable: true })
  gatewayPaymentId: string | null;

  @Column({ type: 'text', nullable: true })
  qrCodeBase64: string | null;

  @Column({ type: 'text', nullable: true })
  emv: string | null;

  @Column({ type: 'enum', enum: GatewayStatus })
  status: GatewayStatus;

  @Column({ type: 'json' })
  rawResponse: unknown;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
