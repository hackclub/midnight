import { Controller, Get, Put, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('api/admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('submissions')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async getAllSubmissions() {
    return this.adminService.getAllSubmissions();
  }

  @Get('edit-requests')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async getAllEditRequests() {
    return this.adminService.getAllEditRequests();
  }

  @Put('submissions/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async updateSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Req() req: Request,
  ) {
    return this.adminService.updateSubmission(id, updateSubmissionDto, req.user.userId);
  }

  @Put('projects/:id/unlock')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async unlockProject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.adminService.unlockProject(id, req.user.userId);
  }
}
