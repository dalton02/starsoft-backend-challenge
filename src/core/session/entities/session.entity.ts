import { createId } from '@paralleldrive/cuid2';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
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

  @Column({ type: 'timestamp' })
  showtime: Date;

  @Column()
  duration: number;

  @OneToMany((type) => Seat, (seat) => seat.session)
  seats: Relation<Seat[]>;
}
