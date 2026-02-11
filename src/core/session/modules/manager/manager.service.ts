import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ManagerSessionModel } from './manager.model';
import { Session } from '../../entities/session.entity';
import { Seat } from '../../entities/seat.entity';
import { MemorySessionService } from '../memory/memory-session.service';
import { SessionModel } from '../../dto/session.model';

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

    const data = await this.dataSource.transaction(async (entityManager) => {
      const session = entityManager.create(Session, {
        duration,
        room,
        movie,
        price,
        showtime,
      });

      const seats = placements.map((placement) => {
        return entityManager.create(Seat, {
          placement,
          session: { id: session.id },
          reservations: [],
        });
      });
      await entityManager.save([session, ...seats]);

      return {
        ...session,
        seats,
      };
    });
    await this.memory.hydrateSession(data);

    return data;
  }
}
