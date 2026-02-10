import { createId } from '@paralleldrive/cuid2';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { Session } from './session.entity';
import { SeatStatus } from '../enums/seat.enum';
import { Reservation } from './reservation.entity';

@Entity()
export class Seat {
  @PrimaryColumn()
  id: string = createId();

  @Column()
  placement: string;

  @Column({ enum: SeatStatus, default: SeatStatus.AVAILABLE })
  status: string;

  @OneToMany((type) => Session, (session) => session.seats, { cascade: true })
  session: Session;

  @OneToMany(() => Reservation, (reservation) => reservation.seat, {
    nullable: true,
  })
  reservations: Reservation[];
}
