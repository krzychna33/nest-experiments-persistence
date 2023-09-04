import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PostModel } from './models/post.model';
import { PostsService } from './posts.service';
import { PostInput } from './models/post.input';
import { UsersService } from './users.service';
import { PostsLoader } from './posts.loader';
import { UserModel } from './models/user.model';

@Resolver(() => PostModel)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly userService: UsersService,
    private readonly postsLoader: PostsLoader,
  ) {}

  @Query(() => [PostModel])
  async posts(): Promise<PostModel[]> {
    const posts = await this.postsService.getAllPosts();
    return posts;
  }

  @Mutation(() => PostModel)
  async createPost(
    @Args('input') createPostInput: PostInput,
  ): Promise<PostModel> {
    const createdPost = await this.postsService.createPost(createPostInput);
    return createdPost;
  }

  @ResolveField('author', () => UserModel)
  async getAuthor(@Parent() post: PostModel): Promise<UserModel> {
    const author = await this.postsLoader.batchAuthors.load(post.authorId);
    return author;
  }
}
