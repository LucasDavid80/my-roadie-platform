# 🧭 Backlog — My Roadie Platform

> Ideias de features futuras ficam aqui, organizadas por **fases lógicas de desenvolvimento** para garantir dependências claras, estabilidade contínua e evolução progressiva da plataforma.
> Quando uma entrada é escolhida para entrar em desenvolvimento, ela ganha uma pasta `specs/<numero>-<nome-curto>/` com `spec.md`, `plan.md` e `tasks.md`, e seu status é atualizado nesta lista.

## Como preencher uma entrada

```markdown
### <Nome curto da ideia>
- Intenção: <1-2 frases: o problema que resolve ou o valor que entrega>
- Impacto esperado: <alto / médio / baixo>
- Depende de: <outra feature, gap técnico do plan.md, ou "nenhum">
- Status: ideia | priorizado | em spec | em desenvolvimento | concluído
```

---

## 📌 Status Atual de Specs (Baseline)

### Auditoria de Infraestrutura
- Intenção: Medir cobertura real de testes em todas as frentes e confirmar a stack do frontend-web.
- Impacto esperado: médio (governança)
- Depende de: nenhum
- Status: concluído (specs/001-auditoria-infraestrutura/)

### Isolar rotas de admin em Route Group próprio
- Intenção: Separar `(admin)` de `(dashboard)` na Web com guard de papel dedicado (`ADMIN`), conforme `constitution.md` §9.
- Impacto esperado: médio (segurança/arquitetura)
- Depende de: nenhum
- Status: concluído (specs/002-isolar-rotas-admin/)

### Conectar Mobile à API real
- Intenção: Integrar as telas de perfil e agenda do app mobile aos endpoints reais do backend NestJS.
- Impacto esperado: alto
- Depende de: nenhum
- Status: concluído (specs/003-mobile-conectado-api-real/)

### API de Tasks
- Intenção: Criar o módulo NestJS de gerenciamento de tarefas (`Task`) vinculadas a eventos.
- Impacto esperado: alto
- Depende de: nenhum
- Status: concluído (specs/004-api-de-tasks/)

### API de Repertoire
- Intenção: Expor `RepertoireSong` via backend para gestão de repertório por banda.
- Impacto esperado: médio
- Depende de: nenhum
- Status: concluído (specs/005-api-de-repertorio/)

### API de Transactions
- Intenção: Expor `Transaction` via backend para gestão financeira por banda.
- Impacto esperado: alto
- Depende de: nenhum
- Status: concluído (specs/006-api-de-transactions/)

### Atualizar Lista de Compromissos após Criação
- Intenção: Atualizar reativamente a lista de compromissos e o calendário no mobile imediatamente após criação/edição de eventos.
- Impacto esperado: alto
- Depende de: Mobile conectado à API real (spec 003)
- Status: concluído (specs/007-atualizar-lista-de-compromissos/)

### Conectar formulário de Login ao authProvider real (Supabase)
- Intenção: Impedir o bypass de login com dados aleatórios, conectando o botão de submissão do `LoginForm` ao `authProvider` real.
- Impacto esperado: alto (crítico/segurança)
- Depende de: nenhum
- Status: concluído (specs/008-conectar-form-de-login-authProvider/)

### Correção de Carregamento e Salvamento do Perfil (Mobile)
- Intenção: Garantir que a tela de perfil no mobile carregue e salve os dados do usuário corretamente com mensagens de erro reais na UI e token JWT válido.
- Impacto esperado: alto (bug crítico/perfil)
- Depende de: nenhum
- Status: concluído (specs/009-correcao-area-de-perfil/)

### Correção da tela de cadastro na Web e sincronização no Supabase Auth (Mobile)
- Intenção: Corrigir o acesso à tela de cadastro no frontend-web (`/register`) e garantir o registro no Supabase Auth e PostgreSQL via NestJS durante o cadastro mobile.
- Impacto esperado: alto (bug crítico/cadastro)
- Depende de: nenhum
- Status: concluído (specs/010-correcao-login-e-cadastro/)

