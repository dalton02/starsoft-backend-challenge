import { createId } from '@paralleldrive/cuid2';
import { User } from 'src/core/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Seat } from './seat.entity';

@Entity()
export class Reservation {
  @PrimaryColumn()
  id: string = createId();

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne(() => Seat, (seat) => seat.reservations, { onDelete: 'CASCADE' })
  seat: Relation<Seat>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
