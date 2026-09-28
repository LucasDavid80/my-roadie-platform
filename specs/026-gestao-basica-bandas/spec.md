# Spec — 026: Gestão Básica de Bandas e Múltiplos Workspaces

## 1. Objetivo

Permitir que músicos e roadies criem e mantenham múltiplas bandas ou projetos musicais dentro da mesma conta, alternando entre esses workspaces no Web e no Mobile. A pessoa que criar uma banda será associada automaticamente como `OWNER` em `BandMember`.

A entrega deve estabelecer a base colaborativa para que eventos, tarefas, repertório e transações sejam consultados e administrados no contexto da banda ativa, sem misturar dados de projetos diferentes.

## 2. Por quê

O modelo atual já possui `Band` e `BandMember`, mas a experiência de gestão de bandas ainda não está disponível como fluxo completo para o usuário. Isso limita músicos que participam de mais de um projeto e mantém a seleção de workspace implícita ou dependente de dados pré-existentes.

Esta spec é a fundação das próximas features de colaboração, convites e notificações previstas no Release v1.3.0. Ela também deve preservar a autorização por associação à banda estabelecida na Spec 011 e evitar que a troca de workspace altere permissões ou exponha dados de outra banda.

## 3. Escopo

1. Expor no backend operações autenticadas para listar as bandas do usuário, criar uma banda com associação automática como `OWNER`, editar o nome de uma banda e excluir uma banda conforme as regras de autorização.
2. Definir o contrato de membro e a regra de ownership para bandas criadas pelo usuário.
3. Disponibilizar no Web e no Mobile uma seleção de workspace ativo e uma interface mínima para criar e gerenciar bandas.
4. Garantir que a seleção do workspace ativo seja refletida nas consultas e criações de recursos que dependem de `bandId`.
5. Cobrir casos de sucesso, validação, ausência de associação e tentativa de acesso indevido com testes automatizados.

## 4. Fora de Escopo

- Convites por `@username`, links ou códigos compartilháveis.
- Busca pública ou identidade global por `@username`.
- Push notifications ou notificações de alterações da equipe.
- Transferência de ownership, múltiplos owners ou papéis avançados além de `OWNER` e membro.
- Dashboard administrativo e moderação global de bandas.
- Migração de dados históricos para criar novas bandas.

## 5. Critérios de Sucesso

- [ ] Um usuário autenticado consegue listar somente as bandas das quais é membro.
- [ ] A criação de uma banda válida cria a `Band` e uma `BandMember` do criador com papel `OWNER` em uma operação consistente.
- [ ] Somente o `OWNER` da banda ou um `ADMIN` consegue editar ou excluir a banda; usuários não associados recebem resposta de autorização adequada.
- [ ] Web e Mobile conseguem selecionar uma banda ativa e manter o contexto durante a navegação da sessão.
- [ ] Recursos dependentes de banda usam o workspace ativo sem misturar dados entre bandas.
- [ ] Backend, Web e Mobile possuem testes cobrindo sucesso e erro/borda, mantendo o piso de cobertura de 80% aplicável.