### Autorização por Banda (Tasks, Repertoire, Transactions)
- Intenção: Garantir que os módulos tasks, repertoire e transactions verifiquem associação com a Band dona do recurso via BandMember, corrigindo vulnerabilidade de segurança.
- Impacto esperado: alto (crítico/segurança)
- Depende de: nenhum
- Status: concluído (specs/011-autorizacao-por-banda/)

### Validar e testar fluxo de Login com API Real
- Intenção: Verificar a estabilidade do fluxo de login contra a API de autenticação real e criar testes adicionais de integração.
- Impacto esperado: alto
- Depende de: Conectar formulário de Login ao authProvider real (Supabase)
- Status: concluído (specs/012-validar-fluxo-login-API-real/)

### Ajustes de UX na Agenda (Mobile)
- Intenção: Ajustar o layout da tela de Agenda no mobile para permitir rolagem, evitando que o calendário trave a tela verticalmente.
- Impacto esperado: alto (usabilidade)
- Depende de: nenhum
- Status: concluído (specs/013-ajustes-ux-agenda-mobile/)

### Corrigir criação de compromisso no dispositivo físico
- Intenção: Investigar e corrigir a falha em que um novo compromisso não é criado ao usar o app mobile em um aparelho físico (ativação de endpoints de eventos, sanitização de payload e feedback de erro na UI).
- Impacto esperado: alto (bug crítico/agenda)
- Depende de: Mobile conectado à API real (spec 003), Atualização da lista de compromissos após criação (spec 007)
- Status: concluído (specs/014-corrigir-criacao-compromisso-dispositivo-fisico/)

### Extensão do Modelo de Eventos & Ações do Card de Compromisso (Horários, Cachê e Exclusão)
- Intenção: Estender o modelo `Event` no Prisma e backend NestJS para suportar e persistir `startTime`, `endTime`, `type` e `fee`, sincronizar automaticamente receitas em `Transaction` quando houver cachê (`fee > 0`), conectar o botão de deletar em `CommitmentCard` com confirmação ao fluxo de remoção do `AgendaController`, e ajustar layout/dinamismo do formulário `NewAppointmentWidget`.
- Impacto esperado: alto (completude da agenda, usabilidade e integração financeira)
- Depende de: Corrigir criação de compromisso no dispositivo físico (spec 014)
- Status: concluído (specs/015-extensao-modelo-eventos-e-acoes-card/)

### Preparação para Release do MVP & Padronização de Logs (AppLogger)
- Intenção: Criar utilitário centralizado `AppLogger` com proteção `kDebugMode` para eliminar `debugPrint`s que expõem tokens e dados sensíveis em compilações de release, ajustar a identidade da aplicação para "My Roadie" (`android:label`), restringir CORS no backend, publicar frontend-web com rota `/testers` para distribuição de builds, e automatizar geração de APK e IPA (via runner macOS do GitHub Actions) para testes fechados com usuários reais.
- Impacto esperado: alto (segurança, privacidade e prontidão para release)
- Depende de: Extensão do Modelo de Eventos & Ações do Card de Compromisso (spec 015)
- Status: concluído (specs/016-preparacao-release-mvp/) — release do MVP para testes fechados entregue

---

## 🚀 Trilhas de Evolução Priorizadas

---

## Fase 1: Estabilização, Segurança & Bugs Críticos (Fundação Sólida)
*Justificativa:* Correção de falhas bloqueantes e vulnerabilidades de segurança antes do lançamento de novas funcionalidades de negócios. Garante estabilidade base em Auth e UI.

### Extensão do Modelo de Eventos & Ações do Card de Compromisso (Horários, Cachê e Exclusão)
- Intenção: Estender o modelo `Event` no Prisma e backend NestJS para persistir `startTime`, `endTime`, `type` e `fee`, sincronizar automaticamente receitas em `Transaction` (`INCOME`), conectar a ação de exclusão de compromissos com confirmação no `CommitmentCard`, exibir dinamicamente o campo de cachê para `Show`/`Gravação` e centralizar o botão de submissão no `NewAppointmentWidget`.
- Impacto esperado: alto (completude da agenda, usabilidade e integração financeira)
- Depende de: Corrigir criação de compromisso no dispositivo físico (spec 014)
- Status: concluído (specs/015-extensao-modelo-eventos-e-acoes-card/)

