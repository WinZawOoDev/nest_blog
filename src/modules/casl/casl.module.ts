import { Module, forwardRef } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory/casl-ability.factory';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => PostsModule),
    forwardRef(() => OrganizationsModule),
  ],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
