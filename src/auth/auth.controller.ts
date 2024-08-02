import { Controller, UseGuards, Get, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Get('to-google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) { }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Response() res) {
    const { user } = req;
    const token = await this.authService.login(user);
    return res.redirect(`http://localhost:3001/auth-callback?token=${token.access_token}`);
  }
}
