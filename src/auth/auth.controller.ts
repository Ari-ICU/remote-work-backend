import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@ApiTags('auth')
@Controller('auth')
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) { }

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const req = res.req;
    const origin = req.headers.origin;

    // Cross-site requests (like Vercel to Localhost) REQUIRED SameSite: None and Secure: true
    // Note: Secure: true requires the backend to be on HTTPS (except for localhost in some browsers)
    const isCrossSite = origin && !origin.includes('localhost:3001') && !origin.includes('localhost:3000');

    // If we're in production OR the request is coming from a cross-site origin (like Vercel)
    const useSecure = isProduction || isCrossSite;
    const sameSite = isCrossSite || isProduction ? 'none' : 'lax';

    const cookieOptions = {
      httpOnly: true,
      secure: useSecure,
      sameSite: sameSite as any,
      path: '/',
    };

    // Access Token (Short-lived: 15m)
    res.cookie('token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // Refresh Token (Long-lived: 7d)
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // IS_AUTHENTICATED (For Frontend UI State - NOT HttpOnly)
    res.cookie('is_authenticated', 'true', {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const req: any = res.req;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'];
    const { accessToken, refreshToken, user: userData } = await this.authService.login(user, ip, ua);

    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      user: userData,
      // Tokens are now stored in HttpOnly cookies and database session
    };
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: any
  ) {
    const user = await this.usersService.create(createUserDto);
    const req: any = res.req;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'];
    const { accessToken, refreshToken, user: userData } = await this.authService.login(user, ip, ua);

    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      user: userData,
      // Tokens are now stored in HttpOnly cookies and database session
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req, @Res({ passthrough: true }) res) {

    const { refreshToken: bodyRefreshToken } = req.body || {};
    const cookieRefreshToken = req.cookies['refresh_token'] || req.cookies['refreshToken'];
    const refreshToken = cookieRefreshToken || bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refresh(refreshToken);

      // Always update cookies
      this.setAuthCookies(res, accessToken, newRefreshToken);

      return {
        success: true,
        user
        // Tokens are now in cookies
      };
    } catch (e) {
      // Clear all cookies if refresh fails
      res.clearCookie('token');
      res.clearCookie('refresh_token');
      res.clearCookie('is_authenticated');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('token');
    res.clearCookie('refresh_token');
    res.clearCookie('is_authenticated');

    return { success: true };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.validateOAuthUser(req.user);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'];

    const { accessToken, refreshToken, user: userData } = await this.authService.login(user, ip, ua);

    this.setAuthCookies(res, accessToken, refreshToken);

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    // No tokens in the URL - they are in HttpOnly cookies
    const redirectUrl = `${frontendUrl}/auth/callback?user=${encodeURIComponent(JSON.stringify(userData))}`;

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
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'];

    const { accessToken, refreshToken, user: userData } = await this.authService.login(user, ip, ua);

    this.setAuthCookies(res, accessToken, refreshToken);

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    // No tokens in the URL - they are in HttpOnly cookies
    const redirectUrl = `${frontendUrl}/auth/callback?user=${encodeURIComponent(JSON.stringify(userData))}`;

    return res.redirect(redirectUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }
}