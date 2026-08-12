# Plan — 009: Correção de Carregamento e Salvamento do Perfil (Mobile)

## Diagnóstico anterior (resumo — não repetir essas investigações)

| Hipótese testada | Resultado |
|---|---|
| `spacing` em `Row` incompatível com o SDK | Descartada — Flutter 3.44.6 suporta desde a 3.27 |
| Instabilidade do fluxo de auth pré-spec-010 causava o crash | Descartada — auth funciona, chega até o perfil sem erro |
| `defaultBackendUrl` usando `10.0.2.2` em dispositivo físico | **Confirmada como problema real**, corrigida via `--dart-define=BACKEND_URL=http://<ip-local>:3000` |
| ID do Supabase incompatível com a busca do backend | Descartada — `findOne` já resolve por `id`/`supabaseId`/`email` |

## Fase 0 — Parar de adivinhar: expor o erro real antes de qualquer correção

Os dois `catch (e) {}` em `user_controller.dart` escondem a causa de tudo. Primeiro passo, sem exceção:

```dart
Future<void> fetchProfile([String? userId]) async {
  ...
  try {
    final userProfile = await ref.read(userRepositoryProvider).getUser(targetId);
    state = userProfile;
  } catch (e, stack) {
    debugPrint('fetchProfile ERRO: $e');
    debugPrintStack(stackTrace: stack);
  }
}

Future<bool> saveProfile() async {
  ...
  try {
    final updated = await ref.read(userRepositoryProvider).updateUser(state.id, state);
    state = updated;
    return true;
  } catch (e, stack) {
    debugPrint('saveProfile ERRO: $e');
    debugPrintStack(stackTrace: stack);
    return false;
  }
}
```

Depois de aplicar isso: **hot restart** (tecla `R` no terminal do `flutter run` já em execução — não precisa rebuildar do zero, isso evita outro ciclo de 5+ minutos). Reproduzir os dois cenários:
1. Entrar na tela de perfil → colar o log de `fetchProfile` (mesmo que não dê erro, confirmar que não deu).
2. Editar um campo e tentar salvar → colar o log de `saveProfile`.

Não avançar pra Fase 1 sem os dois logs reais em mãos.

### Causa raiz confirmada (Fase 0):
Tanto `fetchProfile` quanto `saveProfile` falhavam lançando a exceção `UnauthorizedException` ("Não autorizado", status HTTP 401/403). A causa raiz envolvia dois fatores:
1. **Client mobile**: `RemoteDataSource._getHeaders()` fazia chamadas à API sem o cabeçalho `Authorization: Bearer <token>` válido quando `_supabase?.auth.currentSession` não era repassado.
2. **Backend NestJS**:
   - Os tokens JWT gerados pelo Supabase Auth usam assinatura assimétrica RS256. A estratégia JWT do NestJS (`JwtStrategy`) esperava assinar/validar usando chave simétrica local (`JWT_SECRET`). Foi adicionada integração com `jwks-rsa` para buscar as chaves públicas do Supabase Auth (`/.well-known/jwks.json`) com fallback para o segredo local.
   - O `OwnershipGuard` do NestJS rejeitava atualizações quando o ID da sessão vinha associado por e-mail ou `supabaseId` divergente do `id` do banco. O guard e o `UsersService` foram atualizados para validar autorização também por e-mail e sincronizar o `supabaseId` na tabela `User` durante o update.

## Fase 1 — Corrigir a causa raiz (detalhar só depois da Fase 0)

Hipóteses prováveis a verificar quando o log chegar, em ordem de probabilidade — mas **nenhuma delas deve virar correção antes de bater com o log real**:

- **400 Bad Request**: `ValidationPipe` com `forbidNonWhitelisted: true` (`main.ts`) rejeitando algum campo que `UserModel.toJson()` envia mas não existe no `UpdateUserDto` do backend.
- **403 Forbidden**: `OwnershipGuard` recusando porque o `id` usado em `updateUser(state.id, ...)` não corresponde ao usuário autenticado (o histórico de confusão `id` vs. `supabaseId` já apareceu antes nesta investigação).
- **404 Not Found**: o `id` em `state.id` não bate com nenhum registro (ex.: `state.id` ficou com o valor de fallback `'1'` do `build()` em algum fluxo).
- **500 Internal Server Error**: erro de schema/tipo no backend ao processar o update.

## Fase 2 — Expor o erro real na UI (não só no log)

Trocar o retorno booleano puro de `saveProfile` por um estado que carregue a mensagem de erro real (ex.: campo `errorMessage` acessível pela UI), e o SnackBar de erro passa a mostrar essa mensagem, não um texto genérico fixo.

## Fase 3 — Testes automatizados

- Unit test de `saveProfile`: sucesso e falha, mockando o repository, cobrindo o novo estado de erro.
- Unit/widget test de `fetchProfile`: conta sem dado vs. conta com dado salvo.
- Integration/widget test da UI de Perfil:
  1. Login e navegação até a página de perfil com verificação de pelo menos 3 campos preenchidos.
  2. Login, navegação até a página de perfil com 3 campos preenchidos, edição de um campo, salvamento e asserção da alteração correta.


## Fase 4 — Verificação manual real (não só teste automatizado)

Testes automatizados com mock não pegam o que aconteceu aqui (mock nunca teria o bug de `10.0.2.2`, por exemplo). Fechar só depois de confirmar em dispositivo físico:
- Conta nova sem dado: preencher, salvar, sair da tela, voltar — dado aparece.
- Conta com dado existente: editar, salvar, sair, voltar — dado atualizado aparece.
