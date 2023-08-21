import {
  BadRequestException,
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PetEntity } from './pet.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePetRequestDto } from './dto/create-pet.request.dto';
import { wait } from '../utils';

const MAX_PETS_PER_OWNER = 2;

@Controller('pg-experiments')
export class PgExperimentsController {
  constructor(
    @InjectRepository(PetEntity) private petRepository: Repository<PetEntity>,
    private dataSource: DataSource,
  ) {}

  @Post('pets')
  async createPet(
    @Body() dto: CreatePetRequestDto,
    @Query('waitms', new ParseIntPipe()) waitms: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repo = queryRunner.manager.getRepository(PetEntity);
      await repo
        .createQueryBuilder()
        .setLock('pessimistic_write')
        .where({ ownerId: dto.ownerId })
        .getOne();
      const ownerPetsCount = await repo.count({
        where: { ownerId: dto.ownerId },
      });

      console.log(ownerPetsCount);

      if (ownerPetsCount === MAX_PETS_PER_OWNER) {
        throw new BadRequestException('Too many pets for given owner');
      }

      await wait(waitms);

      const newPet = new PetEntity();
      newPet.ownerId = dto.ownerId;
      newPet.name = dto.name;

      await repo.save(newPet);

      await queryRunner.commitTransaction();

      return newPet;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.log(e);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  @Post('pets_v2')
  async createPetV2(
    @Body() dto: CreatePetRequestDto,
    @Query('waitms', new ParseIntPipe()) waitms: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const repo = queryRunner.manager.getRepository(PetEntity);
      const ownerPetsCount = await repo.count({
        where: { ownerId: dto.ownerId },
      });

      console.log(ownerPetsCount);

      if (ownerPetsCount === MAX_PETS_PER_OWNER) {
        throw new BadRequestException('Too many pets for given owner');
      }

      await wait(waitms);

      const newPet = new PetEntity();
      newPet.ownerId = dto.ownerId;
      newPet.name = dto.name;

      await repo.save(newPet);

      await queryRunner.commitTransaction();

      return newPet;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.log(e);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
