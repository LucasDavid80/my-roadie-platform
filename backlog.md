# 🧭 Backlog — My Roadie Platform

> Ideias e especificações ficam aqui, organizadas por **Releases** para garantir entregas com marcos previsíveis, dependências claras e evolução contínua da plataforma.
> Quando uma entrada é escolhida para entrar em desenvolvimento, ela ganha uma pasta `specs/<numero>-<nome-curto>/` com `spec.md`, `plan.md` e `tasks.md`, e seu status é atualizado nesta lista.

## Como preencher uma entrada

```markdown
### <Nome curto da ideia>
- Intenção: <1-2 frases: o problema que resolve ou o valor que entrega>
- Impacto esperado: <alto / médio / baixo>
- Depende de: <outra feature, gap técnico do plan.md, ou "nenhum">
- Release: <ex.: v1.0.0 | v1.1.0 | v2.0.0 | a definir>
- Status: ideia | priorizado | em spec | em desenvolvimento | concluído
```

---

## 📦 Release v1.0.0 — MVP Inicial (Concluída em 29/08/2026)
> Escopo: Fundação da plataforma, autenticação Web/Mobile via Supabase, APIs de eventos, tarefas, repertório e financeiro, além da distribuição dos primeiros executáveis (APK e IPA) para testes fechados.

### Auditoria de Infraestrutura
- Intenção: Medir cobertura real de testes em todas as frentes e confirmar a stack do frontend-web.
- Impacto esperado: médio (governança)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/001-auditoria-infraestrutura/)

### Isolar rotas de admin em Route Group próprio
- Intenção: Separar `(admin)` de `(dashboard)` na Web com guard de papel dedicado (`ADMIN`), conforme `constitution.md` §9.
- Impacto esperado: médio (segurança/arquitetura)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/002-isolar-rotas-admin/)

### Conectar Mobile à API real
- Intenção: Integrar as telas de perfil e agenda do app mobile aos endpoints reais do backend NestJS.
- Impacto esperado: alto
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/003-mobile-conectado-api-real/)

### API de Tasks
- Intenção: Criar o módulo NestJS de gerenciamento de tarefas (`Task`) vinculadas a eventos.
- Impacto esperado: alto
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/004-api-de-tasks/)

### API de Repertoire
- Intenção: Expor `RepertoireSong` via backend para gestão de repertório por banda.
- Impacto esperado: médio
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/005-api-de-repertorio/)

### API de Transactions
- Intenção: Expor `Transaction` via backend para gestão financeira por banda.
- Impacto esperado: alto
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/006-api-de-transactions/)

### Atualizar Lista de Compromissos após Criação
- Intenção: Atualizar reativamente a lista de compromissos e o calendário no mobile imediatamente após criação/edição de eventos.
- Impacto esperado: alto
- Depende de: Mobile conectado à API real (spec 003)
- Release: v1.0.0
- Status: concluído (specs/007-atualizar-lista-de-compromissos/)

### Conectar formulário de Login ao authProvider real (Supabase)
- Intenção: Impedir o bypass de login com dados aleatórios, conectando o botão de submissão do `LoginForm` ao `authProvider` real.
- Impacto esperado: alto (crítico/segurança)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/008-conectar-form-de-login-authProvider/)

### Correção de Carregamento e Salvamento do Perfil (Mobile)
- Intenção: Garantir que a tela de perfil no mobile carregue e salve os dados do usuário corretamente com mensagens de erro reais na UI e token JWT válido.
- Impacto esperado: alto (bug crítico/perfil)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/009-correcao-area-de-perfil/)

### Correção da tela de cadastro na Web e sincronização no Supabase Auth (Mobile)
- Intenção: Corrigir o acesso à tela de cadastro no frontend-web (`/register`) e garantir o registro no Supabase Auth e PostgreSQL via NestJS durante o cadastro mobile.
- Impacto esperado: alto (bug crítico/cadastro)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/010-correcao-login-e-cadastro/)

### Autorização por Banda (Tasks, Repertoire, Transactions)
- Intenção: Garantir que os módulos tasks, repertoire e transactions verifiquem associação com a Band dona do recurso via BandMember, corrigindo vulnerabilidade de segurança.
- Impacto esperado: alto (crítico/segurança)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/011-autorizacao-por-banda/)

