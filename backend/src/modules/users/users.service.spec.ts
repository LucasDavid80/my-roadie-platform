import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'uuid-123',
    email: 'lucas@myroadie.br',
    name: 'Lucas',
    role: Role.ROADIE,
    supabaseId: 'supabase-id-123',
    isAvailable: true,
    instruments: [],
    styles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue(mockUser),
              findUnique: jest.fn().mockResolvedValue(mockUser),
              findFirst: jest.fn().mockResolvedValue(mockUser),
              findMany: jest.fn().mockResolvedValue([mockUser]),
              update: jest.fn().mockResolvedValue(mockUser),
              delete: jest.fn().mockResolvedValue(mockUser),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const dto = {
        email: 'lucas@myroadie.br',
        name: 'Lucas',
        role: Role.ROADIE,
        supabaseId: 'supabase-id-123',
      };
      const result = await service.createUser(dto);

      expect(() => prisma.user.create).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe(dto.email);
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de usuários', async () => {
      const users = await service.findAll();
      expect(users).toEqual([mockUser]);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('deve buscar um usuário pelo email', async () => {
      const user = await service.findByEmail('lucas@myroadie.br');
      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'lucas@myroadie.br' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se o ID existir', async () => {
      const found = await service.findOne('uuid-123');
      expect(found).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar os dados de um usuário existente', async () => {
      const updateDto = { name: 'Novo Nome' };
      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ ...mockUser, name: 'Novo Nome' });

      const updated = await service.update('uuid-123', updateDto);

      expect(updated.name).toBe('Novo Nome');
    });
  });

  describe('updateRole', () => {
    it('deve atualizar o papel do usuário', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);
      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ ...mockUser, role: Role.ADMIN });

      const updated = await service.updateRole('uuid-123', Role.ADMIN);

      expect(updated.role).toBe(Role.ADMIN);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { role: Role.ADMIN },
      });
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(
        service.updateRole('id-inexistente', Role.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um usuário', async () => {
      const removed = await service.remove('uuid-123');
      expect(removed.id).toBe(mockUser.id);
      expect(() => prisma.user.delete).toBeDefined();
      expect(prisma.user.delete).toHaveBeenCalled();
    });
  });
});
