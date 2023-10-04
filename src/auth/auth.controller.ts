import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './SignIn/signIn-dto';
import { CustomerAuthGuard } from './customer-auth.guard';

//auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(CustomerAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
