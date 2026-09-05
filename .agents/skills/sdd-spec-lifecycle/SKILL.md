---
name: sdd-spec-lifecycle
description: >-
  Automatiza e padroniza o ciclo de vida de desenvolvimento guiado por especificações (Spec-Driven Development) no My Roadie Platform.
  Use sempre que for inicializar, desenvolver, testar ou fechar uma spec no repositório.
---

# 🚀 Skill: SDD Spec Lifecycle — My Roadie Platform

Esta skill define o procedimento rigoroso e padronizado para executar o ciclo de vida de qualquer funcionalidade (Spec) no monorepo **My Roadie Platform**, garantindo conformidade total com a `constitution.md`, `AGENTS.md` e `GEMINI.md`.

---

## 1. Regras Fundamentais Imutáveis

1. **Nunca inicie implementação sem os 3 arquivos essenciais:**
   * `specs/<numero>-<nome-curto>/spec.md` (O quê e por quê, sem detalhes técnicos de código);
   * `specs/<numero>-<nome-curto>/plan.md` (Como construir tecnicamente, arquitetura, dependências e DTOs);
   * `specs/<numero>-<nome-curto>/tasks.md` (Passos executáveis divididos em fases sequenciais com critérios de teste).
2. **Conferência Obrigatória de Branch:**
   * Antes de executar qualquer ação ou alteração, verifique a branch atual: `git branch --show-current`.
   * Se a branch ativa não for `spec/<numero>-<nome-curto>`, **PARE IMEDIATAMENTE** e avise o usuário. Nunca execute tarefas na branch errada ou na `main`.
3. **Explicação Prévia Obrigatória:**
   * **Antes de modificar qualquer arquivo ou configuração**, explique antecipadamente e com clareza o que será alterado e o motivo. Nunca edite primeiro para explicar depois.
4. **Commits Atômicos por Tarefa (Conventional Commits):**
   * A cada tarefa concluída em `tasks.md`, crie um commit local único: `<tipo>(<escopo>): <descrição curta>`.
   * Tipos permitidos: `feat`, `test`, `chore`, `fix`, `docs`, `build`, `ci`.
5. **Fechamento Atômico (Checklist + Critérios de Sucesso):**
   * Ao finalizar a spec, marque `[x]` no checklist de fechamento de `tasks.md` E nos checkboxes de "Critérios de Sucesso" de `spec.md` no **mesmo passo documental**.
6. **Segurança de Git:**
   * **NUNCA** execute `git push` sem autorização explícita do usuário na mensagem atual.
   * **NUNCA** faça commits diretos ou merges manuais na branch `main`. Toda integração é via Pull Request.

---

## 2. Passo a Passo: Inicialização de uma Nova Spec

Quando o usuário solicitar o início de uma nova spec (ex.: *"Inicie a Spec 023 a partir do backlog"*):

### Passo 2.1 — Criar a Branch Dedicada
```bash
git checkout main
git pull origin main
git checkout -b spec/<numero>-<nome-curto>
```

### Passo 2.2 — Criar a Estrutura de Pastas e Arquivos
Crie a pasta `specs/<numero>-<nome-curto>/` contendo:

#### `spec.md`
```markdown
# Spec — <numero>: <Nome da Feature>

## 1. Objetivo
<1-2 parágrafos claros: o problema que resolve e o valor entregue para músicos, roadies ou admin>

## 2. Por quê
<Motivação de negócio, regras da constitution.md ou feedback de usuários que justificam a entrega>

## 3. Escopo
1. <Item 1>
2. <Item 2>

## 4. Fora de Escopo
- <O que explicitamente NÃO será feito nesta spec para evitar escopo inflado>

## 5. Critérios de Sucesso
- [ ] <Critério 1 mensurável / testável>
- [ ] <Critério 2 mensurável / testável>
```

#### `plan.md`
```markdown
# Plano Técnico — <numero>: <Nome da Feature>

## 1. Arquitetura e Decisões Técnicas
<Abordagem técnica, padrões adotados, dependências e pacotes a instalar>

## 2. Modelagem de Dados / Contratos
<Alterações no schema.prisma, DTOs NestJS, interfaces TypeScript ou Models Flutter>

## 3. Estrutura de Arquivos Afetados
- `backend/src/...`
- `mobile/lib/...`
- `frontend-web/src/...`

## 4. Estratégia de Testes
<Quais testes unitários, de widget ou de integração cobrirão o piso de 80% de cobertura>
```

#### `tasks.md`
```markdown
# Tasks — <numero>: <Nome da Feature>

## Fase 0: Setup & Preparação
- [ ] T0.1: Criar branch e inicializar documentação da spec
- [ ] T0.2: Instalar dependências necessárias (se houver)

## Fase 1: Implementação (Backend / Domínio / Core)
- [ ] T1.1: Criar modelo de dados / serviço / DTOs

## Fase 2: Interface & Integração (UI / Mobile / Web)
- [ ] T2.1: Criar telas, widgets ou componentes

## Fase 3: Testes Automatizados & Qualidade
- [ ] T3.1: Implementar testes unitários cobrindo casos positivos e de borda
- [ ] T3.2: Verificar cobertura mínima de 80% (`constitution.md` §5)

## Fase 4: Fechamento & Sincronização
- [ ] T4.1: Atualizar documentação de baseline (`spec.md` e `plan.md` da raiz, se aplicável)
- [ ] T4.2: Marcar checklist de fechamento e critérios de sucesso da spec
```

---

## 3. Passo a Passo: Execução e Fechamento

1. Execute **uma fase por vez**. Nunca pule fases.
2. A cada item `[x]` marcado em `tasks.md`, execute o commit local correspondente.
3. Ao término dos testes, rode a verificação de cobertura no app afetado:
   * Backend: `npm test -- --coverage` (em `backend/`)
   * Web: `npm test -- --coverage` (em `frontend-web/`)
   * Mobile: `flutter test --coverage` (em `mobile/`)
4. Após todos os testes passarem com 80%+ de cobertura, marque o fechamento atômico em `spec.md` e `tasks.md`.
5. Solicite autorização explícita do usuário para efetuar o `git push` e abrir o Pull Request para a `main`.