### Validar e testar fluxo de Login com API Real
- Intenção: Verificar a estabilidade do fluxo de login contra a API de autenticação real e criar testes adicionais de integração.
- Impacto esperado: alto
- Depende de: Conectar formulário de Login ao authProvider real (Supabase)
- Release: v1.0.0
- Status: concluído (specs/012-validar-fluxo-login-API-real/)

### Ajustes de UX na Agenda (Mobile)
- Intenção: Ajustar o layout da tela de Agenda no mobile para permitir rolagem, evitando que o calendário trave a tela verticalmente.
- Impacto esperado: alto (usabilidade)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/013-ajustes-ux-agenda-mobile/)

### Corrigir criação de compromisso no dispositivo físico
- Intenção: Investigar e corrigir a falha em que um novo compromisso não é criado ao usar o app mobile em um aparelho físico (ativação de endpoints de eventos, sanitização de payload e feedback de erro na UI).
- Impacto esperado: alto (bug crítico/agenda)
- Depende de: Mobile conectado à API real (spec 003), Atualização da lista de compromissos após criação (spec 007)
- Release: v1.0.0
- Status: concluído (specs/014-corrigir-criacao-compromisso-dispositivo-fisico/)

### Extensão do Modelo de Eventos & Ações do Card de Compromisso (Horários, Cachê e Exclusão)
- Intenção: Estender o modelo `Event` no Prisma e backend NestJS para suportar e persistir `startTime`, `endTime`, `type` e `fee`, sincronizar automaticamente receitas em `Transaction` quando houver cachê (`fee > 0`), conectar o botão de deletar em `CommitmentCard` com confirmação ao fluxo de remoção do `AgendaController`, e ajustar layout/dinamismo do formulário `NewAppointmentWidget`.
- Impacto esperado: alto (completude da agenda, usabilidade e integração financeira)
- Depende de: Corrigir criação de compromisso no dispositivo físico (spec 014)
- Release: v1.0.0
- Status: concluído (specs/015-extensao-modelo-eventos-e-acoes-card/)

### Preparação para Release do MVP & Padronização de Logs (AppLogger)
- Intenção: Criar utilitário centralizado `AppLogger` com proteção `kDebugMode` para eliminar `debugPrint`s que expõem tokens e dados sensíveis em compilações de release, ajustar a identidade da aplicação para "My Roadie" (`android:label`), restringir CORS no backend, publicar frontend-web com rota `/testers` para distribuição de builds, e automatizar geração de APK e IPA (via runner macOS do GitHub Actions) para testes fechados com usuários reais.
- Impacto esperado: alto (segurança, privacidade e prontidão para release)
- Depende de: Extensão do Modelo de Eventos & Ações do Card de Compromisso (spec 015)
- Release: v1.0.0
- Status: concluído (specs/016-preparacao-release-mvp/) — release do MVP para testes fechados entregue

### Pipeline CI/CD Unificado & Modernizado (E2E, Deploy Contínuo, Filtro de Paths & Otimização de Custos)
- Intenção: Unificar e modernizar o CI/CD com filtros inteligentes de paths (`dorny/paths-filter`), disparo manual sob demanda (`workflow_dispatch`), execução de testes E2E (backend e Playwright web), publicação unificada de artefatos de release (APK e IPA) e Continuous Deployment.
- Impacto esperado: alto (automação de entrega contínua, confiabilidade e redução de custos)
- Depende de: nenhum
- Release: v1.0.0
- Status: concluído (specs/017-pipeline-cicd-unificado/)

### Hospedagem e Distribuição de Executáveis de Release do MVP
- Intenção: Resolver a falha 404 de download na rota `/testers`, estabelecendo infraestrutura de armazenamento e distribuição externa para APK e IPA via GitHub Releases, resiliência de UI no frontend e automação de publicação no CI/CD.
- Impacto esperado: alto (distribuição e experiência de onboarding para testers)
- Depende de: Pipeline CI/CD Unificado & Modernizado (spec 017), Preparação para Release do MVP (spec 016)
- Release: v1.0.0
- Status: concluído (specs/018-distribuicao-executaveis-mvp/; baseline raiz sincronizada em spec.md e plan.md)

