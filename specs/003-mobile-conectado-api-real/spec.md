# Spec — 003: Conectar Mobile à API real

## Objetivo

Implementar a camada `data/` do mobile (`remote_datasource.dart`, `local_datasource.dart`, `agenda_repository_impl.dart`, `event_model.dart` e equivalentes de `user`), hoje vazia, para que as telas já existentes (`presentation/`) passem a consumir dados reais do backend em vez de rodar desconectadas.

## Nota de origem

Parte da implementação já existe no working directory (não commitada, feita fora do fluxo de spec formal): `remote_datasource.dart`, mudanças em `main.dart`, `user_controller`, mais os arquivos de interface (`i_auth_repository.dart`, `i_user_repository.dart`). Essas mudanças quebraram 3 testes (`login_form_test.dart`). Esta spec **absorve esse trabalho já iniciado**, não começa do zero — mas o considera "em revisão", não "pronto", até passar pelos critérios abaixo.

## Escopo

- Implementar/completar `data/datasources/remote_datasource.dart` (chamadas HTTP ao backend).
- Implementar `data/datasources/local_datasource.dart` (cache/persistência local, se aplicável).
- Implementar `data/repositories/agenda_repository_impl.dart` e o repository de user (`user_repository_impl.dart`, já presente).
- Completar os `data/models` necessários (`event_model.dart`, e o que mais for preciso para User).
- Corrigir os 3 testes quebrados em `login_form_test.dart` antes de considerar qualquer fase concluída.
- Conectar as telas de agenda e perfil (`presentation/`) aos repositories reais, substituindo qualquer mock/dado estático.

## Fora de escopo

- Task, RepertoireSong, Transaction — essas nem têm API no backend ainda (ver `plan.md` raiz §8, item 1). O mobile só pode consumir o que o backend já expõe: Users, Events, Auth.
- Qualquer tela nova do mobile — só conectar o que já existe.

## Critério de sucesso

- [x] `flutter test` passa 100% (os 3 testes de `login_form_test.dart` corrigidos, nenhuma regressão nova).
- [x] Agenda e perfil no mobile mostram dados vindos do backend, não mock.
- [x] `docs/architecture/mobile.md` (se existir) ou seção equivalente atualizada refletindo a camada `data/` implementada.
- [x] Cobertura do mobile medida novamente (a medição da 001 ficou inválida por causa dos testes quebrados) e registrada em `plan.md` raiz.
