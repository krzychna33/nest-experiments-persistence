import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoExperimentsModule } from './mongo-experiments/mongo-experiments.module';
import { PgExperimentsModule } from './pg-experiments/pg-experiments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './pg-experiments/pet.entity';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://mongo1:30001,mongo2:30002,mongo3:30003/experiments?replicaSet=my-replica-set',
    ),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'experiments',
      entities: [PetEntity],
      synchronize: true,
      logging: true,
    }),
    MongoExperimentsModule,
    PgExperimentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
