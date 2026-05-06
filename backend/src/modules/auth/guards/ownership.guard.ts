import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
  };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const targetId = request.params.id;

    if (!user) return false;

    // Se for ADMIN, permite tudo
    if (user.role === Role.ADMIN) return true;

    // Se o ID do usuário logado for igual ao ID do alvo, permite
    if (user.userId === targetId) return true;

    throw new ForbiddenException(
      'Você não tem permissão para realizar esta ação neste recurso.',
    );
  }
}
