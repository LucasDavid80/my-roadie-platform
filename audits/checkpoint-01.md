# Checkpoint 01 — Auditoria Cruzada de Specs (001 a 011)

Data: 11/08/2026

## Visão Geral
Esta é a primeira auditoria periódica de leitura realizada no repositório My Roadie Platform, cobrindo o escopo das specs `001-auditoria-infraestrutura` até `011-autorizacao-por-banda`.

As verificações abordaram:
1. **Spec → Código**: Confirmação do estado das tarefas e checklists de fechamento.
2. **Código → Spec**: Identificação de eventuais desvios/drift após a entrega.
3. **Spec → Docs cruzados**: Sincronização entre `backlog.md`, `spec.md` (raiz), `plan.md` (raiz) e os arquivos de cada spec.
4. **Perguntas Específicas**:
   - Status de specs concluídas em `backlog.md`.
   - Itens de débito técnico em `plan.md` / `spec.md` já resolvidos por specs posteriores.
   - Contradições entre specs.

---

## Tabela de Inconsistências Identificadas

| Spec | Item verificado | Achado | Severidade |
|---|---|---|---|
| 001 | Checklist de fechamento em `specs/001-auditoria-infraestrutura/tasks.md` | Os checkboxes do checklist de fechamento estão desmarcados (`[ ]`), embora as tarefas T1.1 a T2.4 tenham sido concluídas (`[x]`). | Média |
| 001 | Status em `backlog.md` | A spec 001 não está registrada na lista "📌 Status Atual de Specs (Baseline)" em `backlog.md`. | Média |
| 002 | Status em `backlog.md` (Fase 1, linha 77) | A entrada "Isolar rotas de admin em Route Group próprio" permanece marcada como `Status: ideia` na Fase 1 do `backlog.md`, além de não figurar na lista de baseline concluída, apesar de estar 100% implementada no código (`frontend-web/src/app/(admin)`). | Alta |
| 002 | Seção de Débito Técnico em `plan.md` (raiz, §8 item 5) | O item 5 ("Rotas admin não isoladas") permanece listado como débito técnico pendente no `plan.md` da raiz, embora a spec 002 já tenha isolado as rotas em `(admin)`. | Alta |
| 003 | Status em `backlog.md` | A spec 003 ("Mobile conectado à API real") está concluída e é citada como dependência em `backlog.md`, mas foi omitida do bloco "📌 Status Atual de Specs (Baseline)". | Média |
| 004 | Status em `backlog.md` | A spec 004 ("API de Tasks") está concluída no código e citada como dependência em `backlog.md`, mas foi omitida do bloco "📌 Status Atual de Specs (Baseline)". | Média |
| 006 | Status em `backlog.md` | A spec 006 ("API de Transactions") está concluída no código e citada como dependência em `backlog.md`, mas foi omitida do bloco "📌 Status Atual de Specs (Baseline)". | Média |
| 011 / Backlog | Referência em item de backlog (linha 83 de `backlog.md`) | O item de backlog "Habilitar rolagem na tela de Agenda (spec 011)" possui um sufixo `(spec 011)` no título, porém a Spec 011 entregue é "Autorização por Banda". Trata-se de uma discrepância na numeração de referência no backlog. | Baixa |

---

## Resumo dos Achados Específicos

1. **backlog.md — Status de specs concluídas:**
   - As specs `005`, `007`, `008`, `009`, `010` e `011` foram registradas corretamente como `Status: concluído (specs/<pasta>/)`.
   - As specs `001`, `003`, `004` e `006` não foram incluídas na lista "📌 Status Atual de Specs (Baseline)".
   - A spec `002` permaneceu na seção "Fase 1" com `Status: ideia` em vez de ser promovida a `concluído (specs/002-isolar-rotas-admin/)`.

2. **plan.md e spec.md (raiz) — Débito técnico resolvido:**
   - No `plan.md` da raiz, Seção 8, o item **5. Rotas admin não isoladas** continua marcado como pendente, mas foi totalmente resolvido pela Spec 002.
   - Os demais itens da seção 8 (1, 2, 3 e 6) registram adequadamente a resolução pelas specs 004/005/006, 003 e 001.

3. **Contradições entre specs:**
   - Não foram encontradas contradições técnicas de arquitetura entre as specs no código (por exemplo, premissas de regras descartadas e reutilizadas). As regras de negócio evoluíram consistentemente (ex.: Spec 011 adicionou autorização por banda sobre os CRUDs das Specs 004, 005 e 006 sem quebrar contratos de resposta).
   - A única discrepância textual direta é no título do item de backlog "Habilitar rolagem na tela de Agenda (spec 011)", que vincula erroneamente a ideia futura à spec 011 de autorização por banda.

---

## Status da Resolução

- [x] **Spec 001 (`specs/001-auditoria-infraestrutura/tasks.md`)**: Checkbox de fechamento marcado (`[x]`).
- [x] **`backlog.md`**: Todas as 11 specs inseridas e sincronizadas no bloco `📌 Status Atual de Specs (Baseline)`, item de isolamento de rotas admin atualizado para `concluído (specs/002-isolar-rotas-admin/)` e referência textual em "Habilitar rolagem na tela de Agenda" corrigida.
- [x] **`plan.md` (raiz)**: Item 5 da Seção 8 atualizado registrando a conclusão da Spec 002.
