# Checkpoint 02 — Auditoria Cruzada de Specs (012 a 018)

Data: 31/08/2026

## Visão Geral
Esta é a segunda auditoria periódica de leitura realizada no repositório My Roadie Platform, cobrindo o escopo das specs entregues desde o último checkpoint: de `012-validar-fluxo-login-API-real` até `018-distribuicao-executaveis-mvp`.

As verificações executadas abordaram:
1. **Spec → Código**: Verificação da aderência entre o comportamento especificado e o código real nos três ecossistemas (Backend NestJS, Frontend Web Next.js e Mobile Flutter).
2. **Código → Spec**: Identificação de eventuais desvios/drift após a entrega de cada spec.
3. **Spec → Docs cruzados**: Sincronização entre `backlog.md`, `spec.md` (raiz), `plan.md` (raiz), documentações em `docs/` e os arquivos de cada spec.
4. **Perguntas Específicas**:
   - Status de specs concluídas em `backlog.md`.
   - Itens de débito técnico em `plan.md` / `spec.md` (raiz) já resolvidos por specs posteriores.
   - Contradições entre specs.

---

## Tabela de Inconsistências Identificadas

| Spec | Item verificado | Achado | Severidade |
|---|---|---|---|
| 015 | Critérios de Sucesso em `specs/015-extensao-modelo-eventos-e-acoes-card/spec.md` (linhas 105–114) | Os checkboxes da seção "Critérios de Sucesso" permanecem desmarcados (`[ ]`), embora todas as tarefas T0.1 a T5.3 e o checklist em `tasks.md` estejam concluídos (`[x]`) e as funcionalidades estejam 100% implementadas no código. | Média |
| 016 | Critérios de Sucesso em `specs/016-preparacao-release-mvp/spec.md` (linhas 85–96) | Os checkboxes da seção "Critérios de Sucesso" permanecem desmarcados (`[ ]`), embora todas as tarefas T0.1 a T7.3 e o checklist em `tasks.md` estejam concluídos (`[x]`) e as funcionalidades estejam 100% implementadas no código. | Média |
| 017 | Referência à próxima spec em `specs/017-pipeline-cicd-unificado/spec.md` e `tasks.md` | O texto cita o gancho de testes E2E mobile como "preparatório para a Spec 018" (linhas 10, 19, 135, 156 do `spec.md` e linhas 19, 57 do `tasks.md`). Contudo, a Spec 018 foi alocada para "Hospedagem e Distribuição de Executáveis de Release do MVP" e o E2E mobile foi repriorizado como Spec 019 no `backlog.md`. | Baixa |
| Baseline | Seção 6 de `spec.md` da raiz ("Fora do escopo desta baseline") | A seção "não construído ainda" mantém menção textual a recursos já construídos em specs anteriores ("Exposição via API de Transaction - resolvido na spec 006" e "Integração do mobile com a API real - resolvido na spec 003"), constituindo resquício histórico da baseline v1. | Baixa |
| Backlog | Estrutura de listagem em `backlog.md` | As specs 015, 016, 017 e 018 figuram simultaneamente no bloco "📌 Status Atual de Specs (Baseline)" e na lista detalhada da "Fase 1", enquanto as specs anteriores (002 a 014) constam apenas no bloco baseline. | Baixa |

---

## Resumo dos Achados Específicos

### 1. `backlog.md` — Status de Specs Concluídas
- **Conformidade Geral:** Todas as 18 specs entregues (`001` até `018`) estão com status `Status: concluído (specs/<pasta>/)` devidamente registrado no bloco "📌 Status Atual de Specs (Baseline)".
- **Fase 1:** As entradas das specs `015`, `016`, `017` e `018` na seção temática da Fase 1 também estão marcadas como `concluído` ou `absorvido`.
- **Fases Futuras (2 a 6):** Todas as entradas mantêm o status `ideia`, sem falsos positivos ou entregas não rastreadas. A entrada "Testes de Integração Ponta a Ponta (E2E) no Mobile" está adequadamente marcada como `Status: priorizado (próxima spec / spec 019)`.

### 2. `plan.md` e `spec.md` (raiz) — Débito Técnico e Itens Resolvidos
- **`plan.md` (§8):** Todos os débitos técnicos dos itens 1, 2, 3, 5 e 6 registram a resolução formal pelas respectivas specs (004/005/006/014, 003, 001, 002). O item 7 (gaps de LGPD da `constitution.md` §10) é o único débito técnico legitimamente pendente.
- **`spec.md` (§6):** A seção 6 ("Fora do escopo desta baseline (não construído ainda)") cita entre parênteses a resolução das APIs de transações/tarefas/repertório e integração mobile, mas poderia ser limpa para deixar apenas itens genuinamente não construídos (ex.: módulo de logística).

### 3. Contradições entre Specs
- **Evolução Documentada (Spec 016 → Spec 018):** A Spec 016 adotou provisoriamente o download de binários com caminhos relativos locais (`/downloads/...`) na rota `/testers`. Durante a publicação, identificou-se que isso gerava erro 404 na Vercel. A Spec 018 registrou expressamente esse diagnóstico na Fase 0 e corrigiu o mecanismo para GitHub Releases com badges resilientes na UI. Não há contradição não tratada, mas sim uma correção arquitetural documentada.
- **Divergência de Numeração (Spec 017 → Spec 018 / 019):** Na Spec 017, a suíte de testes E2E Mobile com emulador era referenciada no texto como a futura "Spec 018". No entanto, a necessidade emergencial de sanear o CI/CD e resolver a rota `/testers` fez com que a Spec 018 assumisse a distribuição de release, deslocando o E2E Mobile para a Spec 019.

