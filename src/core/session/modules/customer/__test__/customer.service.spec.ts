import {
  AppErrorBadRequest,
  AppErrorNotFound,
} from 'src/utils/errors/app-errors';
import { CustomerSessionService } from '../customer.service';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RabbitProvider } from 'src/core/persistence/messager/rabbit.provider';
import { MemorySessionService } from '../../memory/memory-session.service';
import { SeatStatus } from 'src/core/session/enums/seat.enum';
import { PaymentStatus } from 'src/core/session/enums/payment.enum';
import { CustomerServiceUnitMocks } from '../__mocks__/functions.mocks';

describe('Unit Test Customer Service', () => {
  let service: CustomerSessionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomerSessionService,
        { provide: DataSource, useValue: CustomerServiceUnitMocks.DataSource },
        { provide: RabbitProvider, useValue: CustomerServiceUnitMocks.Rabbit },
        {
          provide: MemorySessionService,
          useValue: CustomerServiceUnitMocks.Memory,
        },
      ],
    }).compile();

    service = module.get(CustomerSessionService);

    jest.clearAllMocks();
  });

  it('should throw error if seat is not found', async () => {
    CustomerServiceUnitMocks.EntityManager.findOne.mockResolvedValue(null);

    await expect(
      service.bookSeat({ seatId: '1', userId: '1' }),
    ).rejects.toBeInstanceOf(AppErrorNotFound);
  });

  it('should throw error if the seat is not available', async () => {
    CustomerServiceUnitMocks.EntityManager.findOne.mockResolvedValue({
      id: '1',
      status: SeatStatus.HOLDING,
    });

    await expect(
      service.bookSeat({ seatId: '1', userId: '1' }),
    ).rejects.toBeInstanceOf(AppErrorBadRequest);
  });

  it('should create reservation and publish event', async () => {
    const seat = {
      id: '1',
      status: SeatStatus.AVAILABLE,
      session: { id: 'session-1' },
    };

    const reservation = { id: 'res-1', expiresAt: new Date() };

    CustomerServiceUnitMocks.EntityManager.findOne.mockResolvedValue(seat);
    CustomerServiceUnitMocks.EntityManager.create.mockReturnValue(reservation);

    const result = await service.bookSeat({
      seatId: '1',
      userId: 'u1',
    });

    expect(seat.status).toBe(SeatStatus.HOLDING);
    expect(CustomerServiceUnitMocks.EntityManager.save).toHaveBeenCalled();
    expect(CustomerServiceUnitMocks.Rabbit.publish).toHaveBeenCalled();
    expect(result.bookId).toBe(reservation.id);
  });

  it('should throw if reservation not found', async () => {
    CustomerServiceUnitMocks.EntityManager.getRepository.mockReturnValue({
      findOne: jest.fn().mockReturnValue(null),
    });

    await expect(
      service.makePayment({ reservationId: 'r1' }),
    ).rejects.toBeInstanceOf(AppErrorNotFound);
  });

  it('should throw if reservation not pending', async () => {
    const seat = {
      id: '1',
      status: SeatStatus.HOLDING,
      session: { id: 's1' },
      currentReservation: {
        id: 'r1',
        status: PaymentStatus.CANCELLED,
      },
    };

    CustomerServiceUnitMocks.EntityManager.getRepository.mockReturnValue({
      findOne: jest.fn().mockReturnValue(seat),
    });

    await expect(
      service.makePayment({ reservationId: 'r1' }),
    ).rejects.toBeInstanceOf(AppErrorBadRequest);
  });

  it('should approve payment and publish event', async () => {
    const seat = {
      id: '1',
      status: SeatStatus.HOLDING,
      session: { id: 's1' },
      currentReservation: {
        id: 'r1',
        status: PaymentStatus.PENDING,
      },
    };

    CustomerServiceUnitMocks.EntityManager.getRepository.mockReturnValue({
      findOne: jest.fn().mockReturnValue(seat),
    });

    await service.makePayment({
      reservationId: 'r1',
    });

    expect(seat.status).toBe(SeatStatus.RESERVED);
    expect(seat.currentReservation.status).toBe(PaymentStatus.APPROVED);
    expect(CustomerServiceUnitMocks.Rabbit.publish).toHaveBeenCalled();
  });
});
