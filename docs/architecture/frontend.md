# 💻 Frontend Architecture - Web

Este documento descreve a arquitetura da aplicação web do My Roadie, localizada no diretório `/frontend-web`.

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Gerenciamento de Estado:** Context API
- **Consumo de API:** Axios

## 🏗️ Estrutura de Pastas

A aplicação segue a estrutura padrão do Next.js (App Router) com organização por interesse:

- `src/app/`: Definição de rotas e layouts.
  - **Route Groups:** Pastas entre parênteses (ex: `(dashboard)`) são usadas para organizar layouts sem afetar a URL. Ex: `src/app/(dashboard)/profile/page.tsx` resolve para `/profile`.
- `src/components/`: Componentes de interface reutilizáveis.
- `src/hooks/`: Hooks customizados.
- `src/services/`: Chamadas para a API.
  - **Sanitização:** Devido ao `ValidationPipe` do backend, campos como `id`, `createdAt` e `updatedAt` devem ser removidos do corpo das requisições `POST/PATCH`.

## 🔄 Integração com o Ecossistema

1. **Comunicação com o Backend:** Consome a API NestJS. **Importante:** Sanitizar objetos antes do envio para evitar erro 400 por campos não permitidos (whitelist).
2. **Autenticação:** Integra-se diretamente com o **Supabase Auth** para gestão de sessões e persistência de login.
3. **Sincronização:** Exibe dados em tempo real vindos do Postgres (via API) para refletir as alterações feitas também no App Mobile.

## 🚀 Comandos Principais

Dentro da pasta `/frontend-web`:

```bash
# Instalar dependências
npm ci

# Rodar em modo de desenvolvimento (local)
npm run dev

# Gerar build de produção
npm run build

# Executar verificações de linting
npm run lint
```
