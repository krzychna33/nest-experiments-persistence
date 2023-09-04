import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class PostModel {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => UserModel)
  author: UserModel;
}
