# Spec — 009: Correção de erro de tela vermelha na área de usuários/perfil

## Objetivo

Garantir a estabilidade da navegação e renderização da tela de perfil de usuário (`PersonScreen`) no aplicativo móvel (`mobile`), eliminando a tela vermelha de erro (*Red Screen of Death* / exceção *unhandled*) disparada ao acessar a rota `/profile` ou ao clicar na aba de perfil.

## Motivação

Atualmente, ao tentar acessar a área de perfil no aplicativo móvel, a aplicação enfrenta uma falha de renderização que trava a interface do usuário com a tela vermelha de exceção do Flutter. Essa falha impede o usuário de visualizar, atualizar ou salvar suas informações de perfil profissional (como instrumentos, estilos musicais, dados de contato e cachê mínimo). Garantir o acesso estável a essa tela é crítico para a usabilidade e funcionamento do app.

## Escopo

- Corrigir os problemas de renderização nos widgets da tela de perfil (`PersonScreen`, `PhotoWidget`, `InfoWidget`, `MultiSelectionWidget` e `AvailabilityWidget`).
- Garantir a inicialização imutável e segura de todos os campos da entidade `UserEntity` no gerenciador de estado (`UserNotifier` / `userProvider` via Riverpod).
- Garantir que campos nulos ou falhas de parse de dados não interrompam a renderização da interface nem disparem exceções *unhandled*.
- Tratar falhas de comunicação com a API remota no carregamento (`fetchProfile`) e salvamento (`saveProfile`) do perfil com mensagens amigáveis de feedback em tela.
- Implementar testes de widget no Flutter (`flutter test`) em `mobile/test/presentation/screens/person_screen_test.dart` para validar a renderização sem erros.

## Fora de Escopo

- Alterações na tela de perfil do painel Web (`frontend-web`).
- Alterações nos endpoints de perfil na API do backend NestJS.
- Adição de novos campos de formulário que não existam atualmente na entidade `UserEntity`.

## Critérios de Sucesso

- [ ] **Navegação**: Clicar no ícone de perfil na barra superior (`MyRoadieAppBar`) ou navegar para a rota `/profile` carrega a tela `PersonScreen` instantaneamente sem tela vermelha ou erro no console.
- [ ] **Renderização**: Todos os campos do perfil (nome, experiência, telefone, Instagram, cidade, UF, cachê mínimo, instrumentos, estilos e disponibilidade) renderizam seus valores padrão/iniciais de forma segura.
- [ ] **Persistência**: Alterar os dados e clicar em "Salvar Perfil" atualiza o estado sem disparar exceções não tratadas e exibe a mensagem de confirmação (*SnackBar*).
- [ ] **Testes**: A suíte de testes do mobile (`flutter test`) executa com 100% de aprovação, validando a integridade da tela de perfil.
