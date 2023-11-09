import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserShema } from './schemas/user.schema';

@Module({
  imports:[MongooseModule.forFeature([{name: User.name, schema: UserShema}])],
  providers: [UsersService]
})
export class UsersModule {}
