import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { rmSpaces2lowerStr } from '../utils/index';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  create(createPostDto: CreatePostDto) {
    try {
      return this.postModel
        .findOneAndUpdate({ title: createPostDto.title }, createPostDto, {
          upsert: true,
          new: true,
        })
        .exec();
    } catch (error) {
      throw new HttpException(
        'Internal server error creating post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return this.postModel.find();
  }

  findOne(id: string) {
    return this.postModel.findById(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new HttpException('Updating post not found', HttpStatus.NOT_FOUND);
    }
    if (
      rmSpaces2lowerStr(post.title) === rmSpaces2lowerStr(updatePostDto.title)
    ) {
      throw new HttpException(
        'Title alreadey exists!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    post.title = updatePostDto.title;
    post.body = updatePostDto.body;
    //@ts-ignore
    post.user_id = new Types.ObjectId('654ca442641e1890d1f92ba0');
    post.updated_date = new Date();
    return await post.save();
  }

  remove(id: string) {
    try {
      return this.postModel.deleteOne({ _id: id });
    } catch (error) {
      throw new HttpException(
        'Internal server errors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
