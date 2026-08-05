import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface CurrentUserPayload {
  userId: string;
  email: string;
  role: Role;
}

export const currentUserFactory = (
  data: keyof CurrentUserPayload | undefined,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as CurrentUserPayload;

  if (!user) return null;

  return data ? user[data] : user;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
