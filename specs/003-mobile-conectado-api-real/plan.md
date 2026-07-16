# Plan — 003: Conectar Mobile à API real

## Diagnóstico antes de codar

Antes da Fase 1, revisar o que já existe em `remote_datasource.dart` / `main.dart` / `user_controller` (trabalho pré-existente, não gerado por esta spec) e confirmar:
1. Usa a URL base do backend via variável de ambiente/config, não hardcoded.
2. Trata erro de rede e resposta não-2xx de forma explícita (não deixa exception estourar direto na UI).
3. Segue a interface já definida em `domain/interfaces/i_auth_repository.dart` e `i_user_repository.dart`, em vez de acoplar direto ao datasource na tela.

Se algum desses três pontos falhar, ajustar antes de continuar (isso é a T0.3 do `tasks.md`).

## Datasource remoto

- Base URL do backend vinda de config (ex.: `--dart-define` ou arquivo de config por ambiente), nunca hardcoded no código.
- Autenticação: reaproveitar o token de sessão já obtido no fluxo de login (Supabase) — o `remote_datasource` não deve gerenciar login por conta própria, só anexar o token nas chamadas.
- Tratamento de erro: mapear respostas HTTP para exceptions de domínio (ex.: `UnauthorizedException`, `NetworkException`), não deixar o erro cru do `http`/`dio` vazar pra camada de `presentation`.

## Repository

- `agenda_repository_impl.dart` implementa a interface de domínio (`domain/interfaces/`), delegando pro `remote_datasource` (e, se fizer sentido, pro `local_datasource` como cache/fallback offline — decidir se isso entra nesta spec ou fica pra depois; se ficar de fora, documentar explicitamente como "fora de escopo" no `spec.md`).

## Conectar telas

- Trocar a fonte de dados mockada por injeção do repository real (via `Provider`/`Riverpod`/o padrão de state management já usado no mobile — confirmar qual é, em vez de presumir).
- Não alterar o design/UX das telas nesta spec — só a fonte de dados.

## Testes

- Fase 0 primeiro: sem `flutter test` verde, nenhuma fase seguinte é considerada segura pra construir em cima.
- Cada datasource/repository novo segue `constitution.md` §5: 1 caso positivo + 1 negativo mínimo.

## Risco a observar

O maior risco aqui não é técnico, é de escopo: como já tem código pré-existente fora de uma spec formal, é fácil "só terminar o que já tá começado" sem revisar se está no padrão certo. Por isso a Fase 0 existe — trata o código existente como PR de outra pessoa, revisa antes de continuar.
