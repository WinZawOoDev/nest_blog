import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './modules/posts/posts.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CaslModule } from './modules/casl/casl.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostsModule,
    OrganizationsModule,
    CaslModule,
    MongooseModule.forRoot('mongodb://localhost:27017/nest_blog', {
      connectionFactory: (connection) => {
        connection.plugin(require('@meanie/mongoose-to-json'));
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 5, 
      max: 10,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
