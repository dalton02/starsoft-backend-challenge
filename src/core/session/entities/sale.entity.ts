import { createId } from '@paralleldrive/cuid2';
import { User } from 'src/core/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class Sale {
  @PrimaryColumn()
  id: string = createId();

  @OneToOne(() => Reservation, (reservation) => reservation.sale, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Relation<Reservation>;

  @CreateDateColumn()
  payedAt: Date;

  @Column()
  amount: number;
}
