import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@myroadie.com'; // Altere se desejar
  const name = 'Admin Inicial';
  const supabaseId =
    'admin-manual-id-' + Math.random().toString(36).substring(7);

  console.log(`Verificando se o usuário ${email} já existe...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
    },
    create: {
      email,
      name,
      supabaseId,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Usuário ADMIN configurado com sucesso:');
  console.table({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    supabaseId: user.supabaseId,
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
