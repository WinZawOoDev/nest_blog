import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {
    try {
      return this.userModel.findById(id);
    } catch (error) {
      throw new HttpException(
        'Internal server errors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  create(createUserDto: CreateUserDto) {
    try {
      return this.userModel
        .findOneAndUpdate({ email: createUserDto.email }, createUserDto, {
          upsert: true,
          new: true,
        })
        .select(`-password`)
        .exec();
    } catch (error) {
      throw new HttpException(
        'Internal server errors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(updateUserDto: UpdateUserDto, id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('Updating user not found', HttpStatus.NOT_FOUND);
    }
    user.name = updateUserDto.name;
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
