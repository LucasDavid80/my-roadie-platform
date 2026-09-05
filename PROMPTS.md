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

## 1.1 Esqueleto genérico (para qualquer task nova com checagem de branch)

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
Antes de qualquer alteração me explique o que irá fazer e o porquê.

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

## 3. Escrever testes para subir cobertura de um arquivo/módulo específico

```
Leia constitution.md §5 antes de começar.

Escreva testes para <caminho/do/arquivo-ou-modulo> visando cobrir os caminhos
que faltam (ver relatório de cobertura em <caminho/coverage ou rodar com --coverage>).

Regras:
- Pelo menos 2 casos positivos e 2 casos negativos/erros por função pública (ou 3 positivos e 3 negativos para módulos críticos: auth, guards, financeiro).
- Não simule cobertura com testes vazios ou sem asserção real.
- Use os mocks/padrões já existentes no arquivo de teste irmão mais
  próximo (ex.: outro *.spec.ts do mesmo módulo) em vez de inventar
  um padrão novo.

Ao final, rode a suíte de novo e reporte a cobertura antes/depois
desse arquivo/módulo especificamente.
```

## 4. Rodar o pipeline localmente antes de abrir PR

```
Simule o CI localmente antes de eu abrir a PR:

1. Rode `act pull_request --secret-file .secrets` na raiz do repo (backend/frontend-web e mobile
   conforme os jobs definidos em .github/workflows/ci.yml).
2. Se algum job falhar, me diga qual job, qual step, e a causa provável
   — não tente corrigir automaticamente sem eu confirmar o diagnóstico.
3. Se todos os jobs passarem, confirme isso e não faça mais nada.
4. Rode todos os jobs e apresente uma análise individual do status de cada um.
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
Leia AGENTS.md, constitution.md e specs/<pasta-da-feature>/{spec.md,plan.md,tasks.md} antes de fazer qualquer coisa.

Leia specs/<pasta-da-feature>/tasks.md, seção "Checklist de fechamento da feature".

Para cada item do checklist, verifique e reporte true/false com uma
linha de evidência (ex.: "lint limpo: true — npm run lint sem erros").

Se algum item estiver false, não tente resolvê-lo sozinho — apenas
liste o que falta.

Se tudo estiver true:
1. Atualize spec.md (raiz, baseline) e plan.md (raiz, baseline) para refletir a nova feature.
2. Atualize o status da entrada correspondente em backlog.md para "concluído (specs/<pasta-da-feature>/)" (NÃO remova a entrada).
3. Marque os checkboxes de Critérios de Sucesso em spec.md e o Checklist de fechamento em tasks.md juntos no mesmo passo (fechamento atômico conforme AGENTS.md).
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
  como referência de estilo (caso necessário crie mais do que 3 fases; não é obrigatório se limitar a 3 fases padronizadas, pode se inspirar no formato de specs/011-autorizacao-por-banda/tasks.md ou specs/015-extensao-modelo-eventos-e-acoes-card/tasks.md).

Depois de criar os três arquivos, atualize o status dessa entrada em
backlog.md para "em spec → specs/<pasta-criada>/" e pare — não comece
a implementar ainda.

[Opcional: Inclua como contexto adicional os problemas ou comportamentos reais já enfrentados para que o plano e os testes cubram esses casos de borda além do caminho feliz.]
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

## 12. Auditoria de fechamento (spec → código → docs, obrigatória após toda spec)

```
Esta é uma auditoria, não uma implementação — não altere nenhum
código de produto neste prompt, só documentação e verificação.

Rode em 3 etapas, uma de cada vez, sem pular:

ETAPA 1 — Spec → Código:
Leia specs/<pasta-da-feature>/tasks.md. Para cada item do checklist
de fechamento, não confie no [x] — abra o(s) arquivo(s) reais
envolvidos (view/grep) e confirme que o comportamento descrito
existe de fato no código atual, não só que o arquivo existe.
Reporte true/false com o caminho do arquivo que você checou como
evidência.

ETAPA 2 — Código → Spec (drift reverso):
Rode `git log --oneline -- <arquivos tocados nesta spec>` desde o
merge desta spec. Se qualquer um mudou depois do fechamento,
explique o que mudou e se o motivo real (causa raiz, decisão
técnica) está refletido no plan.md desta spec. Se não estiver,
aponte isso — não corrija sozinho.

