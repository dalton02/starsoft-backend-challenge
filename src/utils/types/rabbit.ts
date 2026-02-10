export enum RabbitQueue {
  RESERVATION_CREATED = 'RESERVATION.CREATED',
  RESERVATION_DELAY = 'RESERVATION.DELAY',
  RESERVATION_EXPIRED = 'RESERVATION.EXPIRED',
  RESERVATION_CONFIRMED = 'RESERVATION.CONFIRMED',
}

export type EventReservation = {
  reservationId: string;
  seatId: string;
  sessionId: string;
};

export type RabbitEvent = EventReservation | {};
