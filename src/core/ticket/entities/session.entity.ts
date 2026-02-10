import { createId } from '@paralleldrive/cuid2';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Seat } from './seat.entity';

@Entity()
export class Session {
  @PrimaryColumn()
  id: string = createId();

  @Column()
  movie: string;

  @Column()
  room: string;

  @Column()
  price: number;

  @Column({ type: Date })
  showtime: Date;

  @Column()
  duration: number;

  @ManyToOne((type) => Seat, (seat) => seat.session)
  seats: Seat[];
}
