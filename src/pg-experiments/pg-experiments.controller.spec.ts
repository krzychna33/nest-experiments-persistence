import { Test, TestingModule } from '@nestjs/testing';
import { PgExperimentsController } from './pg-experiments.controller';

describe('PgExperimentsController', () => {
  let controller: PgExperimentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PgExperimentsController],
    }).compile();

    controller = module.get<PgExperimentsController>(PgExperimentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
