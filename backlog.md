# 🧭 Backlog — My Roadie Platform

> Ideias de features futuras ficam aqui, curtas, até serem priorizadas. Quando uma entrada é escolhida para entrar em desenvolvimento, ela ganha uma pasta `specs/<numero>-<nome-curto>/` com `spec.md`, `plan.md` e `tasks.md`, e é removida (ou marcada como "em andamento") desta lista.

## Como preencher uma entrada

```markdown
### <Nome curto da ideia>
- Intenção: <1-2 frases: o problema que resolve ou o valor que entrega>
- Impacto esperado: <alto / médio / baixo>
- Depende de: <outra feature, gap técnico do plan.md, ou "nenhum">
- Status: ideia | priorizado | em spec | em desenvolvimento
```

---

## Gaps técnicos da baseline (ver `plan.md` §8) — candidatos naturais a virarem as primeiras specs

### API de Tasks
- Intenção: expor `Task` (checklist de eventos) via backend, hoje só existe no schema.
- Impacto esperado: alto (bloqueia qualquer feature de checklist/logística de evento)
- Depende de: nenhum
- Status: ideia

### API de Repertoire
- Intenção: expor `RepertoireSong` via backend para gestão de repertório por banda.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia

### API de Transactions
- Intenção: expor `Transaction` via backend (financeiro da banda/evento).
- Impacto esperado: alto, mas sensível — exige atenção extra a testes e autorização.
- Depende de: nenhum
- Status: ideia

---

## Novos gaps (constitution.md atualizada) — ver `plan.md` §8, itens 5-7

### Isolar rotas de admin em Route Group próprio
- Intenção: separar `(admin)` de `(dashboard)` com guard de papel dedicado, conforme `constitution.md` §9.
- Impacto esperado: médio (segurança/organização, não é feature visível ao usuário final)
- Depende de: nenhum
- Status: ideia


### Fechar gaps de LGPD (ver constitution.md §10)
- Intenção: consentimento explícito no cadastro, política de exclusão de conta (hard delete vs. anonimização), endpoint de exportação de dados, confirmar região/criptografia do Supabase. Pode virar 2-4 specs menores em vez de uma só.
- Impacto esperado: alto (risco legal/reputacional, não só técnico)
- Depende de: nenhum
- Status: ideia

---

## Melhorias e Correções de Bugs (Mobile) — Testes Manuais

### Atualização da lista de compromissos após criação
- Intenção: Garantir que a lista de compromissos da tela de Agenda seja atualizada imediatamente após a criação de um novo evento.
- Impacto esperado: alto (usabilidade)
- Depende de: nenhum
- Status: ideia

### Correção de erro de tela vermelha na área de usuários/perfil
- Intenção: Corrigir a quebra de renderização (tela vermelha) ao clicar/entrar na área de perfil/usuários.
- Impacto esperado: alto (bug crítico/bloqueante)
- Depende de: nenhum
- Status: ideia

### Habilitar rolagem na tela de Agenda
- Intenção: Ajustar o layout da tela de Agenda para permitir rolagem, evitando que o calendário trave a tela verticalmente.
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

### Validar e testar fluxo de Login com API Real
- Intenção: Verificar a estabilidade do fluxo de login contra a API de autenticação real e criar testes adicionais de integração.
- Impacto esperado: alto
- Depende de: nenhum
- Status: ideia

### Notificações locais/push no App Mobile
- Intenção: Implementar alertas e lembretes de compromissos por notificações (push/locais) no aplicativo móvel.
- Impacto esperado: alto
- Depende de: nenhum
- Status: ideia

### Integração de Localização com Google Maps
- Intenção: Integrar a API do Google Maps para exibir o endereço do compromisso e permitir a navegação a partir da tela do evento.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia

### Termos de Uso e Políticas da Plataforma
- Intenção: Exibir e colher consentimento dos Termos de Uso e Políticas de Privacidade durante o cadastro.
- Impacto esperado: alto (legal/LGPD)
- Depende de: nenhum
- Status: ideia

### Tela de Ajuda e Relatório de Erros
- Intenção: Apresentar guias de suporte e permitir copiar/reportar o nome e a descrição detalhada de eventuais erros da plataforma.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia

### Tela de Contribuições (Apoio Monetário)
- Intenção: Oferecer uma área de contribuição ou doações para apoiar o financiamento e manutenção do projeto.
- Impacto esperado: médio
- Depende de: nenhum
- Status: ideia
