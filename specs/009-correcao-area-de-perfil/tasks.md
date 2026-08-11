# Tasks — 009: Correção de Carregamento e Salvamento do Perfil (Mobile)

Pré-requisitos: nenhum. Specs 010 (auth) e 011 (autorização por banda) já concluídas; rede e auth já confirmadas funcionando nesta investigação.

## Fase 0 — Expor erro real (obrigatória, não pular, não avançar sem isso)

- [x] T0.1 — Adicionar `debugPrint` com erro + stack trace em `fetchProfile` e `saveProfile` (`user_controller.dart`).
- [x] T0.2 — Hot restart (`R`), reproduzir carregamento do perfil, colar o log real.
- [x] T0.3 — Hot restart (`R`), reproduzir tentativa de salvar, colar o log real.
- [x] T0.4 — Documentar em 2-3 frases a causa raiz confirmada (status HTTP + mensagem exata), em `plan.md`.

## Fase 1 — Corrigir a causa raiz

- [x] T1.1 — Corrigir a injeção do token JWT em RemoteDataSource._getHeaders() para utilizar a sessão ativa do Supabase.

## Fase 2 — Erro real exposto na UI

- [x] T2.1 — Substituir o retorno booleano puro de `saveProfile` por estado com mensagem de erro real.
- [x] T2.2 — SnackBar/UI de erro exibe a mensagem real, não mais um texto genérico.

## Fase 3 — Testes automatizados

- [x] T3.1 — Teste unit de `saveProfile`: sucesso e falha (mock do repository), cobrindo o novo estado de erro.
- [x] T3.2 — Teste unit/widget de `fetchProfile`: conta sem dado vs. conta com dado salvo.
- [x] T3.3 — Testes de integração/widget da tela de perfil: 
    1) Login e navegação até perfil verificando pelo menos 3 campos preenchidos; 
    2) Login, navegação até perfil com 3 campos preenchidos, edição de um campo, salvamento e verificação da alteração.

- [x] T3.4 — `flutter test` completo, 100% verde.

## Fase 4 — Verificação manual real (dispositivo físico)

- [x] T4.1 — Conta nova sem dado: preencher perfil, salvar, sair da tela, voltar — dado aparece.
- [x] T4.2 — Conta com dado existente: editar campo, salvar, sair, voltar — dado atualizado aparece.

## Fase 5 — Tarefas Extras

- [x] T5.1 — Configurar `keyboardType: TextInputType.emailAddress` e `autofillHints: const [AutofillHints.email]` no campo de e-mail do `LoginForm` (`login_form.dart`).

## Checklist de fechamento da feature

- [x] Causa raiz documentada com evidência real (log/status HTTP), não hipótese não verificada
- [x] Salvar perfil funciona sem erro para conta autenticada válida
- [x] Erro real (não genérico) aparece na UI quando algo de fato falha
- [x] `flutter test` 100% verde
- [x] Verificação manual (Fase 4) feita em dispositivo físico, não só teste automatizado
- [x] `backlog.md` — entrada correspondente marcada como resolvida
- [x] `spec.md`/`plan.md` da baseline (raiz) atualizados se necessário