ETAPA 3 — Spec → Docs cruzados:
Confirme que esta spec está refletida como "concluído
(specs/<pasta>/)" em backlog.md, e que spec.md/plan.md da raiz
citam o comportamento novo. Aponte qualquer entrada desatualizada
— inclusive em specs ANTERIORES, se você notar durante a leitura.

Ao final das 3 etapas, liste tudo que está inconsistente (sem
corrigir). Só depois da minha confirmação, corrija os arquivos de
documentação (nunca código de produto) apontados.
```

## 13. Checkpoint periódico (auditoria cruzada de todas as specs)

```
Esta é uma auditoria de leitura — não altere código de produto neste
prompt.

Escopo: todas as specs em specs/ desde o último checkpoint (ver
audits/INDEX.md para saber onde parou; se não houver nenhum, é o
primeiro — cobre 001 até a mais recente).

Para cada spec no escopo, rode as 3 etapas do prompt 12 (spec→código,
código→spec, spec→docs cruzados) — mas resumidamente, focando só em
achar inconsistência, não repetir toda a checagem linha a linha se
já foi feita no fechamento dela.

Além disso, cheque especificamente:
1. backlog.md — toda entrada que corresponde a uma spec já concluída
   está com "Status: concluído (specs/<pasta>/)"?
2. plan.md e spec.md da raiz — algum item da seção de débito técnico
   já foi resolvido por spec posterior mas continua listado como
   pendente?
3. Duas specs se contradizem em algum ponto (ex.: uma diz que X foi
   descartado, outra assume que X é verdade)?

Escreva o relatório em audits/checkpoint-<NN>.md com uma tabela:
| Spec | Item verificado | Achado | Severidade |

Ao final, adicione uma linha em audits/INDEX.md resumindo este
checkpoint. NÃO corrija nada ainda — pare aqui e me mostre o
relatório primeiro.
```

---

## 14. Segurança — Backend (mindset adversarial)

```
Você vai atuar como um atacante mal-intencionado tentando comprometer a API
backend (NestJS) do My Roadie, com o objetivo de causar o máximo de dano
possível: roubo de dados de outros usuários, escalonamento de privilégio,
corrupção ou exclusão de dados que não são seus, ou negação de serviço.

Isto é uma auditoria de segurança autorizada pelo dono do repositório sobre
o próprio código, rodando em ambiente local/de desenvolvimento — NUNCA
contra a URL de produção. Não altere código de produto neste prompt.

Percorra sistematicamente `backend/src/modules/` (users, events, tasks,
repertoire, transactions, band-access, auth) e, para cada endpoint, tente
ativamente:

1. **Escalonamento de privilégio / mass assignment**: algum DTO aceita um
   campo (ex.: `role`, `id`, `bandId`, `createdById`, `userId`) que deveria
   ser imutável pelo próprio usuário, mas que chega direto no
   `prisma.<model>.update()`/`create()` sem filtragem? Teste especificamente
   se um usuário MUSICIAN/ROADIE comum consegue alterar seu próprio `role`
   para ADMIN via algum endpoint de update de perfil.
2. **IDOR (Insecure Direct Object Reference)**: algum endpoint que recebe um
   `:id` na URL retorna ou modifica o recurso sem checar de fato que o
   usuário autenticado tem relação com ele (ownership ou membership de
   banda), em vez de confiar apenas na guard estar presente no decorator?
3. **Bypass de guard por composição de rotas**: existe algum endpoint sem
   `@UseGuards(JwtAuthGuard)`, ou que usa `OwnershipGuard`/`BandAccessService`
   de forma incompleta (ex.: valida no controller mas não no service, ou
   valida só no `GET` e esquece o `PATCH`/`DELETE` do mesmo recurso)?
4. **Injeção via Prisma**: existe algum uso de `$queryRaw`/`$executeRaw` ou
   concatenação de string em query? (Se não houver, confirme isso
   explicitamente como ponto positivo, não pule a checagem.)
