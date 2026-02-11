import { Session } from 'src/core/session/entities/session.entity';

export function formatSession(session: Session) {
  const { duration, id, movie, price, room, seats, showtime } = session;
  const formattedSession = {
    duration,
    id,
    movie,
    price,
    room,
    seats: seats.map((seat) => {
      return {
        id: seat.id,
        currentReservationId: seat.currentReservation?.id ?? null,
        placement: seat.placement,
        status: seat.status,
      };
    }),
    showtime,
  };
  return formattedSession;
}
