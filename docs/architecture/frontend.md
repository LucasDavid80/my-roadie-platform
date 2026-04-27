# 💻 Frontend Architecture - Web

Este documento descreve a arquitetura da aplicação web do My Roadie, localizada no diretório `/frontend-web`.

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Linguagem:** TypeScript
- **Estilização:** [Tailwind CSS / Styled Components] - _Ajustar conforme sua preferência_
- **Gerenciamento de Estado:** [Context API / Redux / Zustand]
- **Consumo de API:** [Axios / Fetch API]

## 🏗️ Estrutura de Pastas

A aplicação segue a estrutura padrão do Next.js (App Router ou Pages) com organização por interesse:

- `src/app/` ou `src/pages/`: Definição de rotas e layouts da aplicação.
- `src/components/`: Componentes de interface reutilizáveis (Botões, Cards, Modais).
- `src/hooks/`: Hooks customizados para lógica de interface e consumo de dados.
- `src/services/`: Configuração de clientes HTTP e chamadas para o backend NestJS.

## 🔄 Integração com o Ecossistema

O frontend-web atua como a interface administrativa e de visualização para músicos e roadies:

1. **Comunicação com o Backend:** Consome a API NestJS utilizando variáveis de ambiente para definir a URL base.
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
