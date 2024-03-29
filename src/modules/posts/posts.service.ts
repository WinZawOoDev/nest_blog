import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  create(createPostDto: CreatePostDto, userId: string, orgId: string) {
    return this.postModel
      .findOneAndUpdate(
        { title: createPostDto.title },
        {
          ...createPostDto,
          user_id: new Types.ObjectId(userId),
          org_id: orgId ? new Types.ObjectId(orgId) : null,
        },
        {
          upsert: true,
          new: true,
        },
      )
      .exec();
  }

  findAll() {
    return this.postModel.find();
  }

  findOne(id: string) {
    return this.postModel.findById(id).exec();
  }

  findByOrg(orgId: string) {
    return this.postModel.find({ org_id: new Types.ObjectId(orgId) }).exec();
  }

  async findUserInfo(postId: string) {
    const info = await this.postModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(postId) },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { __v: 0 } }],
        },
      },
      { $unwind: '$user' },
    ]);
    if (!info) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return info[0];
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    post.title = updatePostDto.title;
    post.body = updatePostDto.body;
    post.updated_date = new Date();
    return await post.save();
  }

  remove(id: string) {
    return this.postModel.deleteOne({ _id: id });
  }
}
