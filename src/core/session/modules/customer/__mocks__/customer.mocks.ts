import { User } from 'src/core/auth/entities/user.entity';
import { UserRole } from 'src/core/auth/enum/role.enum';
import { Seat } from 'src/core/session/entities/seat.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { SeatStatus } from 'src/core/session/enums/seat.enum';

export namespace MockCustomer {
  export const seat: Seat = {
    id: '123',
    placement: 'A20',
    reservations: [],
    session: null as any,
    status: SeatStatus.AVAILABLE,
  };

  export const session: Session = {
    id: '123',
    duration: 123,
    movie: 'HOmem aranha',
    price: 200,
    room: '',
    seats: [seat],
    showtime: new Date(),
  };

  export const user: User = {
    id: '123',
    email: 'email@email.com',
    name: 'Nome',
    password: 'sadasds',
    reservations: [],
    role: UserRole.CUSTOMER,
  };

  seat.session = session;
}
