import { SessionModel } from '../../dto/session.model';

export namespace MemorySessionModel {
  export type SessionType = SessionModel.Session;

  export type SessionKey = {
    sessionId: string;
  };

  export type SeatType = SessionModel.Seat;

  export type SeatKey = { sessionId: string; seatId: string };
}