---

## Síntese por Spec no Escopo (012 a 018)

1. **Spec 012 (`012-validar-fluxo-login-API-real`)**:
   - *Spec → Código:* Verificado. `JwtStrategy` com suporte a ES256 (JWKS) e HS256, `JwtAuthGuard` com logs detalhados e exceções 401 legíveis, deduplicação de `fetchProfile` na Web (`useRef`) e Mobile (`UserNotifier`).
   - *Código → Spec:* Sem drift.
   - *Docs Cruzados:* Sincronizado.

2. **Spec 013 (`013-ajustes-ux-agenda-mobile`)**:
   - *Spec → Código:* Verificado. `CustomCalendar` com `availableGestures: AvailableGestures.horizontalSwipe` liberando a rolagem vertical do `SingleChildScrollView` da `PrincipalScreen`. Teste de regressão ativo.
   - *Código → Spec:* Sem drift.
   - *Docs Cruzados:* Sincronizado.

3. **Spec 014 (`014-corrigir-criacao-compromisso-dispositivo-fisico`)**:
   - *Spec → Código:* Verificado. Endpoints de eventos ativos no NestJS com suporte a workspace solo automático (`EventsService.create`), sanitização de payload no mobile e feedback visual com `SnackBar`.
   - *Código → Spec:* Sem drift.
   - *Docs Cruzados:* Sincronizado.

4. **Spec 015 (`015-extensao-modelo-eventos-e-acoes-card`)**:
   - *Spec → Código:* Verificado. Modelo `Event` com `startTime`, `endTime`, `type`, `fee` e cascade em `Transaction`. Sincronização automática de receita `INCOME` para `fee > 0`. Exclusão com confirmação em `CommitmentCard`.
   - *Código → Spec:* Sem drift.
   - *Docs Cruzados:* Inconsistência de checkboxes desmarcados na seção "Critérios de Sucesso" do `spec.md`.

5. **Spec 016 (`016-preparacao-release-mvp`)**:
   - *Spec → Código:* Verificado. `AppLogger` com `kDebugMode`, eliminação de JWT dos logs, nome "My Roadie" no `AndroidManifest.xml`, CORS restrito por `process.env.FRONTEND_URL`, rota `/testers` criada.
   - *Código → Spec:* Sem drift.
   - *Docs Cruzados:* Inconsistência de checkboxes desmarcados na seção "Critérios de Sucesso" do `spec.md`.

6. **Spec 017 (`017-pipeline-cicd-unificado`)**:
   - *Spec → Código:* Verificado. Pipeline no GitHub Actions com `workflow_dispatch`, detecção de paths via `dorny/paths-filter`, testes E2E de backend e web (Playwright com mocks de rede), compilação Android/iOS e CD para Render/Vercel.
   - *Código → Spec:* O bug de diff vazio no paths-filter em push para a `main` foi documentado e corrigido na Spec 018.
   - *Docs Cruzados:* Citação textual ao E2E mobile como "Spec 018" em vez de "Spec 019".

7. **Spec 018 (`018-distribuicao-executaveis-mvp`)**:
   - *Spec → Código:* Verificado. Correção de `paths-filter` com `${{ github.base_ref }}`, injeção segura de `BACKEND_URL`, simetria de nomenclatura (`my-roadie-release.apk` e `my-roadie-release.ipa`), job `publish-github-release` via tags `v*`, resiliência da página `/testers` com badges sem 404, runbook operacional em `docs/operations/release-runbook.md` e URLs em `docs/distribution/download-urls.md`.
   - *Código → Spec:* Sem drift.
   - *Docs Cruzados:* Totalmente alinhado e documentado nas baselines.

---

## Status da Resolução

- [x] **Spec 015 (`specs/015-extensao-modelo-eventos-e-acoes-card/spec.md`)**: Checkboxes da seção "Critérios de Sucesso" marcados como concluídos (`[x]`).
- [x] **Spec 016 (`specs/016-preparacao-release-mvp/spec.md`)**: Checkboxes da seção "Critérios de Sucesso" marcados como concluídos (`[x]`).
- [x] **Spec 017 (`specs/017-pipeline-cicd-unificado/spec.md`, `tasks.md`, `plan.md`)**: Todas as referências textuais ao E2E Mobile atualizadas de "Spec 018" para "Spec 019".
- [x] **`spec.md` (raiz)**: Removidas as menções residuais a itens já construídos (API de Transaction/Tasks/Repertoire e conexão mobile à API) na Seção 6 ("Fora do escopo desta baseline"), mantendo apenas o módulo de logística não construído.
- [x] **`backlog.md`**: Removidas as duplicatas das specs 015, 016, 017 e 018 (e itens absorvidos) na Fase 1, mantendo a listagem consistente com as specs 002–014 no bloco "📌 Status Atual de Specs (Baseline)".
