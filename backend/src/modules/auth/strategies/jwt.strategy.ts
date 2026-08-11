import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { Role } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role?: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      'https://hpgvbizdmhxukyoqjvmo.supabase.co';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request: any, rawJwtToken: any, done: any) => {
        const jwksProvider = passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
        });

        jwksProvider(request, rawJwtToken, (err, secret) => {
          if (err || !secret) {
            const fallbackSecret =
              process.env.JWT_SECRET || 'SECRET_KEY_MYROADIE_2026';
            return done(null, fallbackSecret);
          }
          return done(null, secret);
        });
      },
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || Role.MUSICIAN,
    };
  }
}