5. **Exposição de dados sensíveis em respostas**: algum endpoint retorna o
   objeto Prisma completo (ex.: `return user` sem select) vazando campos
   internos, hash, ou dados de outros usuários relacionados (ex.: lista de
   membros de banda vazando email de terceiros pra quem não é membro)?
6. **Negação de serviço**: existe alguma rota sem paginação que pode ser
   usada pra puxar volume arbitrário de dados (`findMany` sem `take`/`limit`)?
   Existe rate limiting em alguma camada? (Se não houver, confirme
   explicitamente a ausência.)
7. **CORS e cabeçalhos**: `main.ts` restringe origem corretamente? Existe
   `helmet` ou equivalente configurando cabeçalhos de segurança (HSTS,
   X-Content-Type-Options, etc.)?

Para cada achado, escreva um teste de reprodução mínimo no padrão dos specs
já existentes (`*.e2e-spec.ts` em `backend/test/`), rodando só contra o
banco de teste local — NUNCA contra produção — comprovando o problema.
Não escreva a correção ainda.

Salve o relatório bruto em `audits/security/backend-<data>.md` (crie a
pasta `audits/security/` se não existir e confirme que ela está no
`.gitignore` antes de escrever qualquer coisa nela — se não estiver, pare e
me avise antes de continuar) com uma tabela:

| Endpoint | Categoria (OWASP-like) | Achado | Severidade (Crítica/Alta/Média/Baixa) | Teste que comprova |

Não corrija nada. Não crie nem edite backlog.md. Pare aqui.
```

## 15. Segurança — Frontend-web (mindset adversarial)

```
Você vai atuar como um atacante mal-intencionado tentando comprometer a
aplicação frontend-web (Next.js) do My Roadie. Auditoria autorizada, rodando
localmente, sem tocar em produção. Não altere código de produto.

Foque especificamente em:

1. **Guard de rota client-side vs. enforcement real**: o `(admin)` Route
   Group usa `ProtectedRoute` como componente `'use client'`. Isso é só UX
   ou existe uma segunda camada de verificação? Um usuário consegue ver o
   HTML/dados renderizados de uma página admin antes do redirect acontecer
   (flash de conteúdo), ou acessar uma Server Action/API route protegida
   apenas por essa checagem client-side, sem o backend validar o role de
   novo?
2. **Exposição de segredos no bundle**: rode `npm run build` e inspecione o
   output (`.next/`) atrás de qualquer `NEXT_PUBLIC_*` que não devesse ser
   público, ou de chaves/segredos que vazaram pro bundle do cliente por
   engano (ex.: `SUPABASE_SERVICE_ROLE` sendo importado em um arquivo que
   também é usado client-side).
3. **XSS**: existe algum lugar renderizando HTML/markdown de input do
   usuário sem sanitização (`dangerouslySetInnerHTML` ou equivalente)?
4. **CSRF em ações state-changing**: como a sessão do Supabase Auth é
   enviada nas chamadas Axios para o backend — via header Authorization
   (seguro contra CSRF) ou via cookie automático (precisa de proteção
   CSRF explícita)?
5. **Validação client-side como única defesa**: para cada formulário que
   chama a API, confirme que a mesma validação existe no backend (DTO)
   e não apenas no schema do formulário do frontend.

Salve o relatório bruto em `audits/security/frontend-web-<data>.md` (mesma
regra: confirme que `audits/security/` está no `.gitignore` antes de
escrever). Mesma tabela do prompt 14. Não corrija nada. Não crie nem edite
backlog.md. Pare aqui.
```

## 16. Segurança — Mobile (mindset adversarial)

```
Você vai atuar como um atacante mal-intencionado com acesso físico ou via
engenharia reversa a um dispositivo/APK do My Roadie mobile. Auditoria
autorizada, sem tocar em infraestrutura de produção. Não altere código de
produto.

Foque especificamente em:

1. **Armazenamento do token JWT/sessão**: onde exatamente a sessão do
   Supabase Auth é persistida no dispositivo (`SharedPreferences`/
   `NSUserDefaults` via plugin padrão, ou algo como `flutter_secure_storage`
   com Keystore/Keychain)? Se for armazenamento não-criptografado, isso é
   um achado de severidade alta — um app malicioso ou alguém com acesso ao
   dispositivo/backup consegue ler o token.
