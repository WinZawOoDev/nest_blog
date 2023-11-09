import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true, unique: true, index: true })
  title: string;

  @Prop({ required: true, unique: true })
  body: string;

  @Prop({ required: true, default: new Date() })
  created_date: Date;

  @Prop({ required: true, default: null })
  updated_date: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);
