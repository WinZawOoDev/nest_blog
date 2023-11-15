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
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CaslAbilityFactory } from '../casl/casl-ability.factory/casl-ability.factory';
import { Action } from '../casl/enums/action.enum';
import { Post as PostSchema } from './schemas/post.schema';
import { Role } from 'src/modules/auth/enums/role.enum';
import { OrganizationsService } from '../organizations/organizations.service';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly orgSerivce: OrganizationsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    @Inject(CACHE_MANAGER) readonly cacheService: Cache,
  ) {}

  @Post()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    if (req.user.roles !== Role.Admin) {
      const org = await this.orgSerivce.findOne(req.user.org_id);
      if (!org)
        throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
    }
    return this.postsService.create(
      createPostDto,
      req.user.sub,
      req.user.org_id,
    );
  }

  @Get()
  async findAll(@Request() req) {
    if (req.user.roles === Role.Admin) {
      const posts_cache = await this.cacheService.get('posts');
      if (posts_cache) {
        return posts_cache;
      } else {
        const posts = await this.postsService.findAll();
        await this.cacheService.set('posts', posts);
        return posts;
      }
    } else {
      const cacheKey = `posts-org-${req.user.org_id}`;
      const posts_org_cache = await this.cacheService.get(cacheKey);
      if (posts_org_cache) {
        return posts_org_cache;
      } else {
        const post_org = await this.postsService.findByOrg(req.user.org_id);
        await this.cacheService.set(cacheKey, post_org);
        return post_org;
      }
    }
    return [];
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const ability = await this.caslAbilityFactory.forUser(req.user.sub, id);
    if (!ability.can(Action.Read, PostSchema)) {
      throw new HttpException(
        `don't have permission to read`,
        HttpStatus.FORBIDDEN,
      );
    }
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const ability = await this.caslAbilityFactory.forUser(req.user.sub, id);
    if (!ability.can(Action.Update, PostSchema)) {
      throw new HttpException(
        `don't have permission to update`,
        HttpStatus.FORBIDDEN,
      );
    }
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const ability = await this.caslAbilityFactory.forUser(req.user.sub, id);
    if (!ability.can(Action.Delete, PostSchema))
      throw new HttpException(
        `don't have permission to delete`,
        HttpStatus.FORBIDDEN,
      );
    return this.postsService.remove(id);
  }
}
