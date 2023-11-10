import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostGuard } from './guards/post.guard';

@UseGuards(PostGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get()
  async findAll() {
    const posts = await this.postsService.findAll();
    if (!posts) {
      return [];
    }
    return posts;
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    

    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
