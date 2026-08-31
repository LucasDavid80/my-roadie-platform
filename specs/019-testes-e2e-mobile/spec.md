# Spec — 019: Testes de Integração Ponta a Ponta (E2E) no Mobile

## Objetivo

Implementar uma suíte completa de **Testes de Integração Ponta a Ponta (E2E)** para o aplicativo mobile utilizando o pacote oficial `integration_test` do Flutter, cobrindo os três fluxos centrais da aplicação em ambiente real/emulador:
1. **Fluxo de Autenticação**: Login com credenciais válidas, feedback visual de erro com credenciais inválidas e transição de estado da sessão.
2. **Fluxo de Perfil**: Navegação até a tela de perfil (`PersonScreen`), carregamento dos dados do usuário, edição de informações (dados textuais, instrumentos, estilos) e confirmação de salvamento.
3. **Ciclo Completo da Agenda**: Criação de novo compromisso via modal (`NewAppointmentWidget`), verificação de renderização do card (`CommitmentCard`), edição de dados do compromisso existente e exclusão com diálogo de confirmação.

Além disso, esta spec conecta a execução dos testes ao job `mobile-e2e-emulator` já estruturado no pipeline de CI/CD ([`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml)), acionado sob demanda via `workflow_dispatch` (`run_mobile_e2e: true`).

---

## Por quê (Justificativa e Contexto)

- **Garantia de Não-Regressão em Fluxos Críticos Mobile**: O aplicativo mobile é a principal interface dos músicos e roadies em campo. Após a entrega das correções de autenticação (specs 008, 009, 010, 012), estabilização de criação de compromissos no dispositivo físico (spec 014), extensão do modelo de eventos (spec 015) e distribuição de releases do MVP (specs 016, 017, 018), torna-se indispensável garantir que futuras alterações de código não quebrem a jornada completa do usuário.
- **Diferencial entre Testes de Widget e Testes E2E com `integration_test`**: Embora o projeto já possua testes unitários e de widget isolados (`flutter test`), os testes de integração com `integration_test` executam o app completo com o binding `IntegrationTestWidgetsFlutterBinding`, testando a comunicação real entre widgets, controladores do Riverpod, GoRouter, renderização de bottom sheets, animações e chamadas de rede de ponta a ponta.
- **Ativação Segura e Otimizada no CI/CD**: A execução de testes com emulador mobile consome minutos significativos de runner macOS. O gatilho condicional `run_mobile_e2e` configurado na Spec 017 no GitHub Actions permite validar os testes E2E antes de lançamentos de versão ou sob demanda, sem onerar a cota de minutos nos PRs de desenvolvimento rotineiro.
- **Conformidade com a Constituição (`constitution.md` §5)**: Reforça o padrão mínimo de qualidade e cobertura por fluxo crítico da aplicação com casos de sucesso e de borda/erro bem definidos.

---

## Resultados da Inspeção (Fase 0)

*(Esta seção será preenchida com os dados técnicos coletados durante a execução da Fase 0 das tasks)*

### 1. Diagnóstico do Pacote `integration_test` e Dependências (`mobile/pubspec.yaml`) — Task T0.1
- **Status:** *A ser documentado na Fase 0*

### 2. Mapeamento de Finders, Chaves (`Key`s) e Semântica de UI nos 3 Fluxos — Task T0.2
- **Status:** *A ser documentado na Fase 0*

### 3. Diagnóstico da Estrutura de Execução no CI/CD (`.github/workflows/ci.yml`) — Task T0.3
- **Status:** *A ser documentado na Fase 0*

---

## Escopo

1. **Estruturação da Suíte E2E (`mobile/integration_test/`)**:
   - Criação da pasta `mobile/integration_test/` com runners e helpers dedicados.
   - Configuração de `IntegrationTestWidgetsFlutterBinding.ensureInitialized()`.
   - Criação de helpers para montagem do app (`test_app_wrapper.dart`), sementes de dados (`test_seed_data.dart`) e utilitários de espera e interação segura com UI (`e2e_binding.dart`).
   - Adição de `Key`s semânticas (`ValueKey`) em campos de formulário, botões de ação, cards e diálogos para garantir seletores estáveis e desacoplados de texto.

2. **Fluxo 1 — Autenticação (`auth_flow_test.dart`)**:
   - **Caso Positivo**: Abertura do app em `/login`, clique em "Toque para entrar", preenchimento de e-mail e senha válidos, toque em "ENTRAR", validação de navegação para a tela inicial (`PrincipalScreen` em `/`) e presença dos elementos do cabeçalho.
   - **Caso Negativo**: Submissão de credenciais inválidas, verificação de mensagem de erro/feedback visual na UI (sem travamento ou tela preta) e permanência na tela de login.

3. **Fluxo 2 — Visualização e Edição de Perfil (`profile_flow_test.dart`)**:
   - Navegação a partir da tela inicial (`PrincipalScreen`) para a tela de perfil (`PersonScreen` em `/profile`) via toque no ícone de perfil da `MyRoadieAppBar`.
   - Validação de carregamento dos dados do usuário (nome, telefone, cidade/UF, instrumentos, estilos).
   - Edição de campos textuais (ex.: alteração de cidade ou telefone).
   - Clique em "Salvar Perfil", validação do feedback (`SnackBar` "Perfil salvo com sucesso!") e verificação da persistência dos novos valores na interface.

4. **Fluxo 3 — Ciclo Completo da Agenda (`agenda_flow_test.dart`)**:
   - **Criação**: Abertura do formulário de novo compromisso (`NewAppointmentWidget`), preenchimento de título, tipo, data/horário, cachê e local, submissão e validação do novo `CommitmentCard` inserido na lista da agenda.
   - **Visualização**: Verificação da exibição correta dos detalhes do evento criado (horários, valor formatado, tag de tipo).
   - **Edição**: Clique no botão de edição (`Icons.edit_outlined`) no card, alteração de campos do compromisso e confirmação da atualização na listagem.
   - **Exclusão**: Clique no botão de exclusão (`Icons.delete_outline`) no card, confirmação no diálogo de exclusão e validação de que o card foi removido da lista de compromissos.

5. **Runner Agregador (`app_test.dart`)**:
   - Criação de um runner unificado que permite disparar a suíte completa de testes sequencialmente com um único comando (`flutter test integration_test/app_test.dart`).

6. **Plugar Cenários no CI/CD (`.github/workflows/ci.yml`)**:
   - Atualizar o job `mobile-e2e-emulator` para executar os testes da pasta `integration_test/` quando o input `run_mobile_e2e: true` for fornecido no `workflow_dispatch`.

---

## Fora de Escopo

- Testes E2E em dispositivos físicos iOS através de serviços externos pagos (AWS Device Farm, Firebase Test Lab comercial).
- Cenários de falha extrema de infraestrutura / perda abrupta de conexão no meio da digitação (o suporte offline-first está categorizado como feature futura na Fase 3 do `backlog.md`).
- Automação de upload ou publicação nas lojas comerciais (Google Play Store e Apple App Store) via Fastlane.
- Fluxo de recuperação de senha por e-mail ("Esqueci minha senha") no app mobile.

---

## Critérios de Sucesso

- [ ] Pacote `integration_test` configurado e operacional no ecossistema mobile.
- [ ] Chaves semânticas (`ValueKey`) adicionadas aos elementos-chave das telas de login, perfil e agenda sem alterar o design ou a experiência visual.
- [ ] Suíte E2E de Autenticação (`auth_flow_test.dart`) cobrindo login com sucesso e tratamento de credenciais inválidas.
- [ ] Suíte E2E de Perfil (`profile_flow_test.dart`) cobrindo navegação, visualização de dados, edição e salvamento com feedback de SnackBar.
- [ ] Suíte E2E de Agenda (`agenda_flow_test.dart`) cobrindo ciclo completo de CRUD (criação de evento, verificação de listagem, edição e exclusão confirmada).
- [ ] Runner agregador `app_test.dart` executando todos os fluxos sequencialmente com 100% de aprovação.
- [ ] Job `mobile-e2e-emulator` no `.github/workflows/ci.yml` configurado para rodar a suíte `integration_test/` quando `run_mobile_e2e: true`.
- [ ] Análise estática (`flutter analyze`) passando com 0 warnings/erros.
- [ ] Checklist de fechamento em `tasks.md` e Critérios de Sucesso em `spec.md` marcados atomicamente juntos na conclusão da spec.
