import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  AdminActivityLogsQueryDto,
  AdminPaymentsQueryDto,
  AdminSubscriptionsQueryDto,
  AdminUsersQueryDto,
  UpdateAdminUserDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() admin: User,
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(id, dto, admin.id);
  }

  @Get('subscriptions')
  listSubscriptions(@Query() query: AdminSubscriptionsQueryDto) {
    return this.adminService.listSubscriptions(query);
  }

  @Get('payments')
  listPayments(@Query() query: AdminPaymentsQueryDto) {
    return this.adminService.listPayments(query);
  }

  @Get('activity-logs')
  listActivityLogs(@Query() query: AdminActivityLogsQueryDto) {
    return this.adminService.listActivityLogs(query);
  }
}
