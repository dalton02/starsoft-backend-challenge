import { createId } from '@paralleldrive/cuid2';
import { User } from 'src/core/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Seat } from './seat.entity';

@Entity()
export class Reservation {
  @PrimaryColumn()
  id: string = createId();

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => Seat, (seat) => seat.reservations)
  seat: Seat;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
