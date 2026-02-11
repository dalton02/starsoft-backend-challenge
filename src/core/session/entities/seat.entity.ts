import { createId } from '@paralleldrive/cuid2';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Session } from './session.entity';
import { SeatStatus } from '../enums/seat.enum';
import { Reservation } from './reservation.entity';

@Entity()
export class Seat {
  @PrimaryColumn()
  id: string = createId();

  @Column({ nullable: false })
  placement: string;

  @Column({ type: 'enum', enum: SeatStatus, default: SeatStatus.AVAILABLE })
  status: SeatStatus;

  @ManyToOne((type) => Session, (session) => session.seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Relation<Session>;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'current_reservation_id' })
  currentReservation: Relation<Reservation>;

  @OneToMany(() => Reservation, (reservation) => reservation.seat)
  reservations: Relation<Reservation[]>;
}
