import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard/jwt-auth.guard';
import { Roles } from './decorators/roles/roles.decorator';
import { RolesGuard } from './guards/roles.guard/roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('register')
    register(@Body() RegisterDto: RegisterDto){
        return this.authService.register(RegisterDto);
    }

    @Post('login')
    login(@Body() LoginDto: LoginDto){
        return this.authService.login(LoginDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    adminRoute() {
        return 'Solo ADMIN';
    }

    @Get('verify-email')
    verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
    }

    @Post('forgot-password')
    forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
    ) {
    return this.authService.resetPassword(token, newPassword);
    }

    @Get('reset-password')
    showResetForm(@Query('token') token: string) {
    return {
        message: 'Token válido',
        token,
    };
    }

}
