import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true,
        headline: true,
        website: true,
        github: true,
        linkedin: true,
        location: true,
        skills: true,
        hourlyRate: true,
      }
    });
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, ip?: string, ua?: string) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store both tokens in DB session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken, // Use token column for refreshToken for compatibility
        accessToken: accessToken, // Use new accessToken column
        ipAddress: ip,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days (based on Refresh Token)
      }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        location: user.location,
        skills: user.skills,
        hourlyRate: user.hourlyRate,
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const session = await this.prisma.session.findUnique({
        where: { token: refreshToken }
      });

      if (!session || !session.isValid || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid session');
      }

      const newPayload = { email: payload.email, sub: payload.sub, role: payload.role };
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Rotate tokens - delete old, create new
      await this.prisma.session.delete({ where: { id: session.id } });
      await this.prisma.session.create({
        data: {
          userId: session.userId,
          token: newRefreshToken,
          accessToken: accessToken,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      });

      // Fetch user data to return
      const user = await this.prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          bio: true,
          headline: true,
          website: true,
          github: true,
          linkedin: true,
          location: true,
          skills: true,
          hourlyRate: true,
        }
      });

      return { accessToken, refreshToken: newRefreshToken, user };
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    await this.prisma.session.deleteMany({
      where: { token: refreshToken }
    });
  }

  async validateAccessToken(token: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { accessToken: token }
    });

    return !!(session && session.isValid);
  }

  async validateSession(token: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { token }
    });

    return !!(session && session.isValid && session.expiresAt > new Date());
  }

  async validateOAuthUser(profile: any) {
    const { email, firstName, lastName, picture } = profile;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          avatar: picture,
          password: '', // OAuth users don't have a password
          role: 'FREELANCER', // Default role
        },
      });
    }

    return user;
  }
}