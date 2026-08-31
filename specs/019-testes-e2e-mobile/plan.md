# Plan — 019: Testes de Integração Ponta a Ponta (E2E) no Mobile

## 1. Visão Geral da Solução Técnica

Esta especificação define o plano técnico para implementar a suíte de **Testes de Integração Ponta a Ponta (E2E)** no aplicativo mobile (`mobile/`) utilizando o pacote oficial `integration_test` do Flutter SDK. 

O objetivo é automatizar a validação dos 3 fluxos centrais da aplicação:
1. **Autenticação e Login** (`auth_flow_test.dart`)
2. **Visualização e Edição de Perfil** (`profile_flow_test.dart`)
3. **Ciclo Completo da Agenda** — Criação, visualização, edição e exclusão de compromissos (`agenda_flow_test.dart`)

Adicionalmente, os testes serão conectados ao job `mobile-e2e-emulator` existente em [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml), permitindo execuções sob demanda via `workflow_dispatch` sem custos indesejados de CI em PRs rotineiros.

---

## 2. Arquitetura e Estrutura dos Testes E2E (`integration_test`)

### 2.1 Estrutura de Pastas e Arquivos

A suíte será alocada no diretório padrão recomendado pelo Flutter para testes de integração (`mobile/integration_test/`):

```
mobile/
├── integration_test/
│   ├── app_test.dart                     # Runner agregador para execução sequencial de todas as suítes
│   ├── auth_flow_test.dart               # Suíte E2E: Autenticação (Login com sucesso e falha)
│   ├── profile_flow_test.dart            # Suíte E2E: Perfil (Carregamento, edição e persistência)
│   ├── agenda_flow_test.dart             # Suíte E2E: Agenda (CRUD completo de compromissos)
│   └── test_helpers/
│       ├── e2e_binding.dart              # Inicialização do binding e utilitários de espera assíncrona
│       ├── test_seed_data.dart           # Sementes e constantes de dados determinísticos
│       └── test_app_wrapper.dart         # Wrapper configurável da aplicação com ProviderScope e GoRouter
```

### 2.2 Helpers e Utilitários de Suporte

1. **`e2e_binding.dart`**:
   - Inicializa `IntegrationTestWidgetsFlutterBinding.ensureInitialized()`.
   - Provê métodos auxiliares de espera resilientes a animações e transições de tela (`pumpAndSettleWithTimeout`, `pumpUntilFound`), evitando *flaky tests* decorrentes de latência de renderização ou transições do GoRouter.
2. **`test_seed_data.dart`**:
   - Centraliza constantes de teste determinísticas: usuário de teste (`musico.e2e@myroadie.br`), dados de perfil (instrumentos, estilos, contato) e eventos de agenda (shows e ensaios com horários e cachê definidos).
3. **`test_app_wrapper.dart`**:
   - Cria o widget raiz da aplicação encapsulado com `ProviderScope` e `MaterialApp.router`.
   - Permite instanciar a aplicação em modo real conectado à API/Supabase ou com repositórios parametrizados para execução hermética e ultra-rápida no CI.

### 2.3 Identificação Semântica e Chaves (`ValueKey`)

Para garantir que os testes E2E sejam estáveis e desacoplados de alterações cosméticas de texto na UI, serão adicionadas `ValueKey`s semânticas nos elementos de interação primária:

- **Login**:
  - `login_email_field`: Campo de texto de e-mail.
  - `login_password_field`: Campo de texto de senha.
  - `login_submit_button`: Botão "ENTRAR".
  - `login_error_message`: Container/texto de feedback de erro.
- **Perfil**:
  - `profile_appbar_button`: Ícone de perfil na AppBar.
  - `profile_city_field`: Campo de cidade.
  - `profile_phone_field`: Campo de telefone.
  - `profile_save_button`: Botão "Salvar Perfil".
- **Agenda**:
  - `agenda_add_button`: Botão para abrir modal de novo compromisso.
  - `appointment_title_field`: Campo de título do evento.
  - `appointment_type_dropdown`: Seletor de tipo (Show/Ensaio).
  - `appointment_fee_field`: Campo de cachê.
  - `appointment_location_field`: Campo de local.
  - `appointment_confirm_button`: Botão de confirmar criação/edição.
  - `commitment_card_<id>` ou `commitment_card_item`: Card de compromisso na lista.
  - `commitment_card_edit_button`: Botão de editar compromisso.
  - `commitment_card_delete_button`: Botão de deletar compromisso.
  - `dialog_confirm_delete_button`: Botão de confirmação no diálogo de exclusão.

---

## 3. Mapeamento e Detalhamento dos Fluxos E2E

### 3.1 Fluxo 1 — Autenticação (`auth_flow_test.dart`)

- **Cenário 1 (Positivo — Login com Sucesso)**:
  1. App inicializa na rota `/login`.
  2. Teste toca no banner interativo "Toque para entrar" para abrir o formulário.
  3. Preenche e-mail (`musico.e2e@myroadie.br`) e senha (`123456`).
  4. Clica em "ENTRAR".
  5. Aguarda `pumpAndSettle()`.
  6. Valida que a rota navegou para `/` e que a `PrincipalScreen` (com o cabeçalho e calendário) está renderizada na tela.
- **Cenário 2 (Negativo — Credenciais Inválidas)**:
  1. App inicializa na rota `/login`.
  2. Toca para abrir formulário e preenche credenciais incorretas (`invalido@teste.com` / `senha_errada`).
  3. Clica em "ENTRAR".
  4. Valida que a aplicação permanece em `/login` e exibe o feedback visual de erro sem travamento.

