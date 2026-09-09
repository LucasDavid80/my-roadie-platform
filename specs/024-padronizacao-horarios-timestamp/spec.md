# Spec — 024: Padronização de Horários com Timestamps (startsAt / endsAt)

## 1. Objetivo
Substituir a modelagem híbrida de horários atual (onde a data é separada do horário: `date`, `startTime`, `endTime`) por timestamps completos ISO-8601 (`startsAt` e `endsAt`). Essa mudança trará robustez para o gerenciamento da agenda, resolvendo problemas clássicos de fuso horário e habilitando nativamente a ocorrência de eventos que ultrapassam a meia-noite (eventos da madrugada).

## 2. Por quê
Hoje, se um show começa às 23:00 e termina às 02:00, o sistema tem dificuldade em representar a transição do dia de forma limpa, já que a data-base (`date`) é uma só e os horários são strings desvinculadas de data. Além disso, a comparação de horários via string e as validações de sobreposição de agenda no banco de dados são ineficientes. Músicos dependem fortemente de horários de madrugada, portanto, o sistema precisa tratar data/hora com precisão, unificando as informações em um Timestamp robusto que permita ordenação cronológica e operações matemáticas diretamente no PostgreSQL.

## 3. Escopo
1. Migrar o banco de dados (Prisma): substituir os campos `date`, `startTime` e `endTime` por `startsAt`, `endsAt` e `timezone` no modelo `Event`.
2. Criar migration em múltiplas etapas (adicionar colunas, preencher dados inferindo fuso, dropar antigas).
3. Atualizar a API do backend (NestJS) para receber e devolver os novos campos.
4. Atualizar a interface do Frontend-Web (Next.js) para lidar com a nova modelagem.
5. Atualizar o aplicativo Mobile (Flutter) para consumir e enviar a nova estrutura.
6. Ajustar a lógica da Spec 023 (Lembretes Locais) para se basear no novo `startsAt`.

## 4. Fora de Escopo
- Eventos recorrentes (serão tratados em outra spec futura).
- Lembretes customizáveis pelo usuário.

## 5. Critérios de Sucesso
- [ ] A migration do banco de dados aplica a substituição em etapas sem perda de dados.
- [ ] O fuso horário do local do show é preservado pelo campo `timezone`, mantendo estabilidade de leitura.
- [ ] Eventos que ultrapassam a meia-noite são salvos corretamente e calculam duração corretamente.
- [ ] Os formulários (Web e Mobile) adotam a interface unificada de "Data e Hora de Início" (obrigatório) e "Data e Hora de Fim" (opcional).
- [ ] O Mobile exibe e salva os eventos corretamente usando `startsAt` e `endsAt`.
- [ ] A lógica de alarmes do mobile e o dashboard continuam operando normalmente.
- [ ] Testes no dispositivo físico executados com sucesso (validação de timezone do SO e alarmes de hardware real).
- [ ] Testes unitários afetados e E2E estão atualizados e passando verde.
