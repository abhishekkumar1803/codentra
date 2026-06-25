import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BookServiceDto } from './dto/services.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get('catalog')
  getCatalog() {
    return this.servicesService.getCatalog();
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  bookService(@CurrentUser() user: User, @Body() dto: BookServiceDto) {
    return this.servicesService.bookService(user.id, dto);
  }

  @Get('me')
  getMyBookings(@CurrentUser() user: User) {
    return this.servicesService.getMyBookings(user.id);
  }
}
