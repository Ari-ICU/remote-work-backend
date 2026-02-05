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
    console.log('Validating user:', email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found in DB');
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    console.log('Password match:', isMatch);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    };
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