# Spec — 009: Correção de Carregamento e Salvamento do Perfil (Mobile)

## Objetivo

Garantir que a tela de perfil no mobile carregue e salve os dados do usuário corretamente, com erro real exposto quando algo falhar — hoje o app falha silenciosamente (carregamento e salvamento), o que impediu diagnosticar a causa real por várias rodadas.

## Contexto — o que já está confirmado (não reinvestigar)

- Não há mais crash/"tela vermelha" ao acessar a tela de perfil.
- Conectividade mobile → backend funciona (testado via navegador do celular contra `http://<ip-local>:3000/users`, retornou `401 Unauthorized` — confirma que o backend está alcançável e o `JwtAuthGuard` responde corretamente).
- Backend escuta em `0.0.0.0` (`main.ts`), acessível pela rede local.
- Login funciona e a navegação até o perfil não quebra.
- `UsersService.findOne` já busca por `id`, `supabaseId` ou `email` — não é problema de formato de identificador.

## O que ainda não está confirmado — é o que esta spec resolve

- Campos do perfil aparecem vazios ao carregar. Causa desconhecida: pode ser que a conta testada nunca teve dado salvo, **ou** o `fetchProfile` está falhando e escondendo o erro (o `catch (e) {}` atual não expõe nada).
- Salvar o perfil mostra SnackBar de erro. Causa real desconhecida pelo mesmo motivo — `saveProfile` também engole a exceção.

## Escopo

1. Expor o erro real de `fetchProfile` e `saveProfile` — log + estado de erro utilizável pela UI. Isso é pré-requisito, não opcional, porque sem isso qualquer correção anterior foi (e seria) chute.
2. Corrigir a causa raiz encontrada depois que o erro real aparecer (backend ou client — não presumir qual lado antes de saber).
3. Expor esse erro real na UI (SnackBar com a mensagem de verdade, não um texto genérico), cumprindo o que a spec original já pedia e nunca foi de fato entregue.
4. Confirmar de ponta a ponta: conta nova sem dado consegue preencher e salvar pela primeira vez; conta com dado existente consegue editar e ver a mudança persistir.

## Fora de escopo

- Upload de foto de perfil (botão "Enviar Foto" não funcional — bug separado, não é parte desta causa).
- Redesign visual da tela.
- Mudança no modelo `UserEntity` ou no schema do backend, a menos que seja comprovadamente a causa raiz.

## Critério de sucesso

- [x] O erro real de qualquer falha em `fetchProfile`/`saveProfile` aparece no log de debug (status HTTP + mensagem), não é mais engolido silenciosamente.
- [x] Editar um campo do perfil e salvar funciona sem erro para uma conta autenticada válida.
- [x] Sair da tela de perfil e voltar mostra o dado que acabou de ser salvo.
- [x] Uma conta nova (criada via spec 010, sem dado de perfil ainda) consegue preencher e salvar o perfil pela primeira vez.
- [x] Quando salvar falhar de verdade (ex.: sem rede), a UI mostra uma mensagem compreensível, não um erro genérico nem falha silenciosa.
- [x] `flutter test` 100% verde, incluindo teste novo cobrindo salvar com sucesso e com falha.
