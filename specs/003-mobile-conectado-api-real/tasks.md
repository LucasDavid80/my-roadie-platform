# Tasks — 003: Conectar Mobile à API real

Pré-requisitos: nenhum (Users e Events já têm API no backend).

## Fase 0 — Estabilizar o que já existe (antes de qualquer coisa nova)

- [x] T0.1 — Rodar `flutter test` e confirmar os 3 testes quebrados de `login_form_test.dart`.
  - Critério: causa raiz identificada e documentada (1-2 frases) antes de corrigir.
- [x] T0.2 — Corrigir os 3 testes.
  - Critério: `flutter test` 100% verde, sem pular/ignorar teste.
- [x] T0.3 — Revisar o que já foi feito em `remote_datasource.dart`, `main.dart`, `user_controller` contra o padrão de Clean Architecture do `constitution.md` §2, e ajustar o que estiver fora do padrão.

## Fase 1 — Datasource remoto

- [x] T1.1 — Completar `remote_datasource.dart` para Events (endpoints já existem no backend).
  - Critério: 1 caso positivo + 1 negativo (erro de rede/401) testados.
- [x] T1.2 — Completar `remote_datasource.dart` para User (endpoints já existem no backend).
  - Critério: 1 caso positivo + 1 negativo testados.

## Fase 2 — Repository

- [x] T2.1 — Implementar `agenda_repository_impl.dart` usando o datasource da Fase 1.
- [x] T2.2 — Confirmar `user_repository_impl.dart` (já presente) está alinhado ao datasource.

## Fase 3 — Conectar telas

- [x] T3.1 — Conectar tela de agenda (`principal_screen.dart`) ao repository real, removendo mock.
- [x] T3.2 — Conectar tela de perfil (`person_screen.dart`) ao repository real, removendo mock.

## Checklist de fechamento da feature

- [ ] `flutter test` 100% verde
- [ ] Nenhuma tela do mobile usa dado mockado para Events/User
- [ ] Cobertura do mobile remedida e registrada em `plan.md` raiz
- [ ] `backlog.md` — entrada "Mobile conectado à API real" removida/marcada como resolvida
- [ ] `spec.md`/`plan.md` da baseline (raiz) atualizados para refletir que o mobile agora consome API real