### Testes de Integração Ponta a Ponta (E2E) no Mobile
- Intenção: Criar suíte de testes E2E para o aplicativo mobile utilizando o pacote `integration_test` do Flutter, validando fluxos completos (autenticação, visualização/edição de perfil e ciclo da agenda) em ambiente de execução real/emulador.
- Impacto esperado: alto (qualidade e confiabilidade de entrega)
- Depende de: Pipeline CI/CD Unificado & Modernizado (spec 017), Corrigir criação de compromisso no dispositivo físico (spec 014), Validar e testar fluxo de Login com API Real (spec 012), Hospedagem e Distribuição de Executáveis de Release do MVP (spec 018)
- Release: v1.0.0
- Status: concluído (specs/019-testes-e2e-mobile/; baseline raiz sincronizada em spec.md e plan.md)

---

## 📦 Release v1.0.1 — Patch de Segurança & Permissões (Concluída em 01/09/2026)
> Escopo: Hotfixes emergenciais de segurança contra escalonamento de privilégio no campo `role`, prevenção de forjamento de `userId` derivando da sessão autenticada em transações e adição da permissão `INTERNET` no `AndroidManifest`.

- Resolução dos achados do checkpoint 02 e governança em AGENTS.md (PR #33)
- Prevenir escalonamento de privilégio no campo `role` e adicionar endpoint admin (PR #34)
- Prevenir forjamento de `userId` derivando da sessão autenticada em transações (PR #35)
- Adicionar permissão `INTERNET` no `AndroidManifest` (PR #36)

---

## 📦 Release v1.1.0 — Refinamento de UX da Agenda & Dashboard (Concluída em 03/09/2026)
> Escopo: Refinamento visual da tela principal mobile, separação de eventos passados e futuros no Histórico, correção de cálculos e formatação dos cards do dashboard, automação de versão e downloads via GitHub API na rota `/testers` e deploy hook unificado.

### Correção de UX no Modal "Novo Compromisso" (Mobile)
- Intenção: Corrigir falhas de UX identificadas no modal de criação de compromisso: borda interna excessiva apertando os campos do formulário (deveria ser praticamente zero/zerada); botão "Criar Compromisso" sem bordas laterais, ficando sobreposto ao botão "Cancelar"; campo "Cachê" cortando o texto ao digitar valores altos (ex.: 1500,00); e avaliar substituir os campos separados de "Início" e "Término" por um único campo de duração onde o usuário define início e fim de uma vez.
- Impacto esperado: alto (bug crítico de usabilidade, não verificado antes do release)
- Depende de: Extensão do Modelo de Eventos (spec 015)
- Release: v1.1.0
- Status: concluído (specs/020-correcao-ux-modal-novo-compromisso/; baseline raiz sincronizada em spec.md e plan.md)

### Correção dos Cards de Estatísticas do Dashboard (InfosWidget)
- Intenção: Corrigir cálculos incorretos nos cards "Este Mês", "Shows/Mês" e "Cachê/Mês" da tela principal (mobile). Causas-raiz identificadas em `principal_screen.dart`/`agenda_controller.dart`: (1) `compromissosTotal` (card "Este Mês") recebe `events.length`, contando todos os compromissos futuros sem filtrar pelo mês corrente — por isso hoje exibe o mesmo valor do card "Próximos"; (2) `totalFee` (card "Cachê/Mês") soma o `fee` de todos os eventos do estado, também sem filtro de mês, somando cachês de meses futuros junto; (3) `monthlyShows` (card "Shows/Mês") filtra corretamente por mês, mas conta todos os tipos de evento (inclusive "Ensaio"), não apenas os do tipo "Show". Também ajustar a formatação do valor de `faturamento` (hoje exibido cru, ex. "18500.0", sem `R$`, sem separador de milhar e quebrando de forma estranha em duas linhas).
- Impacto esperado: alto (bug de dados incorretos visíveis na tela principal, primeira impressão do usuário)
- Depende de: Extensão do Modelo de Eventos (spec 015)
- Release: v1.1.0
- Status: concluído (specs/022-correcao-cards-dashboard/; baseline raiz sincronizada em spec.md e plan.md)

### Histórico de Compromissos e Filtragem de Próximos Eventos (Mobile)
- Intenção: Evitar poluição visual e confusão de UX na tela de Agenda exibindo em "Próximos Compromissos" exclusivamente eventos a partir da data atual (>= hoje) e adicionar botão/atalho que direciona para uma tela dedicada de histórico de compromissos anteriores.
- Impacto esperado: alto (usabilidade/UX)
- Depende de: Ajustes de UX na Agenda (spec 013), Extensão do Modelo de Eventos (spec 015)
- Release: v1.1.0
- Status: concluído (specs/021-historico-de-compromissos/; baseline raiz sincronizada em spec.md e plan.md)

---

## 🔮 Releases Futuras (Planejamento)

### Release v1.2.0 — Conformidade Legal, Privacidade & Governança (LGPD)
> Objetivo: Estabelecer as regras jurídicas, privacidade de dados e conformidade antes do onboarding em massa de músicos e roadies.

#### 1. Consentimento de Termos de Uso e Políticas no Onboarding
- Intenção: Exibir termos e colher consentimento explícito e auditável (com versão dos termos e timestamp) no cadastro Web e Mobile.
- Impacto esperado: alto (legal/LGPD)
- Depende de: nenhum
- Release: v1.2.0
- Status: ideia

#### 2. Exclusão de Conta e Anonimização de Dados (LGPD Art. 18)
- Intenção: Disponibilizar endpoint e fluxo de exclusão de conta (`DELETE /users/me`), garantindo a remoção de dados pessoais sensíveis e anonimização de dados históricos (eventos e transações de bandas com outros membros).
- Impacto esperado: alto (risco legal/LGPD)
- Depende de: Consentimento de Termos de Uso e Políticas no Onboarding
- Release: v1.2.0
- Status: ideia

#### 3. Portabilidade e Exportação de Dados do Usuário (LGPD Art. 18, V)
- Intenção: Disponibilizar endpoint e interface para o usuário baixar um dump estruturado (JSON) com todos os seus dados pessoais e histórico na plataforma.
- Impacto esperado: médio (legal/LGPD)
- Depende de: nenhum
- Release: v1.2.0
- Status: ideia

---

### Release v1.3.0 — Gestão de Bandas, Convites & Notificações de Equipe (Modelo Híbrido)
> Objetivo: Viabilizar a criação explícita e gestão de múltiplas bandas, sistema híbrido de convites (@username + WhatsApp) e alertas automáticos de eventos da agenda e comunicados da equipe.

#### 1. Gestão Básica de Bandas e Múltiplos Workspaces
- Intenção: Permitir ao usuário criar, editar, excluir e alternar entre múltiplas bandas e projetos musicais (Workspace Switcher) no Web e Mobile, associando o criador automaticamente como `OWNER` em `BandMember`.
- Impacto esperado: alto (fundação de colaboração e múltiplos projetos na plataforma)
- Depende de: Autorização por Banda (spec 011)
- Release: v1.3.0
- Status: ideia

#### 2. Identidade Única por @username e Busca de Usuários
- Intenção: Adicionar o campo `username` único (`@unique`) no modelo `User` do Prisma com regras de validação (letras minúsculas, números, `_` e `.`), endpoint de busca dinâmica de perfis (`GET /users/search?q=`) e seleção de `@` no cadastro e tela de perfil.
- Impacto esperado: alto (identidade estilo rede social, base para busca e perfis públicos)
- Depende de: nenhum
- Release: v1.3.0
- Status: ideia

#### 3. Sistema de Convites Internos por @username (BandInvite)
- Intenção: Permitir que o líder da banda convide integrantes buscando diretamente pelo `@username`, gerando registro com ciclo de vida (`PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED`), central de convites e badge de notificação no perfil, vinculando o usuário como `BandMember` somente após confirmação.
- Impacto esperado: alto (colaboração in-app segura, com consentimento e sem risco de spam)
- Depende de: Gestão Básica de Bandas, Identidade Única por @username
- Release: v1.3.0
- Status: ideia

#### 4. Links e Códigos de Convite Compartilháveis (WhatsApp / Onboarding Externo)
- Intenção: Resolver o problema do "ovo e a galinha" gerando links rápidos (`myroadie.app/join/band-xyz`) e códigos de acesso compartilháveis diretamente no WhatsApp, direcionando novos integrantes para cadastro simplificado com ingresso automático na banda.
- Impacto esperado: alto (crescimento viral, eliminação de atrito de onboarding para quem ainda não tem o app)
- Depende de: Gestão Básica de Bandas
- Release: v1.3.0
- Status: ideia

#### 5. Notificações Locais Programadas (Lembretes de Eventos Próximos na Agenda)
- Intenção: Alertar músicos e roadies no app mobile sobre shows e compromissos que estão chegando (ex.: 24h e 2h antes do horário de início/passagem de som) utilizando agendamento local no dispositivo, sem depender de conexão de rede no momento do disparo.
- Impacto esperado: alto (usabilidade imediata na agenda já entregue aos testers)
- Depende de: nenhum
- Release: v1.3.0
- Status: ideia

#### 6. Push Notifications Remotas (Convites de Banda & Atualizações da Equipe)
- Intenção: Integrar serviço de push notifications (FCM) para alertar integrantes em tempo real quando receberem um convite para entrar em uma banda ou quando um evento da banda for criado/remarcado.
- Impacto esperado: alto (comunicação em tempo real para equipes musicais)
- Depende de: Sistema de Convites Internos por @username
- Release: v1.3.0
- Status: ideia

#### Considerações de Design de Bandas e Convites:
- **Vantagens adotadas:** Identidade por `@username`, busca visual com foto e instrumentos, zero dependência de e-mails de terceiros e base para contratação freelance.
- **Mitigações técnicas:** Links para WhatsApp mitigam o problema do usuário não cadastrado; `BandInvite` com máquina de estados previne spam; notificações locais garantem lembretes de agenda mesmo sem internet.

---

### Release v1.4.0 — Operação de Show & Experiência de Palco
> Objetivo: Construir as ferramentas operacionais de uso direto no ensaio e show, alavancando as APIs já desenvolvidas (`Repertoire` — spec 005 e `Tasks` — spec 004).

#### 1. Gestão e Ordenação de Setlists por Show
- Intenção: Permitir que os músicos criem setlists vinculadas a shows específicos, reordenando músicas do repertório (`RepertoireSong`) e calculando tempo total estimado de apresentação.
- Impacto esperado: alto (preparação de shows)
- Depende de: API de Repertoire (spec 005)
- Release: v1.4.0
- Status: ideia

#### 2. Modo Palco Mobile (Stage Mode UI)
- Intenção: Interface mobile em tela cheia com modo escuro de alto contraste, tipografia ampliada de letras e cifras, prevenção de bloqueio de tela (*wakelock*) e rolagem automática configurável para visualização durante o show.
- Impacto esperado: alto (experiência do músico no palco)
- Depende de: Gestão e Ordenação de Setlists por Show
- Release: v1.4.0
- Status: ideia

#### 3. Conexão do Checklist de Tarefas na UI Mobile
- Intenção: Conectar a API de Tasks (spec 004) à interface mobile, permitindo gerenciar checklists operacionais vinculados a cada evento com barra de progresso no card de compromisso e contagem no painel inicial (`InfosWidget`).
- Impacto esperado: alto (operação de estrada e valor para roadies)
- Depende de: API de Tasks (spec 004), Extensão do Modelo de Eventos (spec 015)
- Release: v1.4.0
- Status: ideia

#### 4. Inventário de Carga e Equipamentos (Roadie Check)
- Intenção: Checklist especializado para controle e conferência de equipamentos, caixas, instrumentos e cabos no carregamento e descarregamento da van/veículo.
- Impacto esperado: alto (logística técnica de shows)
- Depende de: Conexão do Checklist de Tarefas na UI Mobile
- Release: v1.4.0
- Status: ideia

#### 5. Leitura Offline com Cache Local (Fase 1 - Offline-First)
- Intenção: Implementar cache local (Hive/SQLite) no app mobile para que a agenda, setlists, repertório e tarefas fiquem disponíveis para visualização mesmo em locais de show sem sinal de internet.
- Impacto esperado: alto (confiabilidade em palcos e estradas)
- Depende de: nenhum
- Release: v1.4.0
- Status: ideia

#### 6. Sincronização Offline Bidirecional (Fase 2 - Offline-First)
- Intenção: Implementar fila de requisições offline (Outbox Pattern) com resolução de conflitos, permitindo criar e editar compromissos e tarefas sem internet e sincronizar com o backend ao restabelecer a conexão.
- Impacto esperado: alto (robustez operacional)
- Depende de: Leitura Offline com Cache Local
- Release: v1.4.0
- Status: ideia

---

### Release v1.5.0 — Logística, Geolocalização & Integração de Agenda
> Objetivo: Estender a gestão de compromissos para a rotina de viagem e rotas da equipe técnica e músicos.

#### 1. Geolocalização e Rotas de Navegação (Waze / Google Maps)
- Intenção: Integrar endereço do compromisso com APIs de mapas para exibir localização aproximada e botão de abertura direta de rota no Waze, Google Maps ou Apple Maps.
- Impacto esperado: médio (agilidade no dia do show)
- Depende de: nenhum
- Release: v1.5.0
- Status: ideia

#### 2. Painel de Logística de Viagem (Roadbook Digital)
- Intenção: Centralizar detalhes de viagem da banda (ponto de encontro, dados da van, reserva de hotel/hospedagem e horários de alimentação) em um painel digital do evento.
- Impacto esperado: alto (organização de turnês e viagens)
- Depende de: Geolocalização e Rotas de Navegação
- Release: v1.5.0
- Status: ideia

#### 3. Exportação e Sincronização de Calendários Externos (.ics)
- Intenção: Permitir exportar e sincronizar compromissos com calendários pessoais (Google Calendar, Apple Calendar e Outlook) via arquivos `.ics` e links de calendário.
- Impacto esperado: médio (conveniência pessoal)
- Depende de: nenhum
- Release: v1.5.0
- Status: ideia

---

### Release v1.6.0 — Módulo Financeiro Avançado
> Objetivo: Potencializar a API financeira (`Transactions` — spec 006) criando utilitários de divisão de receitas entre integrantes e equipe.

#### 1. Regras e Parâmetros de Rateio de Cachê por Banda
- Intenção: Configurar regras de divisão financeira na banda (percentuais por integrante ou valores fixos por função/roadie).
- Impacto esperado: alto (transparência financeira)
- Depende de: API de Transactions (spec 006), Gestão Básica de Bandas
- Release: v1.6.0
- Status: ideia

#### 2. Liquidação de Shows e Geração Automática de Repasses
- Intenção: Ao concluir um show com cachê recebido, calcular a divisão automaticamente, gerar os lançamentos individuais de repasse aos músicos/equipe e emitir extrato de prestação de contas.
- Impacto esperado: alto (fechamento financeiro sem planilhas externas)
- Depende de: Regras e Parâmetros de Rateio de Cachê por Banda
- Release: v1.6.0
- Status: ideia

---

### Release v1.7.0 — Suporte, Governança & Sustentabilidade da Plataforma
> Objetivo: Recursos de suporte, manutenção contínua, governança de acesso e sustentabilidade do projeto.

#### 1. Tela de Ajuda e Relatório de Erros
- Intenção: Apresentar guias de suporte e permitir copiar/reportar o nome e a descrição detalhada de eventuais erros da plataforma.
- Impacto esperado: médio
- Depende de: nenhum
- Release: v1.7.0
- Status: ideia

#### 2. Avaliação de Módulo Administrativo no Mobile
- Intenção: Decidir/implementar se haverá um painel de administração simplificado no app móvel ou se a gestão ficará 100% restrita ao painel Web.
- Impacto esperado: baixo/médio
- Depende de: Isolar rotas de admin em Route Group próprio (spec 002)
- Release: v1.7.0
- Status: ideia

#### 3. Tela de Contribuições (Apoio Monetário)
- Intenção: Oferecer uma área de contribuição ou doações para apoiar o financiamento e manutenção do projeto.
- Impacto esperado: médio
- Depende de: nenhum
- Release: v1.7.0
- Status: ideia