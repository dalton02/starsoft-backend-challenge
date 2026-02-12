export const RabbitQueue = {
  RESERVATION_CREATED: 'RESERVATION.CREATED',
  RESERVATION_DELAY: 'RESERVATION.DELAY', // Usada para o DLQ
  RESERVATION_EXPIRED: 'RESERVATION.EXPIRED',
  PAYMENT_CONFIRMED: 'PAYMENT.CONFIRMED',
  SEAT_RELEASE: 'SEAT.RELEASE',
  DLQ_ERROR: 'DLQ.ERROR',
} as const;

export const RabbitExchange = {
  RESERVATION_EVENTS: 'RESERVATION.EVENTS',
  DLQ_ERRORS: 'DLQ.ERRORS',
} as const;

export type RabbitQueueType = (typeof RabbitQueue)[keyof typeof RabbitQueue];
export type RabbitExchangeType =
  (typeof RabbitExchange)[keyof typeof RabbitExchange];

export type EventReservation = {
  reservationId: string;
  seatId: string;
  sessionId: string;
};

export type RabbitEvent = EventReservation | {};
