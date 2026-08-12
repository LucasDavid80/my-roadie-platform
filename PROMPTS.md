# 🤖 PROMPTS.md — Biblioteca de prompts para o agente (agy / Gemini CLI)

> Cada prompt aqui é escopado a **uma coisa só** (uma task, uma fase, uma checagem) — nunca "faça a feature inteira", porque isso é o que faz o agente abrir subagentes em paralelo e estourar a cota do plano Pro. Copie o prompt, preencha os `<placeholders>`, cole no terminal.

---

## 0. Iniciar uma spec nova (garantindo a branch certa)

```
Antes de qualquer task, confirme a branch atual com git branch --show-current.

Se não for spec/<numero>-<nome-curto>, pare e crie:
  git checkout main
  git pull
  git checkout -b spec/<numero>-<nome-curto>

Só depois disso, leia AGENTS.md, constitution.md e
specs/<numero>-<nome-curto>/{spec.md,plan.md,tasks.md} e comece a
Fase 1. Se em algum momento aparecer no git status um arquivo que não
tem relação com esta spec, pare e me avise antes de continuar.
```

## 1. Esqueleto genérico (para qualquer task nova)

```
Leia AGENTS.md, constitution.md e specs/<pasta-da-feature>/{spec.md,plan.md,tasks.md}
antes de fazer qualquer coisa.

Execute apenas a <Fase X / task TX.X> de tasks.md.
Não implemente nada fora do que está descrito em spec.md.
Siga exatamente o "como" descrito em plan.md — não invente uma abordagem diferente.
Antes de qualquer alteração me explique o que irá fazer e o porque.

Ao terminar, marque o checkbox da task em tasks.md e pare.
Não siga para a próxima task sem eu confirmar.
```

---

## 1.1 Esqueleto genérico (para qualquer task nova)

```
Antes de qualquer task, confirme a branch atual com git branch --show-current.

Se não for spec/<numero>-<nome-curto>, pare e crie:
  git checkout main
  git pull
  git checkout -b spec/<numero>-<nome-curto>

Só depois disso, leia AGENTS.md, constitution.md e specs/<pasta-da-feature>/{spec.md,plan.md,tasks.md}
antes de fazer qualquer coisa.

Execute apenas a <Fase X / task TX.X> de tasks.md.
Não implemente nada fora do que está descrito em spec.md.
Siga exatamente o "como" descrito em plan.md — não invente uma abordagem diferente.

Ao terminar, marque o checkbox da task em tasks.md e pare.
Não siga para a próxima task sem eu confirmar.
```

---

## 2. Rodar e revisar testes (com cobertura)

```
Leia constitution.md §5 (meta de cobertura 80-90%) antes de responder.

Rode a suíte de testes de <backend | frontend-web | mobile> com cobertura:
- backend: npm test -- --coverage
- frontend-web: npm test -- --coverage
- mobile: flutter test --coverage

Reporte:
1. O número REAL de cobertura (nunca estimado) por categoria
   (statements/branches/functions/lines).
2. Quais arquivos ficaram abaixo de 80% e por quê, em uma frase cada.
3. NÃO escreva teste novo ainda — só reporte. Se eu pedir para subir
   a cobertura, isso vira um prompt separado (ver seção 3).

Não altere código de produto neste prompt.
```

## 3. Escrever testes para subir cobertura de um arquivo específico

```
Leia constitution.md §5 antes de começar.

Escreva testes para <caminho/do/arquivo> visando cobrir os caminhos
que faltam (ver relatório de cobertura em <caminho/coverage>).

Regras:
- Pelo menos 1 caso positivo e 1 caso negativo/erro por função pública.
- Não simule cobertura com testes vazios ou sem asserção real.
- Use os mocks/padrões já existentes no arquivo de teste irmão mais
  próximo (ex.: outro *.spec.ts do mesmo módulo) em vez de inventar
  um padrão novo.

Ao final, rode a suíte de novo e reporte a cobertura antes/depois
desse arquivo especificamente.
```

## 4. Rodar o pipeline localmente antes de abrir PR

```
Simule o CI localmente antes de eu abrir a PR:

1. Rode `act pull_request --secret-file .secrets` na raiz do repo (backend/frontend-web e mobile
   conforme os jobs definidos em .github/workflows/ci.yml).
2. Se algum job falhar, me diga qual job, qual step, e a causa provável
   — não tente corrigir automaticamente sem eu confirmar o diagnóstico.
3. Se todos os jobs passarem, confirme isso e não faça mais nada.
4. Rode todos ou o máximo de jobs possíveis.
```

## 5. Lint e formatação

```
Rode o lint de <backend | frontend-web | mobile>
(npm run lint | npm run lint | flutter analyze).

Para cada aviso:
- Se for variável não utilizada, prefira refatorar (ex.: catch binding
  opcional `catch {}`) em vez de desativar a regra do ESLint
  (constitution.md / code-standards.md).
- Não desative regras de lint sem eu aprovar explicitamente.

Aplique `--fix` apenas onde for seguro (formatação), e me liste
separadamente os avisos que exigem mudança de lógica.
```

