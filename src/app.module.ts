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
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostsModule,
    OrganizationsModule,
    CaslModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NAME}`,
      {
        connectionFactory: (connection) => {
          connection.plugin(require('@meanie/mongoose-to-json'));
          connection.plugin(require('mongoose-autopopulate'));
          return connection;
        },
      },
    ),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLER_TTL),
        limit: parseInt(process.env.THROTTLER_LIMIT),
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