2. **Vazamento de dados sensíveis em log**: mesmo com o `AppLogger`
   (spec 016) protegido por `kDebugMode`, confirme que nenhum log residual
   de senha, token completo, ou payload de resposta sensível escapa em
   build de release — teste rodando `flutter build apk --release` e
   inspecionando se `kDebugMode` realmente é `false` no binário final.
3. **Certificate pinning**: existe alguma proteção contra
   man-in-the-middle (ex.: interceptação via proxy tipo Burp/mitmproxy) nas
   chamadas HTTP para `BACKEND_URL`? Se não houver, confirme isso
   explicitamente — não é obrigatório pra esse estágio do produto, mas
   precisa estar documentado como decisão consciente, não omissão.
4. **`BACKEND_URL` e segredos em tempo de build**: o valor injetado via
   `--dart-define=BACKEND_URL=...` fica visível fazendo strings/decompile
   do APK/IPA gerado? Isso é esperado (não é segredo, é só a URL da API),
   mas confirme que nenhum outro `--dart-define` com valor sensível está
   sendo usado do mesmo jeito.
5. **Deep links / intents**: o app registra algum deep link ou intent
   filter que poderia ser explorado por outro app malicioso instalado no
   mesmo dispositivo pra injetar dados ou navegar pra uma tela autenticada
   fora do fluxo esperado?

Salve o relatório bruto em `audits/security/mobile-<data>.md` (mesma regra
de `.gitignore`). Mesma tabela do prompt 14. Não corrija nada. Não crie nem
edite backlog.md. Pare aqui.
```

## 17. Segurança — Banco de Dados / Prisma (mindset adversarial)

```
Você vai atuar como um atacante mal-intencionado que já conseguiu algum
nível de acesso (ex.: via um dos endpoints da API) e quer maximizar o dano
a partir da estrutura do banco de dados. Auditoria autorizada, sem rodar
nada contra o banco de produção — apenas leitura de `backend/prisma/
schema.prisma` e das migrations, e testes contra o banco local/de teste.
Não altere código de produto nem rode migrations reais.

Foque especificamente em:

1. **Falta de constraints que permitiriam dado inconsistente/malicioso**:
   algum campo que deveria ter limite de tamanho (ex.: `bio`, `description`)
   não tem, abrindo espaço pra payload gigante como vetor de DoS de
   armazenamento? Algum relacionamento sem `onDelete` explícito que deveria
   ter cascade ou restrict (verifique TODOS os relacionamentos, não só os
   já documentados)?
2. **Escalonamento via relação, não via campo direto**: mesmo se o campo
   `role` do User for corrigido no DTO (achado do prompt 14), existe algum
   outro caminho pelo schema que permita um usuário se inserir como membro
   de uma `Band` que não é dele (`BandMember`) manipulando IDs em algum
   payload de criação, sem que o backend valide de fato a origem do
   `bandId`/`userId` recebido?
3. **Dados sensíveis sem controle de acesso a nível de coluna**: campos
   como `minCache` (informação financeira pessoal) ou `email` são
   retornados pra qualquer membro de uma banda, ou só pra quem deveria ver?
   Isso é uma checagem cruzada com os services (não é limitação do schema
   em si, mas do uso que os services fazem dele).
4. **Enumeration attack**: os IDs são UUID (`@default(uuid())` — bom, não
   são sequenciais/adivinháveis). Confirme isso explicitamente como ponto
   positivo e não pule a checagem.

Salve o relatório bruto em `audits/security/database-<data>.md` (mesma
regra de `.gitignore`). Mesma tabela do prompt 14. Não corrija nada. Não
crie nem edite backlog.md. Pare aqui.
```

## 18. Segurança — CI/CD, Secrets e Supply Chain (mindset adversarial)

```
Você vai atuar como um atacante mal-intencionado tentando comprometer o
pipeline de CI/CD ou roubar segredos/credenciais do My Roadie a partir do
repositório público/privado no GitHub. Auditoria autorizada, apenas leitura
— não dispare workflows reais nem altere `.github/workflows/ci.yml`.

Foque especificamente em:

