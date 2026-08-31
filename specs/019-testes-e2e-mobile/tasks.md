# Tasks — 019: Testes de Integração Ponta a Ponta (E2E) no Mobile

Pré-requisitos: specs 012, 014, 017 e 018 concluídas.

---

## Fase 0 — Diagnóstico, Setup de Ambiente e Mapeamento de Finders

- [x] T0.1 — Auditar `mobile/pubspec.yaml` para verificar a configuração do pacote `integration_test`, dependências de teste (`flutter_test`, `mocktail`) e compatibilidade com o SDK Flutter.
  - Critério: Mapeamento de dependências e configuração registrado no `spec.md`.
- [x] T0.2 — Mapear os widgets, formulários e botões nos 3 fluxos (`LoginPage`, `LoginForm`, `PersonScreen`, `NewAppointmentWidget`, `CommitmentCard`), identificando a necessidade de inclusão de chaves semânticas (`ValueKey`).
  - Critério: Tabela de mapeamento de finders e chaves semânticas documentada no `spec.md`.
- [x] T0.3 — Inspecionar a estrutura do job `mobile-e2e-emulator` em `.github/workflows/ci.yml` para planejar a integração da execução dos testes.
  - Critério: Diagnóstico registrado no `spec.md`.
- [x] T0.4 — Registrar os achados das tarefas T0.1, T0.2 e T0.3 na Seção "Resultados da Inspeção (Fase 0)" em `specs/019-testes-e2e-mobile/spec.md`.
  - Critério: Seção de inspeção em `spec.md` completamente preenchida.

---

## Fase 1 — Fundação & Helpers da Suíte de Integração E2E

- [x] T1.1 — Criar a estrutura de diretórios `mobile/integration_test/` e `mobile/integration_test/test_helpers/`.
  - Critério: Estrutura de pastas criada conforme o `plan.md`.
- [x] T1.2 — Implementar os helpers compartilhados:
  - `mobile/integration_test/test_helpers/e2e_binding.dart`: inicialização do binding e utilitários assíncronos (`pumpAndSettleWithTimeout`).
  - `mobile/integration_test/test_helpers/test_seed_data.dart`: sementes de dados determinísticos para usuários e eventos.
  - `mobile/integration_test/test_helpers/test_app_wrapper.dart`: wrapper raiz da aplicação com `ProviderScope` e `GoRouter`.
  - Critério: Helpers compilando e reutilizáveis nas suítes de teste.
- [x] T1.3 — Adicionar `ValueKey`s semânticas nos elementos principais de interação da UI (formulário de login, tela de perfil, botões da agenda e diálogo de exclusão) sem alterar layout ou funcionalidade.
  - Critério: Chaves semânticas presentes e acessíveis via `find.byKey(...)`.
- [ ] T1.4 — Executar `flutter analyze` na pasta `mobile/` e corrigir eventuais avisos de lint.
  - Critério: Análise estática com 0 erros e 0 warnings.

---

## Fase 2 — Suíte E2E do Fluxo de Autenticação (`auth_flow_test.dart`)

- [ ] T2.1 — Implementar o teste E2E de login com sucesso em `mobile/integration_test/auth_flow_test.dart`:
  - Abertura na rota `/login`, toque no banner, preenchimento de e-mail/senha válidos, submissão e validação de navegação para a `PrincipalScreen`.
  - Critério: Teste executa e valida a transição de tela com sucesso.
- [ ] T2.2 — Implementar o teste E2E de credenciais inválidas em `mobile/integration_test/auth_flow_test.dart`:
  - Submissão com dados incorretos e verificação de feedback visual de erro na UI.
  - Critério: Teste valida a permanência na tela de login e a presença do feedback de erro.
- [ ] T2.3 — Executar a suíte de autenticação localmente (`flutter test integration_test/auth_flow_test.dart`).
  - Critério: Suíte de autenticação aprovada com 100% de sucesso.
- [ ] T2.4 — Executar `flutter analyze` na pasta `mobile/`.
  - Critério: 0 erros e 0 warnings.

---

## Fase 3 — Suíte E2E do Fluxo de Perfil (`profile_flow_test.dart`)

