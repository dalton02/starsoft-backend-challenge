import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthModel } from './auth.model';

import { createId } from '@paralleldrive/cuid2';

@Entity()
export class User {
  @PrimaryColumn()
  id: string = createId();

  @Column()
  name: string;

  @Column({ enum: AuthModel.Role })
  role: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
