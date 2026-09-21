# Spec 025: Onboarding Legal (Termos de Uso e Política de Privacidade)

## 1. Objetivo
Garantir que todos os usuários da plataforma (novos e existentes) aceitem formalmente os Termos de Uso e a Política de Privacidade antes de utilizarem os serviços do My Roadie, registrando esse consentimento de forma segura e auditável no banco de dados.

## 2. Por quê
Para atingir o grau essencial de conformidade jurídica com a LGPD e preparar a plataforma para o crescimento da base de usuários (Release v1.2.0 do Backlog). É um requisito de blindagem jurídica e passo inicial obrigatório antes da liberação de fluxos como deleção de conta e exportação de dados.

## 3. Escopo
1. Modelagem no banco de dados (Prisma) para suportar versões de documentos legais e o registro do aceite (timestamp e versão aceita).
2. Criação de endpoint no Backend NestJS para aceitar e validar o consentimento de um usuário autenticado.
3. Tela/Modal de Onboarding Legal no App Mobile (Flutter) obrigando usuários a aceitar os termos antes de acessar a tela principal.
4. Tela/Modal de Onboarding Legal na Aplicação Web (Next.js) obrigando usuários a aceitarem os termos no fluxo autenticado.
5. Gatilho de verificação no login: se o usuário já existir mas não tiver aceitado a versão mais recente dos termos, bloquear a navegação principal até o aceite.
6. Acesso facilitado aos documentos em área pública (Web e Mobile).

## 4. Fora de Escopo
- Funcionalidades avançadas de LGPD (exclusão de conta, portabilidade de dados) ficam para a Release v1.6.0.
- Tradução ou internacionalização (i18n) dos documentos legais (será mantido apenas em português-BR por enquanto).
- Painel para administradores redigirem/editarem os termos dinamicamente via CMS nativo (os documentos serão estáticos e versionados na aplicação por enquanto).

## 5. Critérios de Sucesso
- [ ] Usuário recém-cadastrado precisa aceitar os termos e a política para acessar a Agenda/Dashboard.
- [ ] Consentimento do usuário fica registrado no banco de dados associado ao seu `userId`.
- [ ] Ao atualizar a versão dos termos, usuários existentes são obrigados a aceitar novamente ao logarem.
- [ ] O backend retorna os metadados da última versão dos termos na rota adequada e valida a consistência.
