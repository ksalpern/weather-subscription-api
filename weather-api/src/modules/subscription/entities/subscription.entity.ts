import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  city: string;

  @Column({
    type: 'enum',
    enum: SubscriptionFrequency,
    default: SubscriptionFrequency.DAILY,
  })
  frequency: SubscriptionFrequency;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ type: 'varchar', nullable: true })
  confirmationToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  unsubscribeToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
