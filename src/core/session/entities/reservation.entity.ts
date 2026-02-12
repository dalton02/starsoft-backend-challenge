import { createId } from '@paralleldrive/cuid2';
import { User } from 'src/core/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Seat } from './seat.entity';
import { ReservationStatus } from '../enums/reservation.enum';
import { Sale } from './sale.entity';

@Entity()
export class Reservation {
  @PrimaryColumn()
  id: string = createId();

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne(() => Seat, (seat) => seat.reservations, { onDelete: 'CASCADE' })
  seat: Relation<Seat>;

  @OneToOne(() => Sale, (sale) => sale.reservation)
  sale?: Relation<Sale>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;
}
