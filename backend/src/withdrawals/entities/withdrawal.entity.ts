import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GatewayStatus } from '../../common/enums/gateway-status.enum';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'int' })
  amount: number;

  @Column()
  pixKey: string;

  @Column()
  document: string;

  @Column({ unique: true })
  externalReference: string;

  @Column({ type: 'varchar', nullable: true })
  gatewayWithdrawalId: string | null;

  @Column({ type: 'enum', enum: GatewayStatus, default: GatewayStatus.PENDING })
  status: GatewayStatus;

  @Column({ type: 'json' })
  rawResponse: unknown;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