## 6. Migração de schema Prisma

```
Leia constitution.md §3 antes de começar.

Vou alterar o model <NomeDoModel> em backend/prisma/schema.prisma da
seguinte forma: <descrever a mudança>.

Depois de eu confirmar o schema.prisma editado:
1. Gere a migration (npx prisma migrate dev --name <nome-da-migration>).
2. Rode npx prisma generate.
3. Atualize docs/database/erd.md para refletir a mudança.
4. Me avise quais DTOs/entities do backend e quais tipos do
   frontend-web / models do mobile ficaram desatualizados por causa
   dessa mudança — não os corrija ainda, só liste.

Não aplique a migration em nenhum banco além do de desenvolvimento local.
```

## 7. Revisar task concluída por agente que toca infraestrutura externa

```
A task <TX.X> foi marcada como concluída, mas ela toca infraestrutura
externa (Supabase, variável de ambiente, deploy, assinatura de app,
CI/CD).

Antes de eu considerar essa task realmente fechada, me dê um resumo:
1. O que exatamente foi alterado/configurado.
2. O que NÃO foi possível verificar automaticamente (ex.: algo que só
   se confirma olhando o painel do Supabase, ou rodando em produção).
3. Uma lista curta do que eu preciso checar manualmente antes de dar
   como concluído de verdade.

Não desmarque nem remarque o checkbox — só me dê a lista de verificação.
```

## 8. Fechar uma feature (checklist final)

```
Leia specs/<pasta-da-feature>/tasks.md, seção "Checklist de fechamento
da feature".

Para cada item do checklist, verifique e reporte true/false com uma
linha de evidência (ex.: "lint limpo: true — npm run lint sem erros").

Se algum item estiver false, não tente resolvê-lo sozinho — apenas
liste o que falta.

Se tudo estiver true, atualize spec.md (raiz, baseline) e plan.md
(raiz, baseline) para refletir a nova feature, e remova a entrada
correspondente do backlog.md.
```

## 9. Promover uma ideia do backlog.md para spec nova

```
Leia backlog.md e constitution.md §8 (fluxo de feature nova).

Pegue a entrada "<nome da ideia>" do backlog.md e crie a pasta
specs/<próximo-número>-<nome-curto>/ com:
- spec.md: o quê e por quê, sem detalhe de implementação, baseado na
  intenção já descrita no backlog.
- plan.md: como, tecnicamente, respeitando constitution.md — se
  precisar de uma decisão técnica que a constitution não cobre,
  PARE e me pergunte em vez de decidir sozinho.
- tasks.md: passos executáveis, com critério de teste por task,
  seguindo o formato de specs/001-auditoria-infraestrutura/tasks.md
  como referência de estilo.

Depois de criar os três arquivos, atualize o status dessa entrada em
backlog.md para "em spec → specs/<pasta-criada>/" e pare — não comece
a implementar ainda.
```

## 10. Auditoria / medição (sem mudar código de produto)

```
Leia specs/<pasta-da-feature>/{spec.md,plan.md,tasks.md}.

Esta task é só de medição/leitura, não de implementação:
<descrever o que medir/confirmar, ex.: "cobertura real do backend"
ou "qual biblioteca de estado o frontend-web usa de fato">.

Reporte o número/decisão REAL encontrado (nunca estime ou presuma).
Atualize apenas os arquivos de documentação indicados em plan.md
desta spec. Não toque em nenhum arquivo de código de produto.
```

## 11. Corrigir um teste ou build quebrado

```
O <teste "<nome>" | build> de <backend | frontend-web | mobile> está
falhando com o erro abaixo:

<colar o erro>

Diagnostique a causa raiz antes de alterar qualquer código — me
explique em 2-3 frases o que está quebrando e por quê. Só depois da
minha confirmação, aplique a correção mínima necessária (não
aproveite para refatorar mais nada ao redor).
```

---

## Notas de uso

- Sempre rode um prompt por vez e confira o resultado antes do próximo — mesmo dentro da mesma fase.
- Se o agente tentar "adiantar" tasks futuras sem você pedir, interrompa e reforce o escopo do prompt 1.
- Prompts 6 e 7 exigem sua confirmação explícita antes de qualquer ação em infraestrutura real — não pule essa etapa mesmo com pressa.
- **Fechamento é sempre chat novo.** Qualquer prompt de checklist (7, 8) roda numa
  conversa separada da que implementou a fase — evita o agente "confirmar o próprio
  trabalho" em vez de verificar de fato. Foi assim que os checkboxes falsos da spec
  002 e 006 passaram batido.
- 1 chat por fase, não por task (perde continuidade útil) nem por spec inteira
  (degrada com o acúmulo de contexto).