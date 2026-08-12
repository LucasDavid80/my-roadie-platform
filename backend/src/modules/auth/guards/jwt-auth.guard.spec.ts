import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Role } from '@prisma/client';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    guard = new JwtAuthGuard();
    mockContext = {} as ExecutionContext;
  });

  it('deve estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest - Casos Positivos', () => {
    it('deve retornar o usuário quando a autenticação for bem sucedida', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'musician@myroadie.br',
        role: Role.MUSICIAN,
      };

      const result = guard.handleRequest(null, mockUser, null, mockContext);
      expect(result).toEqual(mockUser);
    });

    it('deve permitir acesso para papéis válidos como ROADIE', () => {
      const mockUser = {
        userId: 'roadie-789',
        email: 'roadie@myroadie.br',
        role: Role.ROADIE,
      };

      const result = guard.handleRequest(null, mockUser, null, mockContext);
      expect(result).toEqual(mockUser);
    });

    it('deve permitir acesso para perfil ADMIN', () => {
      const mockUser = {
        userId: 'admin-001',
        email: 'admin@myroadie.br',
        role: Role.ADMIN,
      };

      const result = guard.handleRequest(null, mockUser, null, mockContext);
      expect(result).toEqual(mockUser);
    });
  });

  describe('handleRequest - Casos Negativos', () => {
    it('deve lançar UnauthorizedException com TOKEN_EXPIRED quando o token estiver expirado', () => {
      const info = { name: 'TokenExpiredError', message: 'jwt expired' };

      try {
        guard.handleRequest(null, false, info, mockContext);
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        const response = err.getResponse();
        expect(response).toEqual({
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
          message: 'O token de autenticação expirou. Faça login novamente.',
          error: 'Unauthorized',
        });
      }
    });

    it('deve lançar UnauthorizedException com INVALID_SIGNATURE em caso de erro na assinatura ou mismatch', () => {
      const info = {
        name: 'JsonWebTokenError',
        message: 'invalid signature',
      };

      try {
        guard.handleRequest(null, false, info, mockContext);
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        const response = err.getResponse();
        expect(response).toEqual({
          statusCode: 401,
          code: 'INVALID_SIGNATURE',
          message:
            'A assinatura do token é inválida ou houve mismatch de algoritmo (ES256/HS256).',
          error: 'Unauthorized',
        });
      }
    });

    it('deve lançar UnauthorizedException com MALFORMED_TOKEN em caso de token com formato inválido', () => {
      const info = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };

      try {
        guard.handleRequest(null, false, info, mockContext);
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        const response = err.getResponse();
        expect(response).toEqual({
          statusCode: 401,
          code: 'MALFORMED_TOKEN',
          message: 'O formato do token fornecido é inválido.',
          error: 'Unauthorized',
        });
      }
    });

    it('deve lançar UnauthorizedException com MISSING_BEARER quando o cabeçalho Bearer estiver ausente', () => {
      const info = { message: 'No auth token' };

      try {
        guard.handleRequest(null, false, info, mockContext);
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        const response = err.getResponse();
        expect(response).toEqual({
          statusCode: 401,
          code: 'MISSING_BEARER',
          message: 'Cabeçalho de autorização (Bearer token) ausente.',
          error: 'Unauthorized',
        });
      }
    });

    it('deve lançar UnauthorizedException com MISSING_BEARER quando info for null ou indefinido', () => {
      try {
        guard.handleRequest(null, false, null, mockContext);
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        const response = err.getResponse();
        expect(response.code).toBe('MISSING_BEARER');
      }
    });
  });
});
