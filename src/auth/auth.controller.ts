import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered and logged in' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: any
  ) {
    const user = await this.usersService.create(createUserDto);
    const authData = await this.authService.login(user);

    // Set httpOnly cookie for API requests
    res.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Set non-httpOnly cookie for WebSocket authentication
    res.cookie('ws_token', authData.accessToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return authData;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const authData = await this.authService.login(user);

    // Set httpOnly cookie for API requests
    res.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Set non-httpOnly cookie for WebSocket authentication
    res.cookie('ws_token', authData.accessToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return authData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('ws_token', {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Init Google OAuth2 login' })
  async googleAuth(@Req() req) { }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.validateOAuthUser(req.user);
    const authData = await this.authService.login(user);

    // Set httpOnly cookie for API requests
    res.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Set non-httpOnly cookie for WebSocket authentication
    res.cookie('ws_token', authData.accessToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Redirect to frontend
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?user=${encodeURIComponent(JSON.stringify(authData.user))}`;

    return res.redirect(redirectUrl);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Init GitHub OAuth2 login' })
  async githubAuth(@Req() req) { }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth2 callback' })
  async githubAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.validateOAuthUser(req.user);
    const authData = await this.authService.login(user);

    // Set httpOnly cookie for API requests
    res.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Set non-httpOnly cookie for WebSocket authentication
    res.cookie('ws_token', authData.accessToken, {
      httpOnly: false,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Redirect to frontend
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?user=${encodeURIComponent(JSON.stringify(authData.user))}`;

    return res.redirect(redirectUrl);
  }
}