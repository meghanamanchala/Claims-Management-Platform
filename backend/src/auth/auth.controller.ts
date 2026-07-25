import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password?: string; role?: 'PATIENT' | 'INSURER' }) {
    return this.authService.login(body.email, body.password, body.role);
  }

  @Post('signup')
  async signup(@Body() body: { name?: string; email: string; password?: string; role?: 'PATIENT' | 'INSURER' }) {
    return this.authService.signup(body.name || '', body.email, body.password, body.role);
  }
}
