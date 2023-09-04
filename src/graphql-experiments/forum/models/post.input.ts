import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PostInput {
  @Field()
  title: string;

  @Field()
  authorId: number;
}
