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
- Nunca pule fases do `tasks.md`. Implemente uma fase por vez e aguarde confirmação antes de avançar para a próxima.
- Tasks que envolvem autorização/controle de acesso (guards, checagem de ownership/membership) entram na mesma categoria de revisão manual obrigatória que as que tocam infraestrutura externa — não fecham sozinhas com "testes passando" como único critério.
- Toda vez que for fazer uma grande alteração no código — independente de onde seja (frontend, backend, banco de dados, pipeline, entre outros) — explicar antecipadamente qual alteração será feita e por quê, antes de executá-la.

## Regras para código de testes

- Código de testes deve ser alterado o mínimo possível: só pode ser modificado se uma lógica grande do código de produção for alterada, e mesmo assim somente quando não houver outra solução.
- Qualquer alteração em código de testes, por menor que seja — inclusive apagar uma linha em branco ou aparentemente irrelevante — deve ser explicada antes de ser feita.

## Comandos essenciais

Ver `constitution.md` §1 (stack) e `docs/architecture/*.md` para comandos de cada app (`backend/`, `frontend-web/`, `mobile/`).


## Fluxo de Git

- **Nunca** rode `git push` sem confirmação explícita minha na mensagem atual.
  Commits locais são permitidos pelas regras abaixo, mas subir pro remoto (push) exige minha autorização a cada vez.
- **Nunca** commite diretamente na branch `main`/`master`. Toda mudança deve ir em uma branch dedicada.
- Ao começar uma fase do `tasks.md`, crie (ou reutilize) uma branch nomeada `spec/<numero>-<nome-curto>` (ex.: `spec/002-rotas-admin`) a partir da `main` atualizada.
- A cada item de `tasks.md` marcado como concluído (`[x]`), crie um commit local específico para aquele item — não acumule várias tarefas em um commit só.
  Siga o padrão **Conventional Commits**: `<tipo>(<escopo>): <descrição curta>`.

  Tipos a usar conforme a natureza do item:
  - `feat` — nova funcionalidade (Fases 1, 2, 3)
  - `test` — testes unitários ou de integração (Fases 4, 5)
  - `build` — empacotamento, instalador, assinatura de código (Fase 6)
  - `ci` — pipeline de CI/CD (Fase 7)
  - `chore` — setup de projeto, estrutura de pastas, dependências (Fase 0)
  - `docs` — documentação (README, spec/plan/tasks, seção 8.1 revisões)
  - `fix` — correção de bug encontrado durante revisão

  Escopo = nome da feature/área afetada (ex.: `image-to-pdf`, `merge-pdf`, `shared`,
  `ci`, `packaging`). Exemplos:
  - `chore(setup): criar estrutura de pastas do projeto`
  - `feat(image-to-pdf): conectar file_picker para seleção de imagens`
  - `test(image-to-pdf): testes unitários positivos do controller`
  - `build(windows): configurar assinatura de código com signtool`
  - `ci(pipeline): adicionar job de dependency_check`

  Se um item corrigir algo quebrado por um commit anterior (ex.: durante revisão de
  outro agente), use `fix` mesmo que a mudança esteja dentro da mesma fase.
- Não abra Pull Request nem faça merge para `main` sem eu pedir explicitamente.
- Se em algum momento não estiver claro se uma ação conta como "push" (ex.: criar tag, criar release, sincronizar branch remota), trate como push e peça confirmação antes.

---
*Se `GEMINI.md` e este arquivo divergirem em alguma convenção, `constitution.md` é o desempate — atualize ambos para refletir o que está lá.*
