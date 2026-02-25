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
      console.log('[Auth Debug] AuthService.refresh called with token length:', refreshToken?.length);

      let payload;
      try {
        payload = this.jwtService.verify(refreshToken);
        console.log('[Auth Debug] JWT verified successfully for:', payload.email);
      } catch (jwtError) {
        console.error('[Auth Error] JWT verification failed:', jwtError.message);
        throw new UnauthorizedException('Invalid refresh token signature or expired');
      }

      const session = await this.prisma.session.findUnique({
        where: { token: refreshToken }
      });

      if (!session) {
        console.warn('[Auth Warning] Session not found in database for token');
        throw new UnauthorizedException('Session not found');
      }

      if (!session.isValid) {
        console.warn('[Auth Warning] Session is marked as invalid in database');
        throw new UnauthorizedException('Session invalidated');
      }

      if (session.expiresAt < new Date()) {
        console.warn('[Auth Warning] Session has expired in database');
        throw new UnauthorizedException('Session expired');
      }

      console.log('[Auth Debug] Rotating session for user:', session.userId);

      // Use a transaction to ensure atomicity and handle race conditions
      const result = await this.prisma.$transaction(async (tx) => {
        // Re-verify session exists within transaction
        const currentSession = await tx.session.findUnique({
          where: { token: refreshToken }
        });

        if (!currentSession) {
          // If not found, it might have been rotated by a concurrent request
          return { error: 'Session not found', code: 'SESSION_MISSING' };
        }

        if (!currentSession.isValid) {
          return { error: 'Session invalidated', code: 'SESSION_INVALID' };
        }

        const newPayload = { email: payload.email, sub: payload.sub, role: payload.role };
        const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
        const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

        // Delete old session and create new one
        await tx.session.delete({ where: { id: currentSession.id } });
        const createdSession = await tx.session.create({
          data: {
            userId: currentSession.userId,
            token: newRefreshToken,
            accessToken: newAccessToken,
            ipAddress: currentSession.ipAddress,
            userAgent: currentSession.userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, userId: currentSession.userId };
      });

      if ('error' in result) {
        console.warn(`[Auth Warning] Refresh restricted: ${result.error} (${result.code})`);

        // Special case: if session is missing, check if a new one was just created for this user
        if (result.code === 'SESSION_MISSING') {
          // This is likely a race condition where another request already rotated the token
          // We'll throw but with a more specific message that we can potentially handle
          throw new UnauthorizedException('Session already rotated or missing');
        }

        throw new UnauthorizedException(result.error);
      }

      const { accessToken, refreshToken: rotatedToken, userId } = result;
      console.log('[Auth Debug] Rotating session successful for user:', userId);

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

      return { accessToken, refreshToken: rotatedToken, user };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      console.error('[Auth Error] Unexpected error in refresh:', e);
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

  async generateQrSession() {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return this.prisma.qrSession.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      }
    });
  }

  async verifyQrSession(token: string, userId: string) {
    const qrSession = await this.prisma.qrSession.findUnique({
      where: { token }
    });

    if (!qrSession || qrSession.isUsed || qrSession.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired QR session');
    }

    return this.prisma.qrSession.update({
      where: { id: qrSession.id },
      data: {
        userId,
        isUsed: true
      }
    });
  }

  async checkQrSessionStatus(token: string, ip?: string, ua?: string) {
    const qrSession = await this.prisma.qrSession.findUnique({
      where: { token }
    });

    if (!qrSession) return { status: 'invalid' };
    if (qrSession.expiresAt < new Date()) return { status: 'expired' };

    if (qrSession.isUsed && qrSession.userId) {
      const user = await this.prisma.user.findUnique({ where: { id: qrSession.userId } });
      if (!user) return { status: 'invalid' };

      const loginData = await this.login(user, ip, ua);
      await this.prisma.qrSession.delete({ where: { id: qrSession.id } }).catch(() => { }); // Ignore errors if already deleted

      return { status: 'verified', ...loginData };
    }

    return { status: 'pending' };
  }

  async rejectQrSession(token: string) {
    const qrSession = await this.prisma.qrSession.findUnique({
      where: { token }
    });

    if (qrSession) {
      await this.prisma.qrSession.delete({ where: { id: qrSession.id } });
    }
    return { success: true };
  }
}
