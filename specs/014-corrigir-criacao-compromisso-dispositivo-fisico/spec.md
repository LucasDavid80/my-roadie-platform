# Spec — 014: Corrigir Criação de Compromisso no Dispositivo Físico

## Objetivo

Investigar e corrigir a falha em que a criação e sincronização de novos compromissos (eventos) não funciona ao utilizar o aplicativo mobile em um dispositivo físico, garantindo que o backend persista os eventos corretamente, que o app mobile envie os payloads adequados e forneça feedback visual imediato em caso de falha de rede, autenticação ou validação.

## Por quê

- **Impacto alto (bug crítico/agenda)**: A agenda de eventos é a funcionalidade central do My Roadie. A incapacidade de criar compromissos em um aparelho físico inviabiliza o uso em campo por músicos e roadies.
- **Diagnóstico preliminar & Validação (Fase 0)**:
  1. **Rotas de Eventos no Backend desabilitadas (Erro 404)**: No arquivo `backend/src/modules/events/events.controller.ts`, todos os endpoints (`@Post`, `@Get`, etc.) estavam comentados, resultando em respostas `404 Not Found` (`{"message": "Cannot POST /events", "error": "Not Found", "statusCode": 404}`) para qualquer requisição enviada a `/events`.
  2. **Rejeição por Validação Global (Erro 400)**: Em `backend/src/main.ts`, o `ValidationPipe` está configurado com `whitelist: true` e `forbidNonWhitelisted: true`. O envio de campos não declarados no DTO (como o `id` gerado pelo cliente em `EventModel.toMap()`) é imediatamente rejeitado com `400 Bad Request`.
  3. **Bloqueio de Criação por `bandId` Obrigatório (Erro 400)**: O `CreateEventDto` exigia `bandId` como UUID obrigatório. No mobile, músicos individuais ou usuários recém-criados criam eventos sem associar uma banda explicitamente (`bandId: null`). Isso resultava no erro `"O bandId é obrigatório; O bandId deve ser um UUID válido"`.
  4. **Fluxo Mobile e Tratamento de Exceções**: O `NewAppointmentWidget` agora possui tratamento com `SnackBar` e propagação correta de erro, mas precisa que o backend aceite payloads com ou sem `bandId` resolvendo o contexto do usuário.
  5. **Configuração de Rede em Dispositivos Físicos**: Em dispositivos físicos Android/iOS, `localhost` e `10.0.2.2` não alcançam o backend na máquina de desenvolvimento sem `--dart-define=BACKEND_URL` ou comando de proxy `adb reverse tcp:3000 tcp:3000`.

## Escopo

1. **Backend (`backend/`)**:
   - Ativar e estruturar o módulo `events` (`EventsController`, `EventsService`, `EventsModule` importando `PrismaModule`) com validação DTO (`CreateEventDto`, `UpdateEventDto`) e testes unitários/E2E.
   - Campos do modelo `Event` no Prisma suportados: `title` (String), `date` (DateTime), `location` (String), `description` (String?), `bandId` (UUID de `Band`), `createdById` (UUID de `User` via JWT), `status` (`EventStatus`: `PENDING`, `CONFIRMED`, `FINISHED`, `CANCELLED`).
   - **Modelo de Workspace Unificado (Músico Individual = Banda de 1 Pessoa)**:
     - `CreateEventDto.bandId` torna-se opcional (`@IsOptional() @IsUUID('4')`).
     - Em `EventsService.create`:
       - Se `bandId` for fornecido: valida a associação do usuário via `BandAccessService.assertMembership`.
       - Se `bandId` NÃO for fornecido (caso do músico solo ou criação sem banda selecionada): busca as bandas do usuário via `BandAccessService.getUserBandIds`. Se o usuário já tiver uma banda, associa o evento à primeira; se o usuário não possuir nenhuma banda cadastrada, auto-provisiona uma banda padrão (ex.: `"Carreira Solo - <Nome>"` ou `"Minha Banda"`), associa o usuário em `BandMember` e vincula o evento.
   - Garantir compatibilidade com `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`) e persistência no PostgreSQL via Prisma.
2. **Mobile (`mobile/`)**:
   - Ajustar `RemoteDataSource` e `EventModel` para sanitizar payloads de criação/atualização (não enviar `id` autogerado na criação e incluir `bandId` quando disponível).
   - Manter tratamento visual explícito de erro no formulário `NewAppointmentWidget` e na tela `PrincipalScreen` (SnackBar informativo).
   - Documentar e validar a instrução de conexão para dispositivos físicos (`adb reverse` ou `--dart-define=BACKEND_URL`).
3. **Testes**:
   - Testes unitários e E2E no backend para o módulo `events` (cobrindo criação com `bandId` explícito e criação sem `bandId` via workspace padrão).
   - Testes unitários e de widget no mobile para criação de eventos com sucesso e tratamento de erros.

## Fora de escopo

- Gestão completa de múltiplas bandas com troca dinâmica de contexto na UI mobile (reservado para spec dedicada de gestão de bandas).
- Redesenho visual completo do card de compromisso ou do formulário.
- Sincronização offline-first com banco local (Hive/SQLite) — reservado para a spec de persistência offline (Fase 3 do backlog).
- Notificações push de eventos (Fase 4 do backlog).

## Critério de sucesso

- [x] `POST /events` no backend ativo, autenticado via JWT e persistindo eventos no banco de dados com testes unitários e E2E passando.
- [x] Criação de compromissos funcionando tanto para músico individual (sem envio de `bandId`, com criação/resolução de workspace solo automático) quanto com `bandId` explícito.
- [x] Mobile envia requisições de criação de eventos com payload compatível com o backend.
- [x] `NewAppointmentWidget` exibe SnackBar legível com mensagem descritiva caso a requisição falhe, mantendo os dados preenchidos no formulário para reenvio.
- [x] Criação de compromisso funciona de ponta a ponta no dispositivo físico conectado ao backend local (via `adb reverse` ou IP configurado).
- [x] Todos os testes automatizados do backend e mobile passando sem regressões.
- [x] `backlog.md` atualizado com o status concluído ao finalizar a spec.

## Registro de validação manual em dispositivo físico

- **Status:** validado pelo usuário em 19/08/2026.
- **Resultado com `bandId` explícito:** criação do compromisso concluída com sucesso.
- **Resultado sem `bandId`:** criação do compromisso concluída com sucesso, confirmando o fluxo de workspace solo.
- **Responsável pela validação:** usuário do projeto, em seu próprio dispositivo físico.

### Detalhes opcionais para preenchimento posterior

| Campo | Valor |
| --- | --- |
| Modelo do dispositivo | _A preencher_ |
| Sistema operacional e versão | _A preencher_ |
| Método de conexão (`adb reverse` ou `BACKEND_URL`) | _A preencher_ |
| Versão/build do aplicativo | _A preencher_ |
| Ambiente/URL do backend | _A preencher_ |
| Observações ou evidências adicionais | _A preencher_ |
