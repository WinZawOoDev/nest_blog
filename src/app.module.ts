import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forRoot('mongodb://localhost:27017/nest_blog', {
      connectionFactory: (connection) => {
        connection.plugin(require('@meanie/mongoose-to-json'));
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    PostsModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
