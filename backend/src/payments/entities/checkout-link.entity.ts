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
import { CheckoutMethod, CheckoutStatus } from '../enums/checkout-status.enum';

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
    enum: CheckoutStatus,
    default: CheckoutStatus.PENDING,
  })
  status: CheckoutStatus;

  @OneToOne(() => Order, (order) => order.checkoutLink)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
