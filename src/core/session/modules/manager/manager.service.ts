import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ManagerSessionModel } from './manager.model';
import { Session } from '../../entities/session.entity';
import { Seat } from '../../entities/seat.entity';

@Injectable()
export class ManagerSessionService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    body: ManagerSessionModel.CreateSession,
  ): Promise<ManagerSessionModel.ResponseSession> {
    const { duration, movie, placements, price, showtime, room } = body;

    return await this.dataSource.transaction(async (entityManager) => {
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
        placements,
      };
    });
  }
}
