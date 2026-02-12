import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ManagerSessionModel } from './manager.model';
import { Session } from '../../entities/session.entity';
import { Seat } from '../../entities/seat.entity';
import { MemorySessionService } from '../memory/memory-session.service';
import { SessionModel } from '../../dto/session.model';
import { formatSession } from 'src/utils/functions/format-session';
import { AppErrorBadRequest } from 'src/utils/errors/app-errors';

@Injectable()
export class ManagerSessionService {
  constructor(
    private readonly memory: MemorySessionService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    body: ManagerSessionModel.Request.CreateSession,
  ): Promise<SessionModel.Session> {
    const { duration, movie, placements, price, showtime, room } = body;

    const placementsWithoutDuplicates = Array.from(new Set(placements));
    if (placementsWithoutDuplicates.length < 16) {
      throw new AppErrorBadRequest(
        'Minimo de assentos na criação é 16 (evite inserir assentos duplicados)',
      );
    }

    const data = await this.dataSource.transaction(async (entityManager) => {
      const session = entityManager.create(Session, {
        duration,
        room,
        movie,
        price,
        showtime,
      });

      const seats = placementsWithoutDuplicates.map((placement) => {
        return entityManager.create(Seat, {
          placement,
          session: { id: session.id },
          reservations: [],
          currentReservation: null,
        });
      });
      await entityManager.save([session, ...seats]);

      return {
        ...session,
        seats,
      };
    });

    const formattedSession = formatSession(data);
    await this.memory.CACHE_SESSION.set(
      { sessionId: formattedSession.id },
      formattedSession,
    );

    return formattedSession;
  }
}
