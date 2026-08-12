import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('webhook_events')
@Index(['event', 'externalReference'], { unique: true })
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  event: string;

  @Column({ type: 'varchar', nullable: true })
  externalReference: string | null;

  @Column({ default: true })
  signatureValid: boolean;

  @Column({ default: false })
  processed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'json' })
  payload: unknown;

  @CreateDateColumn()
  createdAt: Date;
}
