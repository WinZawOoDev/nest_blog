import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findAll() {
    return this.userModel.find().select(`-password`);
  }

  findOne(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  findAdmin() {
    return this.userModel
      .findOne({ roles: 'admin' })
      .select(`-password`)
      .exec();
  }

  async getProfile(id: string) {
    const userInfo = await this.userModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'organizations',
            localField: 'org_id',
            foreignField: '_id',
            as: 'orgnization',
            pipeline: [{ $project: { __v: 0 } }],
          },
        },
        {
          $unwind: {
            path: '$orgnization',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $project: { __v: 0, password: 0, org_id: 0 } },
      ])
      .exec();
    return userInfo[0];
  }

  create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync();
    const password = bcrypt.hashSync(createUserDto.password, salt);
    const createUser = {
      ...createUserDto,
      password,
      org_id: new Types.ObjectId(createUserDto.org_id),
    };

    return this.userModel
      .findOneAndUpdate({ email: createUserDto.email }, createUser, {
        upsert: true,
        new: true,
      })
      .select(`-password`)
      .exec();
  }

  async update(updateUserDto: UpdateUserDto, id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('Updating user not found', HttpStatus.NOT_FOUND);
    }
    user.name = updateUserDto.name;
    user.updated_date = new Date();
    return await user.save();
  }

  remove(id: string) {
    try {
      return this.userModel.deleteOne({ _id: id });
    } catch (error) {
      throw new HttpException(
        'Internal server errors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
