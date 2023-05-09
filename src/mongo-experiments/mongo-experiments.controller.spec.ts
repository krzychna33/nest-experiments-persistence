import { Test, TestingModule } from '@nestjs/testing';
import { MongoExperimentsController } from './mongo-experiments.controller';

describe('MongoExperimentsController', () => {
  let controller: MongoExperimentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MongoExperimentsController],
    }).compile();

    controller = module.get<MongoExperimentsController>(MongoExperimentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
