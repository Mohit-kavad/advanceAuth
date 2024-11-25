import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from './guard/roles.guard';
import { AuthenticatedGuard } from './guard/authenticated.guard';
import { Role } from './enums/role.enum';
import { Roles } from './decoretors/roles.decorator';

@Controller('users')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class UsersController {
  @Get('admin-dashboard')
  @Roles(Role.ADMIN)
  getAdminDashboard() {
    return 'This is the Admin Dashboard!';
  }

  @Get('user-profile')
  @Roles(Role.ADMIN, Role.USER)
  getUserProfile() {
    return 'This is the User Profile!';
  }

  @Get('moderator-dashboard')
  @Roles(Role.MODERATOR)
  getModeratorDashboard() {
    return 'This is the Moderator Dashboard!';
  }
}
