import { Module } from '@nestjs/common';
import { MongoExperimentsController } from './mongo-experiments.controller';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { PetsSchema } from './pets.schema';
import { ItemSchema } from './item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PetsSchema.name,
        schema: SchemaFactory.createForClass(PetsSchema),
      },
      {
        name: ItemSchema.name,
        schema: SchemaFactory.createForClass(ItemSchema),
      },
    ]),
  ],
  controllers: [MongoExperimentsController],
})
export class MongoExperimentsModule {}