1. **Segredos vazados no histórico do git**: rode uma varredura (ex.:
   `git log -p -- '*.env*'` e grep por padrões de chave/token comuns:
   `SUPABASE`, `JWT_SECRET`, `sk_`, `AIza`, chaves de 32+ caracteres
   hexadecimais) em todo o histórico de commits, não só no HEAD atual —
   um segredo removido num commit posterior ainda existe no histórico.
2. **Uso inseguro de `pull_request_target` ou permissões excessivas**: o
   workflow usa `pull_request_target` (que roda com secrets mesmo em PRs de
   forks não confiáveis) em algum job? As permissões do `GITHUB_TOKEN`
   estão restritas ao mínimo necessário (`permissions:` no topo do YAML) ou
   usam o padrão amplo?
3. **Injeção via input de workflow_dispatch**: os inputs
   (`scope`, `backend_url`, `run_mobile_e2e`, `publish_release`) são usados
   em algum lugar do YAML de forma que permita injeção de comando shell
   (ex.: `run: echo ${{ inputs.algo }}` sem passar por variável de
   ambiente intermediária)?
4. **Actions de terceiros sem pin por hash**: as actions usadas
   (`dorny/paths-filter@v3`, `softprops/action-gh-release@v2`, etc.) estão
   fixadas por tag mutável (`@v3`) ou por commit SHA? Tag mutável é um
   vetor real de supply chain attack se a action for comprometida depois.
5. **Exposição de `BACKEND_URL`/segredos nos artefatos publicados**: os
   binários APK/IPA publicados como GitHub Release (públicos) contêm
   algum segredo além da URL pública da API?

Salve o relatório bruto em `audits/security/cicd-supply-chain-<data>.md`
(mesma regra de `.gitignore`). Mesma tabela do prompt 14. Não corrija nada.
Não crie nem edite backlog.md. Pare aqui.
```

## 19. Segurança — Triagem e Consolidação (roda por último, depois dos prompts 14-18)

```
Leia todos os relatórios em `audits/security/*.md` gerados pelos prompts
14 a 18 (não gere achado novo, só consolide).

1. Junte os achados numa única tabela em
   `audits/security/consolidado-<data>.md`, ordenada por severidade
   (Crítica → Alta → Média → Baixa), com a coluna extra "Área"
   (Backend/Frontend/Mobile/Database/CI-CD).
2. Para achados Crítica/Alta: NÃO coloque em backlog.md. Liste-os
   separadamente no topo do relatório consolidado sob o título
   "⚠️ Correção imediata necessária — não esperar ciclo de spec" — vou
   decidir com você, nesta conversa, como corrigir cada um antes de
   qualquer outra coisa.
3. Para achados Média/Baixa: escreva uma versão SANITIZADA (sem passo a
   passo de exploração, só a descrição do risco e a área afetada) de cada
   um como entrada nova em backlog.md, seguindo o formato padrão já usado
   (Intenção/Impacto esperado/Depende de/Status: ideia), agrupadas sob um
   novo cabeçalho de fase ou dentro da Fase 1 (decida você o
   agrupamento e me avise qual escolheu).
4. Confirme, antes de terminar, que `audits/security/` está listada no
   `.gitignore` e que nenhum relatório bruto (com detalhe de exploração)
   foi commitado.

Não altere código de produto neste prompt. Pare ao final e me mostre o
relatório consolidado antes de eu decidir os próximos passos.
```

---

## 20. Instrutor

```

Você vai atuar como instrutor técnico, me ensinando a plataforma My Roadie do zero até o
nível de "eu consigo explicar e alterar qualquer parte com confiança". Não é uma sessão de
implementação — não altere nenhum arquivo. Seu papel aqui é só explicar, mostrar código real
do repositório e verificar se eu entendi antes de avançar.

## Como conduzir

- Ensine em módulos pequenos, um por vez, na ordem abaixo. Ao final de cada módulo, faça
  1-2 perguntas pra checar meu entendimento antes de passar pro próximo — não decore isso
  a fórmula, adapte à minha resposta.
- Sempre que explicar um conceito, mostre o trecho de código real do repositório que
  implementa aquilo (com o caminho do arquivo), não pseudocódigo genérico.
- Priorize o "por quê" sobre o "o quê": eu já sei ler código, quero entender a decisão por
  trás — por que essa camada existe, que problema ela evita, o que quebraria se não
  existisse.
