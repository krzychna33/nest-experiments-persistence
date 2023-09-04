import { Injectable, Scope } from '@nestjs/common';
import { UsersService } from './users.service';
import * as DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class PostsLoader {
  constructor(private readonly usersService: UsersService) {}

  public readonly batchAuthors = new DataLoader(async (authorIds: number[]) => {
    const users = await this.usersService.getUsersByIds(authorIds);
    const usersMap = new Map(users.map((user) => [user.id, user]));
    return authorIds.map((authorId) => usersMap.get(authorId));
  });
}
