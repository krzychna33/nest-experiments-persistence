import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { PetsSchema } from './pets.schema';
import { Connection, Model, Types } from 'mongoose';
import { wait } from '../utils';
import { CreateItemRequestDto } from './dto/create-item.request.dto';
import { ItemSchema } from './item.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePetRequestDto } from './dto/create-pet.request.dto';

const MAX_PETS_PER_OWNER = 2;

@UsePipes(new ValidationPipe())
@Controller('mongo-experiments')
export class MongoExperimentsController {
  constructor(
    @InjectModel(PetsSchema.name) private petModel: Model<PetsSchema>,
    @InjectModel(ItemSchema.name) private itemModel: Model<ItemSchema>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Post('pets')
  async createPet(
    @Body() dto: CreatePetRequestDto,
    @Query('waitms', new ParseIntPipe()) waitms: number,
  ): Promise<PetsSchema> {
    const session_ = await this.connection.startSession({
      causalConsistency: true,
    });

    let petResult;

    await session_.withTransaction(async (session) => {
      const numberOfPets = await this.petModel.countDocuments(
        { ownerId: new Types.ObjectId(dto.ownerId) },
        {
          session,
        },
      );

      console.log(`${dto.ownerId} has ${numberOfPets} pets`);

      await wait(waitms);

      if (numberOfPets >= MAX_PETS_PER_OWNER) {
        throw new BadRequestException('Too many pets');
      }

      petResult = await new this.petModel({
        name: dto.name,
        ownerId: new Types.ObjectId(dto.ownerId),
      }).save({
        session,
      });
      return petResult;
    });

    return petResult;
  }

  @Post('items')
  async createItem(@Body() dto: CreateItemRequestDto) {
    const newItem = new this.itemModel(dto).save();
    return newItem;
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateOrderDto) {
    const session = await this.connection.startSession();

    let itemUpdated;
    return session.withTransaction(async () => {
      const item = await this.itemModel.findOne(
        {
          _id: new Types.ObjectId(dto.itemId),
        },
        undefined,
        { session: session },
      );
      if (!item) {
        throw new NotFoundException();
      }

      if (item.stock === 0) {
        throw new BadRequestException('Item out of stock');
      }

      await wait(5000);

      item.stock -= 1;

      itemUpdated = await item.save({ session });

      console.log('ORDER created!');

      await session.commitTransaction();

      return itemUpdated;
    });

    return itemUpdated;
  }
}