### 3.2 Fluxo 2 — Visualização e Edição de Perfil (`profile_flow_test.dart`)

- **Cenário 1 (Navegação, Inspeção e Edição com Sucesso)**:
  1. Usuário autenticado na tela inicial (`PrincipalScreen`).
  2. Toca no ícone de perfil na AppBar (`profile_appbar_button`).
  3. Valida navegação para a rota `/profile` e renderização da `PersonScreen`.
  4. Inspeciona a presença de pelo menos 3 campos preenchidos (Nome, Telefone, Cidade).
  5. Altera o campo Cidade para `"Campinas"` e/ou Telefone para `"11999998888"`.
  6. Rola até o botão "Salvar Perfil" (`profile_save_button`) e clica.
  7. Valida a exibição do `SnackBar` com a mensagem `"Perfil salvo com sucesso!"`.
  8. Valida que o novo valor (`"Campinas"`) permanece renderizado e visível na tela.

### 3.3 Fluxo 3 — Ciclo Completo da Agenda (`agenda_flow_test.dart`)

- **Cenário 1 (Criação de Compromisso)**:
  1. Na tela principal (`PrincipalScreen`), toca no botão de adicionar compromisso (`agenda_add_button`).
  2. Valida a abertura do modal `NewAppointmentWidget`.
  3. Preenche os campos:
     - Título: `"Show E2E no Festival"`.
     - Tipo: `"Show"`.
     - Cachê: `"3500,00"`.
     - Local: `"Auditório Ibirapuera"`.
  4. Clica em "Confirmar / Adicionar".
  5. Valida que o modal fecha e o novo `CommitmentCard` com o título `"Show E2E no Festival"` aparece listado na agenda.
- **Cenário 2 (Edição de Compromisso)**:
  1. Localiza o `CommitmentCard` criado e clica no botão de edição (`commitment_card_edit_button`).
  2. Valida reabertura do modal com os dados preenchidos.
  3. Altera o título para `"Show E2E no Festival - Confirmado"` e o cachê para `"4000,00"`.
  4. Clica em salvar/confirmar.
  5. Valida que o card na lista atualiza o texto para `"Show E2E no Festival - Confirmado"`.
- **Cenário 3 (Exclusão de Compromisso)**:
  1. Clica no botão de exclusão (`commitment_card_delete_button`) do card.
  2. Valida que o diálogo de confirmação de exclusão é exibido.
  3. Clica em "Excluir" no diálogo (`dialog_confirm_delete_button`).
  4. Valida que o diálogo fecha e o card não está mais presente na listagem da agenda.

---

## 4. Estratégia de Dados de Teste & Isolamento de Ambiente

Para garantir a confiabilidade dos testes e evitar dependências de dados voláteis ou poluição do banco de produção:

1. **Dados Determinísticos & Usuário de Teste**:
   - Conta dedicada de testes (`musico.e2e@myroadie.br`) com permissão `MUSICIAN`.
   - IDs fixos e dados bem formatados gerenciados via `test_seed_data.dart`.
2. **Execução Dupla (Hermética / Real)**:
   - **Modo Hermético (Padrão para CI Rápido e Local)**: O `test_app_wrapper.dart` fornece implementações em memória e controladas dos repositórios (`IAuthRepository`, `IUserRepository`, `IAgendaRepository`), garantindo testes 100% determinísticos, sem dependência de latência de rede externa.
   - **Modo Real (Homologação / Emulador)**: Permite executar os testes apontando para a instância de teste do backend e Supabase Auth via `--dart-define=BACKEND_URL=...` e chaves de teste.

---

## 5. Integração com o Pipeline CI/CD (`.github/workflows/ci.yml`)

### 5.1 Conexão ao Job `mobile-e2e-emulator`

O workflow [`.github/workflows/ci.yml`](file:///C:/dev/my-roadie-platform/.github/workflows/ci.yml) já possui o gatilho `run_mobile_e2e` estruturado. A integração consistirá em:

1. Atualizar o nome do job e remover o placeholder existente.
2. Configurar a execução dos testes `integration_test/` através do comando do Flutter:
   ```yaml
   mobile-e2e-emulator:
     name: Mobile E2E Emulator (Spec 019)
     needs: mobile-test
     if: github.event.inputs.run_mobile_e2e == 'true' || inputs.run_mobile_e2e == true
     runs-on: macos-latest
     defaults:
       run:
         working-directory: ./mobile
     steps:
       - uses: actions/checkout@v4
       - uses: subosito/flutter-action@v2
         with:
           channel: 'stable'
           cache: true
       - run: flutter pub get
       - name: Executar Suíte de Testes E2E Mobile
         run: flutter test integration_test/app_test.dart
   ```
3. O job permanece condicionado à flag `run_mobile_e2e: true`, preservando o consumo de minutos do GitHub Actions.

---

## 6. Análise de Conformidade com a Constitution

- **Stack Fixa (`constitution.md` §1)**: Utiliza estritamente Flutter, Dart, Riverpod e o pacote `integration_test` nativo do SDK.
- **Arquitetura Modular (`constitution.md` §2)**: Respeita a Clean Architecture (separação em domain, data e presentation) sem criar acoplamentos indevidos.
- **Qualidade e Testes (`constitution.md` §5)**: Garante cobertura completa de fluxos críticos de ponta a ponta com asserções positivas e negativas.
- **Fechamento Atômico (`AGENTS.md`)**: Garante que ao finalizar a implementação, o checklist de `tasks.md` e os critérios de sucesso de `spec.md` sejam marcados juntos.
