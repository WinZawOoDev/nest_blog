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
    this.userModel.find();
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
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new HttpException('Error updating user', HttpStatus.NOT_FOUND);
      }
      user.name = updateUserDto.name;
      return await user.save();
    } catch (error) {
      throw new HttpException(
        'Internal server errors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  delete(id: string) {
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
