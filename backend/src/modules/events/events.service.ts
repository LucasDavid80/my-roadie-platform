import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  // Injeção de Dependência: o NestJS entrega o Prisma pronto para uso
  // constructor(private prisma: PrismaService) { }

  // async create(createEventDto: CreateEventDto) {
  //   return this.prisma.event.create({
  //     data: {
  //       title: createEventDto.title,
  //       date: new Date(createEventDto.date),
  //       location: createEventDto.location,
  //       description: createEventDto.description,
  //       status: 'PENDING',
  //       // Por enquanto, usaremos um ID fixo ou conectaremos a um usuário existente
  //       createdBy: {
  //         connect: { id: 'id-de-um-usuario-no-banco' }
  //       },
  //     },
  //   });
  // }

  // async findAll() {
  //   return this.prisma.event.findMany({
  //     include: { tasks: true }, // Já traz as tarefas vinculadas se houver
  //   });
  // }

  // async findOne(id: string) { // Alterado de number para string (UUID)
  //   return this.prisma.event.findUnique({
  //     where: { id },
  //     include: { tasks: true },
  //   });
  // }
}
