export enum RabbitQueue {
  RESERVATION_CREATED = 'RESERVATION.CREATED',
  RESERVATION_DELAY = 'RESERVATION.DELAY', //Usada para o DLQ
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
