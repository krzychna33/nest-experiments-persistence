import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class PetsSchema {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId })
  ownerId: string;
}

export class PetOwner {
  pets: PetsSchema[];
}
