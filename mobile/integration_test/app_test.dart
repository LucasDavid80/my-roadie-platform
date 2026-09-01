import 'agenda_flow_test.dart' as agenda_flow;
import 'auth_flow_test.dart' as auth_flow;
import 'profile_flow_test.dart' as profile_flow;
import 'test_helpers/e2e_binding.dart';

/// Runner agregador oficial para a suíte completa de Testes de Integração Ponta a Ponta (E2E) no Mobile.
/// Executa sequencialmente os 3 fluxos críticos da aplicação:
/// 1. Autenticação (Login com sucesso e tratamento de erro)
/// 2. Perfil (Inspeção, edição e persistência de dados)
/// 3. Agenda (Ciclo completo de CRUD de compromissos)
void main() {
  E2EBindingHelper.ensureInitialized();

  // Execução sequencial dos fluxos E2E
  auth_flow.main();
  profile_flow.main();
  agenda_flow.main();
}
