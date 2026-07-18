# AGENTS.md — My Roadie Platform

> Contexto persistente para agentes de código (ex.: `agy` / Antigravity). O **Gemini CLI** usa `GEMINI.md` na raiz do repositório — mantenha os dois arquivos sincronizados em conteúdo, mas sem duplicar texto longo: este arquivo aponta para as fontes de verdade em vez de repeti-las.

## Fontes de verdade (leia nesta ordem)

1. `constitution.md` — princípios e convenções que não mudam por feature.
2. `spec.md` (raiz, baseline) e `specs/<feature>/spec.md` (por feature) — o que deve existir.
3. `plan.md` (raiz, baseline) e `specs/<feature>/plan.md` — como construir.
4. `specs/<feature>/tasks.md` — passos executáveis da feature atual.
5. `backlog.md` — ideias de features futuras ainda não priorizadas (não implementar a partir daqui sem virar spec primeiro).

## Regras operacionais para o agente

- Não iniciar implementação de uma feature sem `spec.md` + `plan.md` + `tasks.md` dela existirem.
- **Antes de qualquer task, confirmar a branch atual (`git branch --show-current`) e conferir que ela é `spec/<numero-da-spec-em-questão>`.** Se a branch não bater com a spec pedida no prompt, parar e avisar — não seguir na branch errada.
- Ao marcar uma task como concluída em `tasks.md`, isso é uma alegação que será revisada por humano quando envolver infraestrutura externa (Supabase, variáveis de ambiente, CI, assinatura de app) — não assumir que "marcado como feito" = "verificado".
- Mudança em `prisma/schema.prisma` sempre é seguida de `npx prisma generate` e atualização de `docs/database/erd.md`.
- Evitar prompts amplos do tipo `/goal` que disparam múltiplos subagentes em paralelo — preferir tarefas escopadas por fase/task para não estourar a cota do plano Pro.
- Este repositório é um monorepo com três apps (`backend`, `frontend-web`, `mobile`) tratados como serviços independentes — não assumir que um comando rodado na raiz afeta os três.

## Comandos essenciais

Ver `constitution.md` §1 (stack) e `docs/architecture/*.md` para comandos de cada app (`backend/`, `frontend-web/`, `mobile/`).

---
*Se `GEMINI.md` e este arquivo divergirem em alguma convenção, `constitution.md` é o desempate — atualize ambos para refletir o que está lá.*
