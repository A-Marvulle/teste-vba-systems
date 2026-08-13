import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { encryptedColumnTransformer } from '../../common/crypto/encrypted-column.transformer';

@Entity('gateway_accounts')
export class GatewayAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  codigoCliente: string;

  @Column()
  chaveLoja: string;

  @Exclude()
  @Column({ type: 'text', transformer: encryptedColumnTransformer })
  accessToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
