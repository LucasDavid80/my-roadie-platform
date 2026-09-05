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

### Release v1.1.1 — Lembretes Locais de Compromissos (Quick-Win Mobile)
> Objetivo: Entregar pontualidade e retenção imediata para os testers do app mobile através de alarmes e notificações locais disparadas diretamente pelo dispositivo para eventos próximos, com custo zero de infraestrutura de servidor.

#### Lembretes Locais de Eventos Próximos na Agenda (Mobile)
- Intenção: Agendar e disparar notificações locais nativas no dispositivo móvel (Android e iOS via `flutter_local_notifications`) para avisar o usuário sobre shows, ensaios e compromissos que estão chegando (ex.: 24h e 2h antes do início), operando 100% offline e sem necessidade de conexão com a internet.
- Impacto esperado: alto (valor imediato para os usuários que já utilizam a agenda do app em produção)
- Depende de: Extensão do Modelo de Eventos (spec 015)
- Release: v1.1.1
- Status: ideia

---

### Release v1.2.0 — Conformidade Jurídica Essencial (Onboarding Legal)
> Objetivo: Estabelecer os termos legais e colher consentimento antes da abertura para convites de terceiros e crescimento da base.

#### 1. Consentimento de Termos de Uso e Políticas de Privacidade no Onboarding
- Intenção: Exibir termos e colher consentimento explícito e auditável (com versão dos termos e timestamp) no cadastro Web e Mobile, garantindo conformidade legal mínima para a entrada de novos usuários.
- Impacto esperado: alto (blindagem jurídica/LGPD)
- Depende de: nenhum
- Release: v1.2.0
- Status: ideia

---

### Release v1.3.0 — Gestão de Bandas, Convites & Push Notifications de Equipe (Modelo Híbrido)
> Objetivo: Transformar o My Roadie em uma plataforma colaborativa de equipe, permitindo criar bandas, convidar integrantes por @username ou WhatsApp e receber alertas de equipe em tempo real.

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

#### 5. Push Notifications Remotas (Convites de Banda & Atualizações da Equipe)
- Intenção: Integrar serviço de push notifications (FCM) para alertar integrantes em tempo real quando receberem um convite para entrar em uma banda ou quando um evento da banda for criado/remarcado.
- Impacto esperado: alto (comunicação em tempo real para equipes musicais)
- Depende de: Sistema de Convites Internos por @username
- Release: v1.3.0
- Status: ideia

#### 6. Dashboard Central de Métricas do Admin (Web /admin)
- Intenção: Criar a página inicial do Route Group `(admin)` na Web (`/admin`) com cards de métricas em tempo real (total de usuários cadastrados, divisão músico/roadie, bandas ativas, eventos no mês e faturamento global movimentado), servindo de central de comando da plataforma.
- Impacto esperado: alto (visibilidade executiva e monitoramento da plataforma)
- Depende de: Isolar rotas de admin em Route Group próprio (spec 002), Gestão Básica de Bandas
- Release: v1.3.0
- Status: ideia

#### 7. Gestão e Moderação de Bandas no Admin (Web /admin/bands)
- Intenção: Criar interface no Admin Web para listar todas as bandas criadas na plataforma, visualizar donos, integrantes e histórico de eventos, com ações de moderação (suspensão/exclusão de bandas impróprias).
- Impacto esperado: médio (governança de conteúdo e comunidades)
- Depende de: Dashboard Central de Métricas do Admin, Gestão Básica de Bandas
- Release: v1.3.0
- Status: ideia

#### Considerações de Design de Bandas e Convites:
- **Vantagens adotadas:** Identidade por `@username`, busca visual com foto e instrumentos, zero dependência de e-mails de terceiros e base para contratação freelance.
- **Mitigações técnicas:** Links para WhatsApp mitigam o problema do usuário não cadastrado; `BandInvite` com máquina de estados previne spam; notificações locais de agenda (v1.1.1) garantem lembretes sem internet.

---

### Release v1.4.0 — Operação de Estrada & Experiência de Palco (Kit do Dia do Show)
> Objetivo: Entregar as utilidades práticas essenciais para o deslocamento até o local e a execução do show, com alta performance e sem dependência de internet.

#### 1. Navegação Direta para o Local do Evento (Deep Links Waze & Google Maps)
- Intenção: Permitir abrir rotas no Waze, Google Maps ou Apple Maps com 1 clique a partir do endereço do evento via deep link nativo (`url_launcher`), eliminando a necessidade de SDKs pesados de mapas e custos de nuvem.
- Impacto esperado: alto (usabilidade imediata no deslocamento até a apresentação)
- Depende de: nenhum
- Release: v1.4.0
- Status: ideia

#### 2. Sincronização com a Agenda Nativa do Aparelho (iOS & Android Calendar)
- Intenção: Permitir salvar o evento na agenda pessoal do celular (Google Calendar, Apple Calendar, Outlook) com 1 toque através da API nativa do sistema operacional (`add_2_calendar`), sem exigência de OAuth2 burocrático.
- Impacto esperado: médio (conveniência e centralização de agenda pessoal)
- Depende de: nenhum
- Release: v1.4.0
- Status: ideia

#### 3. Gestão e Ordenação de Setlists por Show
- Intenção: Permitir que os músicos criem setlists vinculadas a shows específicos, reordenando músicas do repertório (`RepertoireSong`) e calculando tempo total estimado de apresentação.
- Impacto esperado: alto (preparação de repertório de shows)
- Depende de: API de Repertoire (spec 005)
- Release: v1.4.0
- Status: ideia

