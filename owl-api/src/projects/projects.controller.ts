import { Controller, Post, Get, Put, Body, Param, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateHackatimeProjectsDto } from './dto/update-hackatime-projects.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get('approved')
  async getApprovedProjects() {
    return this.projectsService.getApprovedProjects();
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('sortBy') sortBy?: string) {
    const sortType = sortBy === 'approved' ? 'approved' : 'hours';
    return this.projectsService.getLeaderboard(sortType);
  }
}

@Controller('api/projects/auth')
@UseGuards(AuthGuard)
export class ProjectsAuthController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
  ) {
    return this.projectsService.createProject(createProjectDto, req.user.userId);
  }

  @Get()
  async getUserProjects(@Req() req: Request) {
    return this.projectsService.getUserProjects(req.user.userId);
  }

  @Get(':id')
  async getProject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.projectsService.getProject(id, req.user.userId);
  }

  @Post('submissions')
  async createSubmission(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Req() req: Request,
  ) {
    return this.projectsService.createSubmission(createSubmissionDto, req.user.userId);
  }

  @Get(':id/submissions')
  async getProjectSubmissions(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.projectsService.getProjectSubmissions(id, req.user.userId);
  }

  @Put(':id')
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: Request,
  ) {
    return this.projectsService.createEditRequest(id, updateProjectDto, req.user.userId);
  }

  @Put(':id/hackatime-projects')
  async updateHackatimeProjects(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHackatimeProjectsDto: UpdateHackatimeProjectsDto,
    @Req() req: Request,
  ) {
    return this.projectsService.updateHackatimeProjects(id, updateHackatimeProjectsDto, req.user.userId);
  }

  @Get(':id/hackatime-projects')
  async getHackatimeProjects(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.projectsService.getHackatimeProjects(id, req.user.userId);
  }
}
