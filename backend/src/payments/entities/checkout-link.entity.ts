import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';
import { CheckoutMethod } from '../enums/checkout-method.enum';
import { GatewayStatus } from '../../common/enums/gateway-status.enum';

@Entity('checkout_links')
export class CheckoutLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'enum', enum: CheckoutMethod })
  method: CheckoutMethod;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int', nullable: true })
  installments: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  feePercent: string | null;

  @Column({ unique: true })
  externalReference: string;

  @Column({
    type: 'enum',
    enum: GatewayStatus,
    default: GatewayStatus.PENDING,
  })
  status: GatewayStatus;

  @OneToOne(() => Order, (order) => order.checkoutLink)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
