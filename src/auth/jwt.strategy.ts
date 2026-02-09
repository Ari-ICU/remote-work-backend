import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['token'];
            console.log('🍪 Cookie token:', token ? 'Found' : 'Not found');
            console.log('🍪 Available cookies:', Object.keys(req.cookies));
          } else {
            console.log('❌ No cookies in request');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('✅ JWT validated for:', payload.email);
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}