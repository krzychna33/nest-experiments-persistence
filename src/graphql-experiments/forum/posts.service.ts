import { PostEntity } from './entities/post';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export type CreatePostArgs = {
  title: string;
  authorId: number;
};

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  getAllPosts(): Promise<PostEntity[]> {
    return this.postsRepository.find();
  }

  async createPost(data: CreatePostArgs): Promise<PostEntity> {
    const newPost = new PostEntity();

    newPost.title = data.title;

    const author = await this.userRepository.findOneOrFail({
      where: { id: data.authorId },
    });

    newPost.author = author;

    return this.postsRepository.save(newPost);
  }
}
