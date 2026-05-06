import { Test, TestingModule } from '@nestjs/testing';
import { OwnershipGuard } from './ownership.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnershipGuard],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
  });

  const createMockContext = (
    userId: string,
    targetId: string,
    role: Role,
  ): ExecutionContext => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { userId, role },
          params: { id: targetId },
        }),
      }),
    };
    return mockContext as unknown as ExecutionContext;
  };

  it('deve permitir acesso se o usuário for ADMIN', () => {
    const context = createMockContext('user-1', 'user-2', Role.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir acesso se o usuário for o dono do recurso', () => {
    const context = createMockContext('user-1', 'user-1', Role.MUSICIAN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve lançar ForbiddenException se o usuário não for o dono nem ADMIN', () => {
    const context = createMockContext('user-1', 'user-2', Role.MUSICIAN);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