#### 4. Modo Palco Mobile (Stage Mode UI)
- Intenção: Interface mobile em tela cheia com modo escuro de alto contraste, tipografia ampliada de letras e cifras, prevenção de bloqueio de tela (*wakelock*) e rolagem configurável para visualização durante o show.
- Impacto esperado: alto (experiência do músico no palco)
- Depende de: Gestão e Ordenação de Setlists por Show
- Release: v1.4.0
- Status: ideia

#### 5. Conexão do Checklist de Tarefas na UI Mobile
- Intenção: Conectar a API de Tasks (spec 004) à interface mobile, permitindo gerenciar checklists operacionais vinculados a cada evento com barra de progresso no card de compromisso e contagem no painel inicial (`InfosWidget`).
- Impacto esperado: alto (operação técnica de estrada)
- Depende de: API de Tasks (spec 004), Extensão do Modelo de Eventos (spec 015)
- Release: v1.4.0
- Status: ideia

#### 6. Leitura Offline com Cache Local Inteligente (Garantia de Palco)
- Intenção: Implementar cache local (Hive/SQLite) no app mobile para garantir que agenda, setlists, repertório e tarefas fiquem acessíveis para visualização mesmo em locais de show sem sinal de internet.
- Impacto esperado: alto (confiabilidade operacional indispensável)
- Depende de: nenhum
- Release: v1.4.0
- Status: ideia

---

### Release v1.5.0 — Logística de Viagem & Módulo Financeiro Avançado
> Objetivo: Apoiar bandas com turnês e logística complexa através de Roadbook digital e rateio automático de receitas.

#### 1. Painel de Logística de Viagem (Roadbook Digital)
- Intenção: Centralizar detalhes de viagem da banda (ponto de encontro, horários de van, reserva de hotel/hospedagem e horários de alimentação) em um painel digital do evento.
- Impacto esperado: alto (organização de viagens e turnês)
- Depende de: Navegação Direta para o Local do Evento
- Release: v1.5.0
- Status: ideia

#### 2. Inventário de Carga e Equipamentos (Roadie Check)
- Intenção: Checklist especializado para controle e conferência de equipamentos, caixas, instrumentos e cabos no carregamento e descarregamento da van/veículo.
- Impacto esperado: alto (logística técnica de carga)
- Depende de: Conexão do Checklist de Tarefas na UI Mobile
- Release: v1.5.0
- Status: ideia

#### 3. Regras e Parâmetros de Rateio de Cachê por Banda
- Intenção: Configurar regras de divisão financeira na banda (percentuais por integrante ou valores fixos por função/roadie).
- Impacto esperado: alto (transparência financeira)
- Depende de: API de Transactions (spec 006), Gestão Básica de Bandas
- Release: v1.5.0
- Status: ideia

#### 4. Liquidação de Shows e Geração Automática de Repasses
- Intenção: Ao concluir um show com cachê recebido, calcular a divisão automaticamente, gerar os lançamentos individuais de repasse aos músicos/equipe e emitir extrato de prestação de contas.
- Impacto esperado: alto (fechamento financeiro sem planilhas externas)
- Depende de: Regras e Parâmetros de Rateio de Cachê por Banda
- Release: v1.5.0
- Status: ideia

---

### Release v1.6.0 — Governança Avançada, LGPD Completa & Sustentabilidade
> Objetivo: Governança de dados de longo prazo, conformidade legal madura e sustentabilidade da plataforma.

#### 1. Exclusão de Conta e Anonimização de Dados (LGPD Art. 18)
- Intenção: Disponibilizar endpoint e fluxo de exclusão de conta (`DELETE /users/me`), garantindo a remoção de dados pessoais sensíveis e anonimização de dados históricos (eventos e transações de bandas com outros membros).
- Impacto esperado: alto (risco legal/LGPD)
- Depende de: Consentimento de Termos de Uso e Políticas de Privacidade no Onboarding
- Release: v1.6.0
- Status: ideia

#### 2. Portabilidade e Exportação de Dados do Usuário (LGPD Art. 18, V)
- Intenção: Disponibilizar endpoint e interface para o usuário baixar um dump estruturado (JSON) com todos os seus dados pessoais e histórico na plataforma.
- Impacto esperado: médio (legal/LGPD)
- Depende de: nenhum
- Release: v1.6.0
- Status: ideia

#### 3. Tela de Ajuda e Relatório de Erros
- Intenção: Apresentar guias de suporte e permitir copiar/reportar o nome e a descrição detalhada de eventuais erros da plataforma.
- Impacto esperado: médio
- Depende de: nenhum
- Release: v1.6.0
- Status: ideia

#### 4. Monitoramento Operacional e Financeiro Global no Admin (Web /admin/events e /admin/transactions)
- Intenção: Disponibilizar painel no Admin Web para visualização de todos os eventos e fluxo financeiro agregado na plataforma, com filtros por data, status e exportação em CSV para relatórios de gestão.
- Impacto esperado: médio (visão de negócio e governança)
- Depende de: Dashboard Central de Métricas do Admin
- Release: v1.6.0
- Status: ideia

#### 5. Responsividade Mobile do Painel Administrativo Web
- Intenção: Garantir layout 100% responsivo com Tailwind CSS para todo o Route Group `(admin)`, permitindo ao administrador auditar usuários, moderar bandas e acompanhar métricas diretamente pelo navegador do celular (Chrome/Safari) sem o custo de manutenção de código duplicado no Flutter.
- Impacto esperado: alto (gestão prática de qualquer lugar com custo zero de manutenção mobile)
- Depende de: Dashboard Central de Métricas do Admin
- Release: v1.6.0
- Status: ideia

#### 6. Tela de Contribuições (Apoio Monetário)
- Intenção: Oferecer uma área de contribuição ou doações para apoiar o financiamento e manutenção do projeto.
- Impacto esperado: médio
- Depende de: nenhum
- Release: v1.6.0
- Status: ideia