import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ServicesService } from './services.service';

@Controller('mentor')
@UseGuards(RolesGuard)
@Roles(Role.MENTOR, Role.ADMIN)
export class MentorController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('assignments')
  getAssignments(@CurrentUser() user: User) {
    return this.servicesService.getMentorAssignments(user.id);
  }
}
