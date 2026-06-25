import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
