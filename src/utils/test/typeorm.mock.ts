const entityManagerMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  getRepository: jest.fn().mockReturnValue({
    createQueryBuilder: jest.fn().mockReturnValue({
      setLock: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    }),
  }),
};

export const jestTypeORM = {
  transaction: jest.fn(async (callback) => {
    return callback(entityManagerMock);
  }),
};
