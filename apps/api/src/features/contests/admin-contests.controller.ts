import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContestsService } from './contests.service';
import {
  CreateContestDto,
  ListContestsQueryDto,
  UpdateContestDto,
} from './dto/contest.dto';

@Controller('admin/contests')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get()
  list(@Query() query: ListContestsQueryDto) {
    return this.contestsService.adminList(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.contestsService.adminGetById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: User, @Body() dto: CreateContestDto) {
    return this.contestsService.adminCreate(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContestDto) {
    return this.contestsService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.contestsService.adminDelete(id);
  }
}
