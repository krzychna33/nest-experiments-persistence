import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post';
import { UserEntity } from './entities/user';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { PostsLoader } from './posts.loader';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, UserEntity])],
  providers: [
    UsersResolver,
    UsersService,
    PostsResolver,
    PostsService,
    PostsLoader,
  ],
})
export class ForumModule {}
