import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RatingType, type User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/stats')
  getStats(@CurrentUser() user: User) {
    return this.usersService.getStats(user.id);
  }

  @Get('me/rating-history')
  getRatingHistory(
    @CurrentUser() user: User,
    @Query('type') type?: RatingType,
  ) {
    return this.usersService.getRatingHistory(user.id, type);
  }

  @Get('me/contest-history')
  getContestHistory(@CurrentUser() user: User) {
    return this.usersService.getContestHistory(user.id);
  }

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.id, file);
  }
}
