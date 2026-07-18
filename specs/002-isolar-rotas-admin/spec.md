# Spec — 002: Isolar rotas de Admin em Route Group próprio

## Objetivo

Separar as páginas de admin do Route Group `(dashboard)`, dando a elas seu próprio Route Group `(admin)` com guarda de acesso específica (sessão + `role === ADMIN`), conforme `constitution.md` §9.

## Por quê

Hoje `admin` está aninhado dentro de `(dashboard)`, que só garante "tem sessão", não "é admin". Qualquer página nova colocada ali por engano herda apenas o guard de sessão — não o de papel. Isolar o Route Group torna a checagem de papel estrutural (impossível esquecer), não uma checagem manual espalhada por página.

## Escopo

- Mover as páginas hoje em `src/app/(dashboard)/admin/**` para `src/app/(admin)/**`.
- Criar `src/app/(admin)/layout.tsx` com guarda própria: redireciona para `/login` se não houver sessão, e para `/dashboard` (ou uma página de "acesso negado") se a sessão existir mas `role !== ADMIN`.
- Atualizar links/navegação que apontem para as rotas antigas de admin.

## Fora de escopo

- Qualquer funcionalidade nova de admin (isso é feature separada).
- Mudar o conteúdo das páginas de admin — só a localização e a guarda.
- Mexer no `(dashboard)` ou `(auth)` além do necessário para remover a pasta `admin` de dentro do primeiro.

## Critério de sucesso

- [ ] `src/app/(admin)/` existe com layout próprio e guarda de papel.
- [ ] `src/app/(dashboard)/admin/` não existe mais.
- [ ] Acessar uma rota admin sem sessão → redireciona para `/login`.
- [ ] Acessar uma rota admin logado como `MUSICIAN`/`ROADIE` → não entra (redirect ou 403).
- [ ] Acessar uma rota admin logado como `ADMIN` → funciona normalmente.
- [ ] URLs finais continuam as mesmas (Route Group não aparece na URL — conferir que nada quebrou por causa disso).