- Onde uma decisão foi tomada por causa de um bug/incidente real do histórico do projeto
  (ex.: o algoritmo de validação de JWT, o auto-provisionamento de banda), conte o contexto
  do porquê aquilo existe daquele jeito.
- Se eu pedir pra ir mais devagar num módulo ou pular um que eu já domino, siga meu ritmo.

## Currículo (nesta ordem)

1. **Visão geral e fluxo de uma requisição de ponta a ponta** — pegue um caso concreto
   (ex.: criar um compromisso pelo mobile) e trace o caminho completo: widget → controller
   Riverpod → repository → datasource → API NestJS → guard → service → Prisma → Postgres,
   e a resposta voltando. Isso me dá o mapa mental antes de entrar em detalhe por módulo.

2. **Backend — módulos de domínio**: para cada um (`users`, `events`, `tasks`, `repertoire`,
   `transactions`, `band-access`), explique a responsabilidade, os endpoints principais e
   como ele se relaciona com os outros módulos.

3. **Backend — autenticação e autorização em camadas**: `JwtStrategy` (incluindo por que
   ela decide o algoritmo antes de validar), `JwtAuthGuard`, `OwnershipGuard` e
   `BandAccessService` — como as quatro peças se encaixam numa requisição protegida.

4. **Modelo de dados (Prisma)**: os 6 modelos e seus relacionamentos, com atenção especial
   pros cascades (Event→Task, Event→Transaction) e por que essas decisões de integridade
   foram tomadas.

5. **Mobile — Clean Architecture na prática**: percorra as camadas `domain/data/presentation`
   com um fluxo real (ex.: o de perfil, já que teve bastante história de bug), mostrando como
   a inversão de dependência funciona de verdade no Riverpod (provider retornando a
   interface, não a implementação).

6. **Frontend-web — Route Groups e integração com Supabase Auth**: como `(auth)`,
   `(dashboard)` e `(admin)` se isolam, e como a sessão flui do Supabase Auth até as
   chamadas pra API.

7. **CI/CD**: o grafo de jobs do `.github/workflows/ci.yml`, o papel do `paths-filter`,
   e como o gancho `run_mobile_e2e` vai ser usado pela spec 019.

8. **Débito técnico e gaps conhecidos**: passe pelos itens do `plan.md` §8 e pelos pontos
   fracos arquiteturais que já mapeamos (observabilidade, validação de env, acoplamento do
   auto-provisionamento de banda) explicando por que cada um importa.

## Ao final de cada módulo

Pergunte se eu quero seguir pro próximo ou revisar algo antes. Não avance sozinho.

```

---

## 21. Auditoria Noturna de Segurança Autônoma (/goal)

```
Você vai conduzir uma auditoria completa e aprofundada de segurança no ecossistema
do My Roadie de forma 100% autônoma e em modo estritamente LEITURA (read-only).
Você tem autorização total para investigar o código local, mas NÃO deve modificar
nenhum arquivo de código-fonte, configuração ou banco de dados.

Seu objetivo é vasculhar todo o repositório procurando vulnerabilidades e
vetores de ataque, organizando todas as descobertas em um relatório estruturado
salvo em audits/security/audit-noturna-<data>.md.

Antes de começar:
1. Certifique-se de que a pasta audits/security/ está listada no .gitignore
   para evitar vazamento acidental de relatórios sensíveis. Se não estiver, pare.
2. Não altere arquivos de produto nem rode comandos destrutivos.
3. Não faça commits nem git push.

Foque nos seguintes eixos críticos:

1. Quebra de Autorização e Isolamento Multitenant (BOLA / IDOR / Band Isolation):
   - Verifique controllers e services do Backend (backend/src/): todo endpoint
     que manipula recursos (Event, Task, Repertoire, Transaction, User) valida
     corretamente o bandId e a adesão do usuário solicitante (BandAccessService
     ou OwnershipGuard)?
   - Existem queries diretas via Prisma onde o filtro por usuário ou banda foi
     esquecido, permitindo que um usuário veja ou modifique dados de outra banda?

