import { Module } from '@nestjs/common';
import { PgExperimentsController } from './pg-experiments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity])],
  controllers: [PgExperimentsController],
})
export class PgExperimentsModule {}
