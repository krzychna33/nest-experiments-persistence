import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async getUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  getUsersByIds(ids: number[]): Promise<UserEntity[]> {
    return this.userRepository.find({ where: { id: In(ids) } });
  }
}