2. Injeções e Sanitização de Entrada:
   - Há uso de prisma.$queryRawUnsafe ou concatenação direta de strings em
     consultas SQL?
   - No frontend-web ou backend, existem brechas para Cross-Site Scripting (XSS),
     como uso inseguro de dangerouslySetInnerHTML ou interpolação de markdown não
     sanitizado?
   - Existem comandos executados via shell (child_process.exec, etc.) com parâmetros
     não validados?

3. Autenticação e Validação de Sessão / Tokens:
   - Analise JwtStrategy e os guards: existe brecha para "alg: none" ou confusão de
     algoritmos de assinatura (RS256 vs HS256)?
   - Os tokens expirados ou revogados são rejeitados confiavelmente?
   - O frontend-web e mobile lidam com refresh tokens e armazenamento seguro de
     credenciais de forma adequada?

4. Vazamento de Segredos e Credenciais:
   - Faça uma busca por chaves de API, segredos do Supabase, JWT secrets ou credenciais
     hardcoded no código-fonte, arquivos de configuração ou fixtures de teste.
   - Verifique o histórico de commits do git procurando por remoções de .env que ainda
     possam estar persistidas no histórico (git log -S, grep).

5. Falhas em Regras de Negócio e Financeiro:
   - No módulo transactions, examine se é possível forjar transações com valores
     negativos impróprios, contornar totalizadores ou criar transações sem banda válida.
   - O auto-provisionamento de bandas possui brechas para exaustão de recursos (DoS lógico)?

6. CI/CD, Dependências e Supply Chain:
   - Analise .github/workflows/ci.yml: existem actions de terceiros sem pin por commit SHA?
   - Há inputs de workflow_dispatch interpolados diretamente em scripts shell?
   - Permissões do GITHUB_TOKEN seguem o princípio de privilégio mínimo?

Ao concluir a varredura:
- Crie o arquivo audits/security/audit-noturna-<data>.md contendo:
  - Resumo executivo da postura de segurança.
  - Tabela consolidada de achados:
    | ID | Componente | Vulnerabilidade / Risco | Severidade (Crítica/Alta/Média/Baixa) | Arquivo / Linha | Evidência / PoC Teórica | Mitigação Recomendada |
  - Seção especial destacada no topo para vulnerabilidades de severidade Crítica e Alta.
- Apresente um resumo executivo com os totais de cada severidade e termine a execução sem alterar mais nada.
```

---

## Notas de uso

- **Prompt 21 (/goal)**: Projetado para execução autônoma noturna ou prolongada via comando `/goal`. É estritamente leitura (read-only) e consolida todas as vulnerabilidades encontradas em `audits/security/audit-noturna-<data>.md`, sem alterar código ou criar commits/push.
- Sempre rode um prompt por vez e confira o resultado antes do próximo — mesmo dentro da mesma fase.
- Se o agente tentar "adiantar" tasks futuras sem você pedir, interrompa e reforce o escopo do prompt 1.
- Prompts 6 e 7 exigem sua confirmação explícita antes de qualquer ação em infraestrutura real — não pule essa etapa mesmo com pressa.
- **Fechamento é sempre chat novo.** Qualquer prompt de checklist (7, 8) roda numa
  conversa separada da que implementou a fase — evita o agente "confirmar o próprio
  trabalho" em vez de verificar de fato. Foi assim que os checkboxes falsos da spec
  002 e 006 passaram batido.
- 1 chat por fase, não por task (perde continuidade útil) nem por spec inteira
  (degrada com o acúmulo de contexto).
- **Prompts 14-18 (segurança) rodam em chats separados uns dos outros**, cada
  um numa conversa própria — assim como fechamento é sempre chat novo, cada
  área de segurança merece contexto limpo, sem o agente "carregar" o viés do
  que achou na área anterior.
- **Nunca peça pra esses prompts rodarem contra produção ou URLs reais dos
  testers** — sempre ambiente local/dev. Se o agente sugerir testar contra a
  API hospedada de verdade, interrompa.
- **`audits/security/` precisa estar no `.gitignore` antes do primeiro
  relatório ser escrito** — os prompts 14-18 checam isso, mas confirme você
  mesmo antes de rodar o primeiro, pra não arriscar commitar detalhe de
  exploração por engano num push automático.
- O prompt 19 (triagem) é o único que toca `backlog.md` nessa categoria —
  os prompts 14-18 são estritamente leitura/relatório.
