import { Controller, Post, Get, Put, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { EditRequestsService } from './edit-requests.service';
import { CreateEditRequestDto } from './dto/create-edit-request.dto';
import { UpdateEditRequestDto } from './dto/update-edit-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('api/edit-requests')
@UseGuards(AuthGuard)
export class EditRequestsController {
  constructor(private editRequestsService: EditRequestsService) {}

  @Post()
  async createEditRequest(@Body() createEditRequestDto: CreateEditRequestDto, @Req() req: Request) {
    return this.editRequestsService.createEditRequest(createEditRequestDto, req.user.userId);
  }

  @Get()
  async getEditRequests(@Req() req: Request) {
    return this.editRequestsService.getEditRequests(req.user.userId);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async getAllEditRequests() {
    return this.editRequestsService.getAllEditRequests();
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async updateEditRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEditRequestDto: UpdateEditRequestDto,
    @Req() req: Request,
  ) {
    return this.editRequestsService.updateEditRequest(id, updateEditRequestDto, req.user.userId);
  }
}
