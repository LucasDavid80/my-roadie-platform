import { ExecutionContext } from '@nestjs/common';
import {
  currentUserFactory,
  CurrentUserPayload,
} from './current-user.decorator';
import { Role } from '@prisma/client';

describe('CurrentUser Decorator', () => {
  const mockUser: CurrentUserPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: Role.MUSICIAN,
  };

  it('should return entire user object when no property data is specified', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const result = currentUserFactory(undefined, ctx);

    expect(result).toEqual(mockUser);
  });

  it('should return specific property when property name is specified', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const userId = currentUserFactory('userId', ctx);
    const role = currentUserFactory('role', ctx);

    expect(userId).toBe('user-123');
    expect(role).toBe(Role.MUSICIAN);
  });

  it('should return null if user is not present on request', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const result = currentUserFactory(undefined, ctx);

    expect(result).toBeNull();
  });
});