### Ajuste de layout horizontal do card "Novo Compromisso" e campos
- Intenção: Ajustar o card de Novo Compromisso para que não fique achatado lateralmente e redimensionar os campos horizontalmente.
- Impacto esperado: médio (visual/UI)
- Depende de: nenhum
- Status: absorvido (integrado em specs/015-extensao-modelo-eventos-e-acoes-card/)

### Centralizar botão "Criar Compromisso"
- Intenção: Centralizar o botão de submissão do formulário de novo compromisso, atualmente alinhado à esquerda.
- Impacto esperado: baixo (alinhamento visual)
- Depende de: nenhum
- Status: absorvido (integrado em specs/015-extensao-modelo-eventos-e-acoes-card/)

### Testes de Integração Ponta a Ponta (E2E) no Mobile
- Intenção: Criar suíte de testes E2E para o aplicativo mobile utilizando o pacote `integration_test` do Flutter, validando fluxos completos (autenticação, visualização/edição de perfil e ciclo da agenda) em ambiente de execução real/emulador.
- Impacto esperado: alto (qualidade e confiabilidade de entrega)
- Depende de: Corrigir criação de compromisso no dispositivo físico (spec 014), Validar e testar fluxo de Login com API Real (spec 012)
- Status: ideia

### Pipeline CI/CD Unificado & Modernizado (E2E, Deploy Contínuo e Otimização de Custos)
- Intenção: Unificar as melhores práticas do histórico do CI/CD, combinando a estabilidade e eficiência de custos da versão atual (filtros de paths/mensagens de commit, JDK 17, Android SDK e runner macOS para iOS) com a completude funcional da versão histórica (estágio de testes E2E com Playwright para Web/API, automação de Continuous Deployment na Vercel e Render, suporte a `workflow_dispatch` para disparo manual sob demanda de builds/releases de mobile/web, e notificações de status).
- Impacto esperado: alto (automação de entrega contínua, confiabilidade e governança)
- Depende de: nenhum
- Status: priorizado

### Auditoria e Otimização de Performance do Pipeline CI/CD (Speed & Caching)
- Intenção: Medir, diagnosticar e otimizar os tempos de execução do GitHub Actions através de caching avançado multi-camadas (Gradle/Android cache, Next.js build cache, Flutter pub cache e node_modules), paralelização inteligente e detecção automática estrita de arquivos alterados via `paths-filter` nativo (garantindo que jobs de `mobile` e runners macOS só sejam acionados quando houver modificação real na pasta `mobile/`), reduzindo o tempo de feedback nos PRs e o consumo da cota gratuita.
- Impacto esperado: alto (redução de tempo de espera nos PRs e economia de minutos de CI)
- Depende de: Pipeline CI/CD Unificado & Modernizado
- Status: priorizado

---

### Fase 2: Conformidade Legal, Privacidade & Governança (LGPD)
*Justificativa:* Estabelece as regras jurídicas, privacidade de dados e conformidade antes do onboarding em massa de músicos e roadies.

### Termos de Uso e Políticas da Plataforma
- Intenção: Exibir e colher consentimento dos Termos de Uso e Políticas de Privacidade durante o cadastro no mobile e web.
- Impacto esperado: alto (legal/LGPD)
- Depende de: nenhum
- Status: ideia

### Fechar gaps de LGPD (ver constitution.md §10)
- Intenção: Consentimento explícito no cadastro, política de exclusão de conta (hard delete vs. anonimização), endpoint de exportação de dados, confirmar região/criptografia do Supabase.
- Impacto esperado: alto (risco legal/reputacional)
- Depende de: Termos de Uso e Políticas da Plataforma
- Status: ideia

---

### Fase 3: Operação de Show & Experiência de Palco (Aproveitamento das APIs nativas)
*Justificativa:* Constrói as ferramentas operacionais de uso direto no ensaio e show, alavancando as APIs já desenvolvidas (`Repertoire` — spec 005 e `Tasks` — spec 004).

