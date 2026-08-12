import {
  Injectable,
  Logger,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtAuthInfo {
  name?: string;
  message?: string;
}

interface JwtAuthError {
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = any>(
    err: JwtAuthError | null,
    user: TUser | false,
    info: JwtAuthInfo | null,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    void _context;
    void _status;

    if (err || !user) {
      let errorCode = 'UNAUTHORIZED';
      let message = 'Acesso não autorizado.';

      const infoMessage = info?.message || info?.name || '';

      if (info?.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
        message = 'O token de autenticação expirou. Faça login novamente.';
      } else if (
        info?.name === 'JsonWebTokenError' &&
        infoMessage.toLowerCase().includes('signature')
      ) {
        errorCode = 'INVALID_SIGNATURE';
        message =
          'A assinatura do token é inválida ou houve mismatch de algoritmo (ES256/HS256).';
      } else if (info?.name === 'JsonWebTokenError') {
        errorCode = 'MALFORMED_TOKEN';
        message = 'O formato do token fornecido é inválido.';
      } else if (infoMessage === 'No auth token' || !info) {
        errorCode = 'MISSING_BEARER';
        message = 'Cabeçalho de autorização (Bearer token) ausente.';
      }

      this.logger.warn(
        `Falha na autenticação JWT [${errorCode}]: ${message} | Detalhes: ${
          err?.message || info?.message || 'Nenhum detalhe adicional'
        }`,
      );

      throw new UnauthorizedException({
        statusCode: 401,
        code: errorCode,
        message,
        error: 'Unauthorized',
      });
    }

    return user as TUser;
  }
}
