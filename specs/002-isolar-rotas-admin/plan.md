# Plan — 002: Isolar rotas de Admin

## Estrutura de destino

```
src/app/
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx        // guard: exige sessão
│   ├── dashboard/page.tsx
│   └── profile/page.tsx
└── (admin)/
    ├── layout.tsx        // guard: exige sessão E role === ADMIN
    └── admin/
        └── page.tsx       // (ou os arquivos que já existirem hoje em (dashboard)/admin)
```

## Guarda de acesso — `(admin)/layout.tsx`

Reaproveitar a mesma fonte de sessão/usuário já usada em `(dashboard)/layout.tsx` (provavelmente `AuthContext` ou uma função `getServerSession` equivalente — confirmar qual padrão o `(dashboard)/layout.tsx` atual usa e replicar, não inventar um novo).

Lógica:
1. Sem sessão → `redirect('/login')`.
2. Com sessão, `role !== 'ADMIN'` → `redirect('/dashboard')` (ou renderizar uma página de "acesso negado", se preferirem UX mais explícita — decidir isso é uma escolha de produto pequena, não técnica).
3. Com sessão e `role === 'ADMIN'` → renderiza normalmente.

## Passos técnicos

1. `git mv src/app/(dashboard)/admin src/app/(admin)/admin` (preserva histórico do arquivo no git, em vez de apagar e recriar).
2. Criar `src/app/(admin)/layout.tsx` com a guarda acima.
3. Buscar por links hardcoded (`href="/admin"` continua igual — Route Group não muda a URL — mas checar se algum código referencia o caminho de arquivo, não a URL).
4. Testar os 3 cenários do critério de sucesso manualmente (sem sessão / sessão não-admin / sessão admin).
5. Se houver teste automatizado de rota/guard no frontend-web, atualizar o caminho de import.

## Risco a observar

Como Route Group não muda a URL, é fácil pensar que "só mudar a pasta" é suficiente — o risco real está no guard, não na movimentação de arquivo. Não considerar a task concluída sem testar os 3 cenários de acesso manualmente.
