import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário com um ID gerado', async () => {
      const dto = { email: 'lucas@myroadie.br', name: 'Lucas', role: 'ROADIE' as const };
      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(dto.email);
      expect(typeof result.id).toBe('string');
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se o ID existir', async () => {
      const dto = { email: 'teste@myroadie.br', name: 'Teste' };
      const created = await service.create(dto);

      const found = await service.findOne(created.id);
      expect(found).toEqual(created);
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      // A forma correta para métodos async:
      // Note que passamos uma função que chama o service, não o resultado da chamada.
      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar os dados de um usuário existente', async () => {
      const created = await service.create({ email: 'velho@myroadie.br', name: 'Antigo' });
      const updateDto = { name: 'Novo Nome' };

      const updated = await service.update(created.id, updateDto);

      expect(updated.name).toBe('Novo Nome');
      expect(updated.email).toBe('velho@myroadie.br'); // O email deve permanecer o mesmo
    });

    it('deve lançar NotFoundException ao tentar atualizar usuário inexistente', async () => {
      await expect(service.update('id-falso', { name: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um usuário e retorná-lo', async () => {
      const created = await service.create({ email: 'delete@myroadie.br', name: 'Para Deletar' });
      const removed = await service.remove(created.id);

      expect(removed.id).toBe(created.id);
      // Verifica se realmente saiu do array
      await expect(service.findOne(created.id)).rejects.toThrow(NotFoundException);
    });
  });
});
