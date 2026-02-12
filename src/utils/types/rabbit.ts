export enum RabbitQueue {
  RESERVATION_CREATED = 'RESERVATION.CREATED',
  RESERVATION_DELAY = 'RESERVATION.DELAY',
  RESERVATION_EXPIRED = 'RESERVATION.EXPIRED',
  PAYMENT_CONFIRMED = 'PAYMENT.CONFIRMED',
  SEAT_RELEASE = 'SEAT.RELEASE',
}

export type EventReservation = {
  reservationId: string;
  seatId: string;
  sessionId: string;
};

export type RabbitEvent = EventReservation | {};
