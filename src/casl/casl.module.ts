import { Module, forwardRef } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory/casl-ability.factory';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';

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
