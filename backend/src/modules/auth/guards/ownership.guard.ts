import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
  };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    @Optional()
    @Inject(UsersService)
    private readonly usersService?: UsersService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const rawTargetId = request.params.id;
    const targetId = Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId;

    if (!user || !targetId) return false;

    // Se for ADMIN, permite tudo
    if (user.role === Role.ADMIN) return true;

    // Se o ID da sessão for diretamente igual ao targetId
    if (user.userId === targetId) return true;

    // Buscar o usuário no banco para comparar id e supabaseId
    if (this.usersService) {
      return this.usersService
        .findOne(targetId)
        .then((targetUser) => {
          if (
            targetUser.id === user.userId ||
            targetUser.supabaseId === user.userId
          ) {
            return true;
          }
          throw new ForbiddenException(
            'Você não tem permissão para realizar esta ação neste recurso.',
          );
        });
    }

    throw new ForbiddenException(
      'Você não tem permissão para realizar esta ação neste recurso.',
    );
  }
}
