import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoExperimentsModule } from './mongo-experiments/mongo-experiments.module';
import { PgExperimentsModule } from './pg-experiments/pg-experiments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './pg-experiments/pet.entity';
import { GraphqlExperimentsModule } from './graphql-experiments/graphql-experiments.module';
import { PostEntity } from './graphql-experiments/forum/entities/post';
import { UserEntity } from './graphql-experiments/forum/entities/user';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import * as Joi from 'joi';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    // MongooseModule.forRoot(
    //   'mongodb://mongo1:30001,mongo2:30002,mongo3:30003/experiments?replicaSet=my-replica-set',
    // ),
    // MongoExperimentsModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'experiments',
      entities: [PetEntity, PostEntity, UserEntity],
      synchronize: true,
      logging: true,
    }),
    PgExperimentsModule,
    GraphqlExperimentsModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      }),
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        GRAPHQL_PLAYGROUND: Joi.number(),
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
