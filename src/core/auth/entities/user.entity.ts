import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { AuthModel } from '../auth.model';

import { createId } from '@paralleldrive/cuid2';
import { UserRole } from '../enum/role.enum';
import { Reservation } from 'src/core/session/entities/reservation.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: string = createId();

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Reservation, (reservation) => reservation.user, {})
  reservations: Relation<Reservation[]>;
}
