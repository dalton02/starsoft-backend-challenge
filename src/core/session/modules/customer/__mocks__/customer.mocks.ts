import { User } from 'src/core/auth/entities/user.entity';
import { UserRole } from 'src/core/auth/enum/role.enum';
import { Sale } from 'src/core/session/entities/sale.entity';
import { Seat } from 'src/core/session/entities/seat.entity';
import { Session } from 'src/core/session/entities/session.entity';
import { SeatStatus } from 'src/core/session/enums/seat.enum';

export namespace MockCustomer {
  export const seat = {
    id: 'test-seat-1',
    placement: 'A20',
    status: SeatStatus.AVAILABLE,
  } as Seat;

  export const session: Session = {
    id: 'test-session-1',
    duration: 123,
    movie: 'HOmem aranha',
    price: 200,
    room: '',
    seats: [seat],
    showtime: new Date(),
  };

  export const sale = {
    id: 'sale-123',
    amount: 123,
  };

  export const userOne: User = {
    id: 'test-user-1',
    email: 'test-email-1@email.com',
    name: 'Nome',
    password: 'sadasds',
    reservations: [],
    role: UserRole.CUSTOMER,
  };

  export const userTwo: User = {
    id: 'test-user-2',
    email: 'test0email02@email.com',
    name: 'Nome',
    password: 'sadasds',
    reservations: [],
    role: UserRole.CUSTOMER,
  };
}
