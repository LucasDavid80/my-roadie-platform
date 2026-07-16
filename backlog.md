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

## Próximas features (preencha aqui as suas ideias)

### <Ideia 1>
- Intenção:
- Impacto esperado:
- Depende de:
- Status: ideia

### <Ideia 2>
- Intenção:
- Impacto esperado:
- Depende de:
- Status: ideia
