# 🔭 Visão Estratégica Futura: Expansão para Contratantes & Marketplace (v2.0+)

> ⚠️ **AVISO DE ESCOPO E FOCO ESTRATÉGICO:**  
> Este documento é um registro de **visão arquitetural e estratégica de longo prazo**. Nenhuma das funcionalidades aqui descritas faz parte do escopo atual de desenvolvimento (Releases v1.x).  
> O foco absoluto do projeto até a conclusão da versão **v1.6.0** é **100% voltado aos Músicos e Roadies** (SaaS de Gestão Operacional).  
> Este documento serve exclusivamente como repositório de conhecimento para consulta quando a plataforma atingir maturidade, tração comprovada e escala para expansão.

---

## 1. O Conceito: A Transição de Modelo

O ciclo de vida do **My Roadie** divide-se em dois grandes momentos:

1. **Fase 1 (v1.0 até v1.6.0) — SaaS Vertical Operacional (Single-Player Mode):**
   * Foco exclusivo em resolver as dores do dia a dia de músicos e roadies: agenda, repertório, tarefas de palco, comunicação de banda e controle financeiro interno.
   * Modelo de execução: Desenvolvedor Solo + Agentes de IA com custo operacional próximo de zero.
2. **Fase 2 (v2.0+) — Two-Sided Marketplace (Ecossistema Bilateral):**
   * Com centenas de músicos utilizando a plataforma e mantendo suas agendas atualizadas em tempo real, abre-se o canal para o outro lado da mesa: **Contratantes** (bares, restaurantes, noivos, produtores de festivais e eventos corporativos).

---

## 2. Análise Arquitetural (Como Arquiteto de Software)

### A. Isolamento Rígido de Domínios (Bounded Contexts)
O contratante **nunca** deve ter visibilidade sobre a intimidade operacional da banda. O sistema deve manter contextos estritamente desacoplados:

* **Domínio de Operação Interna (Privado da Banda):**
  * Repertório com anotações de tom, setlist de palco, checklists de carga/roadie, divisão interna de cachê e transações da banda.
* **Domínio de Marketplace & Catálogo (Público):**
  * Perfil público da banda/músico, fotos, vídeos integrados (YouTube/Instagram), estilos musicais, cidade/região atendida, cachê base e calendário público (dias livres vs. dias ocupados, sem revelar detalhes dos outros contratantes).
* **Domínio de Booking & Contratos (Compartilhado):**
  * Propostas comerciais, contrapropostas, aceite de rider técnico e formalização de contrato digital com validade jurídica.

### B. Infraestrutura Financeira e Modelo de Custódia (*Escrow*)
A plataforma não deve atuar apenas como classificados de contato; para capturar valor e evitar fraudes, ela opera como garantidora financeira:
* **Fluxo de Escrow:** No fechamento da data, o contratante realiza o pagamento integral. O valor fica retido em conta de custódia (via gateway de pagamentos como Asaas, Stripe Connect ou Pagar.me com split nativo).
* **Liberação Pós-Evento:** O valor só é liberado para a carteira da banda horas após o show acontecer (D+1), protegendo o contratante contra ausências (*no-show*) e o músico contra inadimplência do contratante.
* **Monetização (Take Rate):** A plataforma retém automaticamente uma taxa percentual (ex.: 10% a 15% sobre o valor do cachê bruto) diretamente no split bancário.

### C. Proteção contra Desintermediação (*Anti-Bypass*)
Músicos e contratantes tendem a fechar "por fora" pelo WhatsApp para fugir de taxas após o primeiro contato.
* **Mitigações Técnicas:** Sistema de mensageria interno (chat in-app com mascaramento de contatos e bloqueio de números de telefone/links) até que a proposta seja formalizada e o sinal pago;
* **Proposta de Valor Própria:** Garantia de pagamento em caso de chuva/cancelamento de última hora, contrato formal digital e recibo com validade contábil.

---

## 3. Análise de Engenharia & Casos de Borda (Como Engenheiro de Software)

### A. Concorrência de Agenda e Bloqueio Atômico (*Race Conditions*)
Dois contratantes tentando reservar a mesma banda para a mesma data simultaneamente:
* Implementação de reservas com tempo de expiração (*Hold Locks* de 15 minutos) usando transações atômicas no Prisma (`prisma.$transaction`).
* Durante o processo de checkout do Contratante A, a data entra em estado temporário `RESERVED_PENDING_PAYMENT`, impedindo que o Contratante B efetue a compra. Se o pagamento expirar ou falhar, a data é liberada automaticamente.

### B. Máquina de Estados do Booking
O ciclo de vida da contratação exige validações estritas em cada etapa:
```
DRAFT ➔ PROPOSED ➔ NEGOTIATING ➔ ACCEPTED ➔ PAID_ESCROW ➔ CONFIRMED ➔ IN_PROGRESS ➔ COMPLETED
                                                           ↓
                                              DISPUTED / CANCELLED
```

### C. Regras de Borda do Setor de Eventos
1. **Rider Técnico Vinculante:** O contratante assina digitalmente as exigências mínimas do palco (ex.: voltagem das tomadas, PA de som, alimentação e camarim).
2. **No-Show (Bolo no Show):** Botão de contestação com trava imediata de repasse financeiro e abertura de disputa.
3. **Cancelamento em Cima da Hora:** Cobrança de multa rescisória automática baseada na política da plataforma (ex.: 50% para cancelamento com menos de 48h retido para o músico).
4. **Hora Extra (*Overtime*):** Endpoint permitindo ao líder da banda lançar cobrança adicional pontual se o contratante solicitar tempo extra de apresentação na hora do evento.

### D. Interfaces Especializadas
* **Contratante (Foco Desktop Web - Next.js):** Experiência rica de catálogo, comparação de orçamentos, visualização de vídeos, geração de contratos e relatórios fiscais.
* **Músico (Foco Mobile App - Flutter):** Notificações push em tempo real com ações rápidas de aceite/recusa de propostas e confirmação de chegada ao local.

---

## 4. Estratégia de Startup & Governança da Expansão

### Por que manter Você + Agentes de IA até a v1.6.0?
* **Zero Risco de Quebra:** Custo de operação mínimo, sem queima de caixa com salários de equipe antes do produto estar validado.
* **Velocidade Extrema:** Decisões instantâneas de arquitetura sem reuniões burocráticas ou desalinhamento de equipe.
* **Produto Lapidado:** Quando a v1.6.0 for atingida, a plataforma terá dados consistentes de retenção, ausência de bugs graves e músicos que usam o sistema semanalmente.

### Gatilhos Reais para Iniciar a Fase de Expansão (v2.0+)
A virada de chave para buscar investimento, trazer sócios comerciais ou contratar atendimento só deve ocorrer quando:
1. **Volume Orgânico:** Músicos ativos começarem a pedir com frequência a inclusão de locais para contratação;
2. **Pressão de Demanda:** Donos de bares e contratantes começarem a procurar a plataforma espontaneamente querendo contratar os artistas cadastrados;
3. **Sobrecarga Humana:** O suporte e mediação de dúvidas começarem a tomar mais de 2 a 3 horas do dia do desenvolvedor, justificando um braço dedicado de atendimento.

---
*Este documento é congelado como diretriz técnica para o futuro e não deve ser consultado para implementação das releases ativas v1.x.*
