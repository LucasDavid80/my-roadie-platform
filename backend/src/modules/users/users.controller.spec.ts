import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Criamos um "mock" do Service para não depender da lógica real dele
  const mockUsersService = {
    create: jest.fn((dto) => ({ id: '1', ...dto })),
    findAll: jest.fn(() => [{ id: '1', email: 'teste@myroadie.br' }]),
    findOne: jest.fn((id) => ({ id, email: 'teste@myroadie.br' })),
    update: jest.fn((id, dto) => ({ id, ...dto })),
    remove: jest.fn((id) => ({ id, email: 'teste@myroadie.br' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o método create do service com os dados corretos', async () => {
      const dto: CreateUserDto = { email: 'lucas@myroadie.br', name: 'Lucas' };

      const result = await controller.create(dto);

      // Verifica se o controller realmente acionou o service
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário chamando o service com o ID correto', async () => {
      const id = 'abc-123';
      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result.id).toBe(id);
    });

    // TESTE DE CENÁRIO NEGATIVO: quando o usuário não for encontrado
    it('deve repassar a exceção quando o usuário não for encontrado', async () => {
      const id = 'id-inexistente';

      // Aqui forçamos o Mock a lançar um erro, simulando o comportamento do Service real
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());

      // O teste espera que o Controller também lance (rejeite) o mesmo erro
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve chamar o update do service com ID e DTO corretos', async () => {
      const id = '1';
      const dto = { name: 'Novo Nome' };
      await controller.update(id, dto);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });

    // TESTE DE CENÁRIO NEGATIVO: quando o Service falhar na atualização
    it('deve lançar erro se o Service falhar na atualização', async () => {
      const id = '1';
      const dto = { name: 'Teste' };

      jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Erro de Banco'));

      await expect(controller.update(id, dto)).rejects.toThrow('Erro de Banco');
    });
  });

  describe('remove', () => {
    it('deve chamar o remove do service com o ID correto', async () => {
      const id = '1';
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
