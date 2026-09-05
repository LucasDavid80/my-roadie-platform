---
name: conventional-commit-task
description: >-
  Padroniza e automatiza a criação de commits locais atômicos por tarefa do tasks.md,
  seguindo estritamente a especificação Conventional Commits e as regras de Git do projeto.
---

# 📦 Skill: Conventional Commit per Task — My Roadie Platform

Esta skill padroniza a criação de commits atômicos locais a cada tarefa concluída em `tasks.md`, assegurando conformidade com `AGENTS.md` e `constitution.md` §7.

---

## 1. Regras de Ouro

1. **1 Tarefa = 1 Commit:** Nunca acumule várias tarefas em um único commit. Ao marcar `[x]` em um item de `tasks.md`, o commit daquele item deve ser gerado imediatamente.
2. **Formato Obrigatório:**
   ```text
   <tipo>(<escopo>): <descrição curta em português>
   ```
3. **Commit Local Estrito:**
   * O commit é realizado **apenas localmente** na branch de trabalho `spec/...`.
   * **NUNCA** execute `git push` sem autorização explícita do usuário na mensagem atual.

---

## 2. Mapeamento de Tipos por Fase do tasks.md

| Tipo | Quando Usar | Exemplos |
| :--- | :--- | :--- |
| `chore` | Setup inicial, criação de estrutura de pastas, configuração de dependências (Fase 0) | `chore(setup): criar estrutura inicial da spec` |
| `feat` | Nova funcionalidade, novo endpoint, novo widget ou regra de negócio (Fases 1 e 2) | `feat(notifications): agendar alarme local de eventos` |
| `test` | Implementação de testes unitários, de widget ou de integração (Fase 3) | `test(notifications): adicionar testes de agendamento` |
| `fix` | Correção de bug identificado durante o desenvolvimento ou revisão | `fix(notifications): corrigir formato de data no alarme` |
| `docs` | Documentação, atualização de spec/plan/tasks ou ERD | `docs(spec): atualizar checklist de fechamento` |
| `ci` | Pipelines, automações de teste ou workflows do GitHub Actions | `ci(pipeline): adicionar step de cobertura` |
| `build` | Configurações de compilação, Gradle, Podfile ou empacotamento | `build(android): ajustar permissao de alarme exato` |

---

## 3. Escopos Válidos no Repositório

O `<escopo>` deve identificar o domínio ou módulo afetado:
* **Módulos Core:** `events`, `agenda`, `users`, `bands`, `auth`, `repertoire`, `tasks`, `transactions`
* **Novas Features:** `notifications`, `stage-mode`, `roadbook`, `setlists`, `admin`
* **Transversais:** `setup`, `deps`, `spec`, `coverage`, `infra`

---

## 4. Procedimento de Execução

1. Explique previamente a ação e a mensagem de commit ao usuário;
2. Execute `git status` para confirmar exatamente quais arquivos foram alterados;
3. Execute `git add <arquivos-específicos>` (evite `git add .` se houver arquivos não relacionados);
4. Execute `git commit -m "<tipo>(<escopo>): <descrição>"`;
5. Atualize o checkbox da tarefa em `tasks.md` para `[x]`.
