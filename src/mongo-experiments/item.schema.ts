import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class ItemSchema {
  @Prop()
  name: string;

  @Prop()
  stock: number;
}
