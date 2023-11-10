import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';
import { Organization } from 'src/organizations/schemas/organization.schema';

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

  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization' })
  org_id: Organization;

  @Prop({ required: true, default: new Date() })
  created_date: Date;

  @Prop({ required: true, default: null })
  updated_date: Date;
}

export const UserShema = SchemaFactory.createForClass(User);
