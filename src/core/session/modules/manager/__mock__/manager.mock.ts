import { ManagerSessionModel } from '../manager.model';

export namespace ManagerServiceMock {
  export const bodySession: ManagerSessionModel.Request.CreateSession = {
    duration: 100,
    movie: 'Homem aranha',
    placements: ['AB2', 'AB3'],
    price: 200,
    room: 'SALA 20',
    showtime: new Date(),
  };
}