### Gestão de Setlists com Visualizador de Letras/Cifras (Modo Palco)
- Intenção: Permitir que os músicos criem setlists de shows a partir do repertório cadastrado e utilizem o Modo Palco (offline, letras e cifras ampliadas).
- Impacto esperado: alto
- Depende de: API de Repertoire (spec 005)
- Status: ideia

### Checklist Operacional de Eventos & Inventário de Carga (Roadie Check)
- Intenção: Conectar a API de Tasks (spec 004) à interface mobile, permitindo gerenciar checklists operacionais vinculados a cada evento (passagem de som, afazeres técnicos, check-in/check-out de carga da van) com barra de progresso no card de compromisso e contagem real de tarefas concluídas no painel inicial (`InfosWidget`).
- Impacto esperado: alto (operação de estrada e valor para roadies)
- Depende de: API de Tasks (spec 004), Extensão do Modelo de Eventos (spec 015)
- Status: ideia

### Persistência Local e Sincronização Offline (Offline-First)
- Intenção: Implementar cache/banco local (ex.: Hive ou SQLite) no app mobile para permitir criar, visualizar e editar compromissos sem sinal de internet, sincronizando os dados com o backend NestJS quando a conexão for reestabelecida.
- Impacto esperado: alto (confiabilidade em palcos, festivais e estradas)
- Depende de: Atualização da lista de compromissos após criação (spec 007)
- Status: ideia

---

### Fase 4: Logística, Geolocalização & Integração de Agenda
*Justificativa:* Estende a gestão de compromissos para a rotina de viagem e rotas da equipe técnica e músicos.

### Notificações locais/push no App Mobile
- Intenção: Implementar alertas e lembretes de compromissos por notificações (push/locais) no aplicativo móvel.
- Impacto esperado: alto
- Depende de: Atualização da lista de compromissos após criação (spec 007)
- Status: ideia

### Integração de Localização com Google Maps
- Intenção: Integrar a API do Google Maps para exibir o endereço do compromisso e permitir a navegação a partir da tela do evento.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia

### Painel de Logística de Viagem (Roadbook Digital)
- Intenção: Centralizar detalhes operacionais de logística como ponto de encontro, hotel, passagens, alimentação e horários da estrada em formato digital.
- Impacto esperado: alto
- Depende de: Integração de Localização com Google Maps, Notificações locais/push
- Status: ideia

### Sincronização de Agenda com Calendários Externos
- Intenção: Permitir a exportação/sincronização automática dos compromissos da plataforma com Google Calendar e Apple Calendar.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia

---

### Fase 5: Módulo Financeiro Avançado
*Justificativa:* Potencializa a API financeira (`Transactions` — spec 006) criando utilitários de divisão de receitas entre integrantes e equipe.

### Divisão Automatizada de Cachê (Cache Splitter)
- Intenção: Dividir automaticamente o cachê do show entre músicos e roadies com base em percentuais ou valores fixos configurados na banda.
- Impacto esperado: alto
- Depende de: API de Transactions (spec 006)
- Status: ideia

---

### Fase 6: Suporte, Governança & Sustentabilidade da Plataforma
*Justificativa:* Recursos de suporte, manutenção contínua, governança de acesso e sustentabilidade do projeto.

### Tela de Ajuda e Relatório de Erros
- Intenção: Apresentar guias de suporte e permitir copiar/reportar o nome e a descrição detalhada de eventuais erros da plataforma.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia

### Avaliação de Módulo Administrativo no Mobile
- Intenção: Decidir/implementar se haverá um painel de administração simplificado no app móvel ou se a gestão ficará 100% restrita ao painel Web.
- Impacto esperado: baixo/médio
- Depende de: Isolar rotas de admin em Route Group próprio
- Status: ideia

### Tela de Contribuições (Apoio Monetário)
- Intenção: Oferecer uma área de contribuição ou doações para apoiar o financiamento e manutenção do projeto.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia
