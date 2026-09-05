---
name: coverage-guard
description: >-
  Verifica e audita a cobertura de testes automatizados no Backend, Frontend Web e Mobile,
  garantindo o cumprimento do piso de 80% exigido pela constitution.md §5.
---

# 🛡️ Skill: Coverage Guard — My Roadie Platform

Esta skill instrui o agente sobre como auditar, executar e validar o limiar mínimo de **80% de cobertura de código** nos três aplicativos do monorepo, conforme estipulado na `constitution.md` §5.

---

## 1. Princípios de Cobertura

1. **Piso Mínimo de 80% Independente:**
   * A cobertura alta em um app não compensa a baixa no outro.
   * `backend/`, `frontend-web/` e `mobile/` são auditados separadamente.
2. **Critério de Bloqueio:**
   * Nenhuma spec que adicione lógica de negócio pode ser fechada se a cobertura cair abaixo de 80% nos arquivos modificados/criados.
3. **Padrão por Gravidade:**
   * Módulos normais: no mínimo 1 caso positivo + 1 caso negativo/borda.
   * Módulos críticos (Auth, Guards, Transações financeiras): no mínimo 3 casos positivos + 3 negativos.

---

## 2. Comandos de Auditoria por Aplicação

### A. Backend (`backend/`) — Jest
Executar a partir da pasta `backend/`:
```bash
npm test -- --coverage
```
* **Limiares definidos:**
  * Branches: 80%
  * Functions: 85%
  * Lines: 85%
  * Statements: 85%
* **Onde inspecionar:** Tabela de cobertura impressa no terminal ou em `backend/coverage/lcov-report/index.html`.

### B. Frontend Web (`frontend-web/`) — Vitest
Executar a partir da pasta `frontend-web/`:
```bash
npm test -- --coverage
```
* **Onde inspecionar:** Tabela de cobertura no console ou em `frontend-web/coverage/index.html`.

### C. Mobile (`mobile/`) — Flutter Test
Executar a partir da pasta `mobile/`:
```bash
flutter test --coverage
```
* **Arquivo gerado:** `mobile/coverage/lcov.info`
* **Arquivos desconsiderados:** Código gerado (`*.g.dart`, `*.freezed.dart`).

---

## 3. Fluxo de Execução da Skill

Quando acionado para validar a cobertura da spec:
1. Identifique qual das frentes foi impactada (`backend`, `web` ou `mobile`);
2. Execute o comando de teste com flag de coverage correspondente;
3. Se algum arquivo novo/modificado estiver com cobertura < 80%:
   * Liste para o usuário os métodos ou linhas não cobertas;
   * Implemente os testes complementares antes de prosseguir com o checklist de fechamento;
4. Se todos os arquivos atingirem >= 80%:
   * Declare a conformidade de qualidade para a spec em `tasks.md`.
