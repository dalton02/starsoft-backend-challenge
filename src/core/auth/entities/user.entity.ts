import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthModel } from '../auth.model';

import { createId } from '@paralleldrive/cuid2';
import { UserRole } from '../enum/role.enum';
import { Reservation } from 'src/core/ticket/entities/reservation.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: string = createId();

  @Column()
  name: string;

  @Column({ enum: UserRole })
  role: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Reservation, (reservation) => reservation.user, {})
  reservations: Reservation[];
}
