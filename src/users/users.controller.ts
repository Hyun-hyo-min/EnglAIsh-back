import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getUserProgress(@Request() req) {
    return this.usersService.getUserProgress(req.user.id);
  }
}
