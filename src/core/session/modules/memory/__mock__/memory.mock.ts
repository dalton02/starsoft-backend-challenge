import { SessionModel } from 'src/core/session/dto/session.model';
import { SeatStatus } from 'src/core/session/enums/seat.enum';

export const mockSeatA: SessionModel.Seat = {
  id: 'test-id-seat-A',
  placement: 'SEAT',
  status: SeatStatus.AVAILABLE,
};

export const mockSeatB: SessionModel.Seat = {
  id: 'test-id-seat-B',
  placement: 'SEAT',
  status: SeatStatus.AVAILABLE,
};
export const mockSession: SessionModel.Session = {
  id: 'test-id',
  duration: 1,
  movie: '',
  price: 123,
  room: '',
  seats: [mockSeatA, mockSeatB],
  showtime: new Date(),
};
