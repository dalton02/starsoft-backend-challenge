export enum RabbitQueue {
  RESERVATION_CREATED = 'RESERVATION.CREATED',
  RESERVATION_DELAY = 'RESERVATION.DELAY',
  RESERVATION_EXPIRED = 'RESERVATION.EXPIRED',
}

export type EventReservationCreated = {
  reservationId: string;
  seatId: string;
};

export type RabbitEvent = EventReservationCreated | {};
