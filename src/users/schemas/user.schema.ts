import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: String, enum: Role })
  roles: Role[];

  @Prop({ required: true, default: new Date() })
  created_date: Date;

  @Prop({ required: true, default: null })
  updated_date: Date;
}

export const UserShema = SchemaFactory.createForClass(User);