- [ ] T3.1 — Implementar o teste E2E de navegação e inspeção de perfil em `mobile/integration_test/profile_flow_test.dart`:
  - Navegação da tela inicial para a tela de perfil via AppBar e validação dos campos preenchidos (Nome, Telefone, Cidade).
  - Critério: Teste valida o carregamento correto dos dados do perfil.
- [ ] T3.2 — Implementar o teste E2E de edição e salvamento de perfil:
  - Alteração de campo textual (Cidade/Telefone), clique no botão "Salvar Perfil", validação do SnackBar de sucesso e permanência do valor atualizado na UI.
  - Critério: Teste valida o fluxo completo de atualização com sucesso.
- [ ] T3.3 — Executar a suíte de perfil localmente (`flutter test integration_test/profile_flow_test.dart`).
  - Critério: Suíte de perfil aprovada com 100% de sucesso.
- [ ] T3.4 — Executar `flutter analyze` na pasta `mobile/`.
  - Critério: 0 erros e 0 warnings.

---

## Fase 4 — Suíte E2E do Ciclo Completo da Agenda (`agenda_flow_test.dart`)

- [ ] T4.1 — Implementar o teste E2E de criação de compromisso em `mobile/integration_test/agenda_flow_test.dart`:
  - Abertura do modal `NewAppointmentWidget`, preenchimento do formulário (título, tipo, horário, cachê, local), confirmação e validação do novo card na listagem.
  - Critério: Teste valida a inserção do `CommitmentCard` na lista.
- [ ] T4.2 — Implementar o teste E2E de edição de compromisso:
  - Clique no botão de editar no card, alteração de dados no modal, salvamento e verificação da atualização na listagem.
  - Critério: Teste valida a persistência visual das alterações no card.
- [ ] T4.3 — Implementar o teste E2E de exclusão de compromisso:
  - Clique no botão de deletar no card, confirmação no diálogo de exclusão e validação de que o card foi removido da lista.
  - Critério: Teste valida a remoção do card após confirmação.
- [ ] T4.4 — Criar o runner agregador `mobile/integration_test/app_test.dart` agrupando as três suítes (Auth, Perfil e Agenda).
  - Critério: Arquivo runner criado e estruturado.
- [ ] T4.5 — Executar a suíte agregada localmente (`flutter test integration_test/app_test.dart`).
  - Critério: Todos os cenários executam sequencialmente com 100% de aprovação.
- [ ] T4.6 — Executar `flutter analyze` na pasta `mobile/`.
  - Critério: 0 erros e 0 warnings.

---

## Fase 5 — Integração com o Pipeline CI/CD (`mobile-e2e-emulator`)

- [ ] T5.1 — Atualizar o job `mobile-e2e-emulator` em `.github/workflows/ci.yml` para executar `flutter test integration_test/app_test.dart` quando `run_mobile_e2e: true`.
  - Critério: Job configurado e conectado à suíte oficial de integração.
- [ ] T5.2 — Validar a formatação e a sintaxe do arquivo `.github/workflows/ci.yml`.
  - Critério: Workflow YAML válido.

---

## Fase 6 — Checklist de Fechamento da Feature (Fechamento Atômico)

- [ ] `spec.md`, `plan.md` e `tasks.md` da spec 019 alinhados e sem pendências
- [ ] Suíte E2E de Autenticação (`auth_flow_test.dart`) implementada e aprovada
- [ ] Suíte E2E de Perfil (`profile_flow_test.dart`) implementada e aprovada
- [ ] Suíte E2E de Agenda (`agenda_flow_test.dart`) implementada e aprovada
- [ ] Runner agregador (`app_test.dart`) executando os 3 fluxos com 100% de aprovação
- [ ] Job `mobile-e2e-emulator` no `.github/workflows/ci.yml` configurado e funcional
- [ ] Análise estática (`flutter analyze`) com 0 erros e 0 warnings
- [ ] Entrada em `backlog.md` atualizada para "concluído (specs/019-testes-e2e-mobile/)"
- [ ] Critérios de Sucesso no `spec.md` marcados atomicamente juntos com este checklist
