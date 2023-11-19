import {
  AbilityBuilder,
  InferSubjects,
  AbilityClass,
  Ability,
  ExtractSubjectType,
} from '@casl/ability';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Action } from '../enums/action.enum';
import { Post } from '../../posts/schemas/post.schema';
import { User } from '../../users/schemas/user.schema';
import { Organization } from '../../organizations/schemas/organization.schema';
import { UsersService } from '../../users/users.service';
import { PostsService } from 'src/modules/posts/posts.service';
import { Role } from 'src/modules/auth/enums/role.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

type Subjects =
  | InferSubjects<typeof Post | typeof User | typeof Organization>
  | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private userServices: UsersService,
    private postServices: PostsService,
    @Inject(CACHE_MANAGER) cacheService: Cache,
  ) {}

  async forUser(userId: string, postId: string) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    const [currentUser, post] = await Promise.all([
      this.userServices.findById(userId),
      this.postServices.findOne(postId),
    ]);

    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    //@ts-ignore
    const isAdmin = currentUser.roles === Role.Admin;
    const isSameOrg =
      currentUser.org_id &&
      post.org_id &&
      currentUser.org_id.toString() === post?.org_id.toString();

    const isSameUser = currentUser._id.toString() === post?.user_id.toString();

    if (isSameOrg || isAdmin) {
      can([Action.Read], Post);
    } else {
      cannot([Action.Read, Action.Update, Action.Delete], Post);
    }

    if (isSameUser || isAdmin) {
      can([Action.Update, Action.Delete], Post);
    } else {
      cannot([Action.Update, Action.Delete], Post);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
