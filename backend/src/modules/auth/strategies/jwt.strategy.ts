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
      process.env.SUPABASE_URL || 'https://hpgvbizdmhxukyoqjvmo.supabase.co';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'RS256', 'HS256'],
      secretOrKeyProvider: (
        request: unknown,
        rawJwtToken: unknown,
        done: (err: any, secret?: string | Buffer) => void,
      ) => {
        let alg: string | undefined;
        if (typeof rawJwtToken === 'string') {
          try {
            const headerBase64 = rawJwtToken.split('.')[0];
            if (headerBase64) {
              const decodedHeader = JSON.parse(
                Buffer.from(headerBase64, 'base64url').toString('utf8'),
              );
              alg = decodedHeader.alg;
            }
          } catch {
            // Se falhar a decodificação do cabeçalho, segue para o jwksProvider/fallback
          }
        }

        const fallbackSecret =
          process.env.JWT_SECRET || 'SECRET_KEY_MYROADIE_2026';

        if (alg === 'HS256') {
          return done(null, fallbackSecret);
        }

        const jwksProvider = passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
        });

        jwksProvider(
          request,
          rawJwtToken,
          (err: Error | null, secret?: string | Buffer) => {
            if (err || !secret) {
              done(null, fallbackSecret);
              return;
            }
            done(null, secret);
          },
        );
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
