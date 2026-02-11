export namespace CustomerServiceUnitMocks {
  export const Rabbit = {
    publish: jest.fn(),
    channel: {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
    },
    consume: jest.fn().mockResolvedValue(undefined),
  };

  export const Memory = {
    hydrateSession: jest.fn(),
  };

  export const EntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    getRepository: jest.fn(),
  };

  export const DataSource = {
    transaction: jest.fn((cb) => cb(EntityManager)),
    getRepository: jest.fn(),
  };
}
