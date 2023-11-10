import {
  AbilityBuilder,
  InferSubjects,
  AbilityClass,
  Ability,
  ExtractSubjectType,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
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

    const [currentUser, postUser] = await Promise.all([
      this.userServices.findById(userId),
      this.postServices.findUserInfo(postId),
    ]);

    //@ts-ignore
    if (currentUser.roles === Role.Admin) {
      can(Action.Manage, 'all');
    } else if (currentUser.org_id === postUser.user.org_id) {
      can([Action.Read, Action.Update, Action.Delete], Post);
    } else {
      cannot([Action.Read, Action.Update, Action.Delete], Post);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
