import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(
    id: string,
    reqUser?: { userId: string; email: string; role?: Role },
  ) {
    const searchConditions: Prisma.UserWhereInput[] = [
      { id },
      { supabaseId: id },
      { email: id },
    ];

    if (reqUser?.email) {
      searchConditions.push({ email: reqUser.email });
    }
    if (reqUser?.userId) {
      searchConditions.push({ supabaseId: reqUser.userId });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: searchConditions,
      },
    });

    if (!user) {
      if (
        reqUser &&
        (id === reqUser.userId || id === reqUser.email || id === 'me')
      ) {
        const validRoles = Object.values(Role);
        const userRole =
          reqUser.role && validRoles.includes(reqUser.role)
            ? reqUser.role
            : Role.MUSICIAN;

        return await this.prisma.user.create({
          data: {
            supabaseId: reqUser.userId || id,
            email: reqUser.email,
            name: '',
            role: userRole,
          },
        });
      }

      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    reqUser?: { userId: string; email: string; role?: Role },
  ) {
    const searchConditions: Prisma.UserWhereInput[] = [
      { id },
      { supabaseId: id },
      { email: id },
    ];

    if (reqUser?.email) {
      searchConditions.push({ email: reqUser.email });
    }
    if (reqUser?.userId) {
      searchConditions.push({ supabaseId: reqUser.userId });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: searchConditions,
      },
    });

    if (!user) {
      const userEmail = dto.email || reqUser?.email || `${id}@supabase.user`;
      const validRoles = Object.values(Role);
      const userRole =
        reqUser?.role && validRoles.includes(reqUser.role)
          ? reqUser.role
          : Role.MUSICIAN;

      return await this.prisma.user.create({
        data: {
          supabaseId: id,
          email: userEmail,
          name: dto.name || '',
          role: userRole,
          ...dto,
        },
      });
    }

    const updateData: Prisma.UserUpdateInput = { ...dto };
    if (reqUser?.userId && user.supabaseId !== reqUser.userId) {
      updateData.supabaseId = reqUser.userId;
    }

    return await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  async updateRole(id: string, role: Role) {
    const searchConditions: Prisma.UserWhereInput[] = [
      { id },
      { supabaseId: id },
      { email: id },
    ];

    const user = await this.prisma.user.findFirst({
      where: {
        OR: searchConditions,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return await this.prisma.user.update({
      where: { id: user.id },
      data: { role },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
