import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema()
export class Organization {
  @Prop({ required: true, index: true, unique: true })
  name: string;

  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  created_user: User;

  @Prop({ required: true, default: new Date() })
  created_date: Date;

  @Prop({ required: true, default: null })
  updated_date: Date;
}

export const OrganizationScheam = SchemaFactory.createForClass(Organization);
