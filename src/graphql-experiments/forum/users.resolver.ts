import { Query, Resolver } from '@nestjs/graphql';
import { UserModel } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserModel])
  async users(): Promise<UserModel[]> {
    const users = await this.usersService.getAllUsers();
    return users;
  }
}
