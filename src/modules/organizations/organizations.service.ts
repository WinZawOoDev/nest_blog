import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from './schemas/organization.schema';
import { Model, Types } from 'mongoose';
import { rmSpaces2lowerStr } from 'src/utils';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
  ) {}

  create(createOrgDto: CreateOrganizationDto, userId: string) {
    return this.orgModel
      .findOneAndUpdate(
        { name: createOrgDto.name },
        { ...createOrgDto, created_user: new Types.ObjectId(userId) },
        { upsert: true, new: true },
      )
      .exec();
  }

  findAll() {
    return this.orgModel.find();
  }

  async findOne(id: string) {
    const org = await this.orgModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'org_id',
            as: 'users',
            pipeline: [{ $project: { __v: 0, password: 0, org_id: 0 } }],
          },
        },
        { $project: { __v: 0 } },
      ])
      .exec();
    return org[0];
  }

  async update(
    id: string,
    updateOrgDto: UpdateOrganizationDto,
    userId: string,
  ) {
    const org = await this.orgModel.findById(id);
    if (!org) {
      throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
    }
    org.name = updateOrgDto.name;
    org.service = updateOrgDto.service;
    org.industry = updateOrgDto.industry;
    org.size = updateOrgDto.size;
    //@ts-ignore
    org.created_user = new Types.ObjectId(userId);
    org.updated_date = new Date();

    return await org.save();
  }

  remove(id: string) {
    return this.orgModel.deleteOne({ _id: id });
  }
}
