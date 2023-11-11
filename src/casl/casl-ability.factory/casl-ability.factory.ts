import {
  AbilityBuilder,
  InferSubjects,
  AbilityClass,
  Ability,
  ExtractSubjectType,
} from '@casl/ability';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Action } from '../enums/action.enum';
import { Post } from 'src/posts/schemas/post.schema';
import { User } from 'src/users/schemas/user.schema';
import { Organization } from 'src/organizations/schemas/organization.schema';
import { UsersService } from 'src/users/users.service';
import { PostsService } from 'src/posts/posts.service';
import { Role } from 'src/auth/enums/role.enum';

type Subjects =
  | InferSubjects<typeof Post | typeof User | typeof Organization>
  | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private userServices: UsersService,
    private postServices: PostsService,
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

    if (currentUser.org_id.toString() === post?.org_id.toString() || isAdmin) {
      can([Action.Read, Action.Update], Post);
    } else {
      cannot([Action.Read, Action.Update], Post);
    }

    if (currentUser._id.toString() === post?.user_id.toString() || isAdmin) {
      can(Action.Delete, Post);
    } else {
      cannot(Action.Delete, Post);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
