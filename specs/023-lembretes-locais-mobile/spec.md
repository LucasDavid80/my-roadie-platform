# Spec — 023: Lembretes Locais de Eventos Próximos na Agenda (Mobile)

## 1. Objetivo

Agendar e disparar notificações locais nativas no dispositivo móvel (Android e iOS) para avisar o usuário sobre shows, ensaios e compromissos que estão chegando, com antecedência configurada (24h e 2h antes do início). O sistema opera 100% offline, sem necessidade de conexão com a internet ou infraestrutura de servidor (FCM/APNs remotos), utilizando o pacote `flutter_local_notifications`.

Ao criar ou editar um evento com horário de início definido (`startTime`), o app agenda automaticamente dois lembretes locais no sistema operacional. Ao excluir um evento, todos os lembretes associados são cancelados. O usuário não precisa configurar nada — a funcionalidade é ativa por padrão.

## 2. Por quê

Testers ativos da plataforma já utilizam a agenda para registrar shows e ensaios, mas não recebem nenhum alerta sobre eventos próximos. Isso obriga o músico a lembrar de abrir o app manualmente — comportamento pouco confiável na rotina agitada de um profissional da música. Lembretes locais são a forma mais simples, confiável e de custo zero para garantir pontualidade e aumentar a retenção do app no dia a dia do usuário. Esta entrega fecha a lacuna de engajamento identificada após o release do MVP (v1.0.0) sem adicionar dependência de servidor.

A `constitution.md` §4 prioriza valor imediato para o usuário antes de complexidade de infraestrutura, e esta feature entrega alto impacto (pontualidade) com baixa complexidade técnica (biblioteca client-side pura).

## 3. Escopo

1. Integrar o pacote `flutter_local_notifications` ao app mobile.
2. Configurar permissões de notificação para Android (canal de alta prioridade) e iOS (solicitação de permissão em runtime).
3. Criar serviço `NotificationService` com métodos para agendar, cancelar e cancelar-todos os lembretes.
4. Agendar automaticamente 2 notificações ao criar um evento com `startTime` definido: **24h antes** e **2h antes**.
5. Cancelar automaticamente todas as notificações de um evento ao excluí-lo.
6. Recriar os lembretes ao editar um evento (cancelar os antigos e agendar os novos com base no `startTime` atualizado).
7. Inicializar o serviço de notificações no startup do app (`main.dart`).

## 4. Fora de Escopo

- Notificações push remotas via FCM (Firebase Cloud Messaging) — serão tratadas na spec de convites de banda (v1.3.0).
- Tela de configuração de preferências de lembrete (o usuário não pode alterar os intervalos nesta spec).
- Lembretes para eventos sem `startTime` definido.
- Sincronização de lembretes entre dispositivos.
- Agendamento de notificações recorrentes (ex.: ensaio toda semana).
- Suporte a macOS, Windows ou Linux — apenas Android e iOS.

## 5. Critérios de Sucesso

- [x] O pacote `flutter_local_notifications` está instalado e configurado no `pubspec.yaml`.
- [x] A permissão de notificação é solicitada ao usuário no primeiro acesso ao app (iOS) ou o canal é criado corretamente (Android).
- [x] Ao criar um evento com `startTime`, dois lembretes são agendados: 24h antes e 2h antes.
- [x] Ao excluir um evento, seus lembretes são cancelados no sistema operacional.
- [x] Ao editar um evento com novo `startTime`, os lembretes antigos são cancelados e novos são agendados.
- [x] Notificações não são agendadas para eventos cujo `startTime` já passou (passado).
- [x] O `NotificationService` possui cobertura de testes unitários >= 80%.
- [x] O app continua compilando sem erros para Android e iOS após a integração.
