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

### API de Repertoire
- Intenção: Expor `RepertoireSong` via backend para gestão de repertório por banda.
- Impacto esperado: médio
- Depende de: nenhum
- Status: concluído (specs/005-api-de-repertorio/)

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

---

## 🚀 Trilhas de Evolução Priorizadas

---

### Fase 1: Estabilização, Segurança & Bugs Críticos (Fundação Sólida)
*Justificativa:* Correção de falhas bloqueantes e vulnerabilidades de segurança antes do lançamento de novas funcionalidades de negócios. Garante estabilidade base em Auth e UI.

### Correção de erro de tela vermelha na área de usuários/perfil
- Intenção: Corrigir a quebra de renderização (tela vermelha) ao clicar/entrar na área de perfil/usuários no app mobile.
- Impacto esperado: alto (bug crítico/bloqueante)
- Depende de: nenhum
- Status: em spec → specs/009-correcao-area-de-perfil/

### Validar e testar fluxo de Login com API Real
- Intenção: Verificar a estabilidade do fluxo de login contra a API de autenticação real e criar testes adicionais de integração.
- Impacto esperado: alto
- Depende de: Conectar formulário de Login ao authProvider real (Supabase)
- Status: ideia

### Isolar rotas de admin em Route Group próprio
- Intenção: Separar `(admin)` de `(dashboard)` na Web com guard de papel dedicado, conforme `constitution.md` §9.
- Impacto esperado: médio (segurança/arquitetura)
- Depende de: nenhum
- Status: ideia

### Habilitar rolagem na tela de Agenda
- Intenção: Ajustar o layout da tela de Agenda no mobile para permitir rolagem, evitando que o calendário trave a tela verticalmente.
- Impacto esperado: alto (usabilidade)
- Depende de: nenhum
- Status: ideia

### Ajuste de layout horizontal do card "Novo Compromisso" e campos
- Intenção: Ajustar o card de Novo Compromisso para que não fique achatado lateralmente e redimensionar os campos horizontalmente.
- Impacto esperado: médio (visual/UI)
- Depende de: nenhum
- Status: ideia

### Centralizar botão "Criar Compromisso"
- Intenção: Centralizar o botão de submissão do formulário de novo compromisso, atualmente alinhado à esquerda.
- Impacto esperado: baixo (alinhamento visual)
- Depende de: nenhum
- Status: ideia

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

### Inventário de Equipamentos & Checklist de Carga (Roadie Check)
- Intenção: Oferecer um painel de inventário de equipamentos por banda para fazer check-in/check-out em transportes de shows (evitando perdas).
- Impacto esperado: alto
- Depende de: API de Tasks (spec 004)
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
