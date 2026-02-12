import { ManagerSessionModel } from '../manager.model';

export namespace ManagerServiceMock {
  export const incorrectBodySession: ManagerSessionModel.Request.CreateSession =
    {
      duration: 100,
      movie: 'Homem aranha',
      placements: ['AB2', 'AB3'],
      price: 200,
      room: 'SALA 20',
      showtime: new Date(),
    };

  export const correctBodySession: ManagerSessionModel.Request.CreateSession = {
    duration: 100,
    movie: 'Homem aranha',
    placements: Array.from({ length: 16 })
      .fill(undefined)
      .map((_, i) => `ASSENTO-${i}`),
    price: 200,
    room: 'SALA 20',
    showtime: new Date(),
  };
}
