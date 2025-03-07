# VMSO - Sistema de Gerenciamento de Ordens de Serviço

VMSO é um sistema completo para gerenciamento de ordens de serviço, clientes e serviços. Desenvolvido com React, TypeScript e Tailwind CSS, oferece uma interface moderna e responsiva para empresas que precisam gerenciar seus serviços de forma eficiente.

## Características

- **Dashboard Intuitivo**: Visualize métricas importantes e status de ordens de serviço em tempo real
- **Gerenciamento de Clientes**: Cadastre, edite e gerencie informações de clientes
- **Ordens de Serviço**: Crie e acompanhe ordens de serviço com detalhes completos
- **Busca Avançada**: Encontre rapidamente clientes e ordens de serviço com filtros personalizados
- **Responsivo**: Interface adaptada para dispositivos móveis e desktop
- **Tema Claro/Escuro**: Suporte a preferências de tema do usuário
- **Notificações**: Sistema de notificações para manter usuários informados

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite
- **Estilização**: Tailwind CSS, Shadcn UI
- **Gerenciamento de Estado**: React Context API, TanStack Query
- **Backend**: Supabase (Autenticação, Banco de Dados)
- **Hospedagem**: Netlify

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase (para backend)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/vmso.git
   cd vmso
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Acesse o aplicativo em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   ├── layout/     # Componentes de layout (Navbar, Sidebar, Footer)
│   └── ui/         # Componentes de interface
├── contexts/       # Contextos React para gerenciamento de estado
├── hooks/          # Hooks personalizados
├── lib/            # Utilitários e configurações
├── pages/          # Páginas da aplicação
├── services/       # Serviços para comunicação com API
└── types/          # Definições de tipos TypeScript
```

## Deploy no Netlify

### Configuração Automática

1. Faça login no Netlify
2. Clique em "New site from Git"
3. Selecione o repositório do projeto
4. Configure as seguintes opções de build:
   - Build command: `npm run build` ou `yarn build`
   - Publish directory: `dist`
5. Adicione as variáveis de ambiente necessárias (as mesmas do arquivo `.env`)
6. Clique em "Deploy site"

### Configuração Manual

1. Construa o projeto:
   ```bash
   npm run build
   # ou
   yarn build
   ```

2. Instale a CLI do Netlify:
   ```bash
   npm install -g netlify-cli
   ```

3. Faça login e deploy:
   ```bash
   netlify login
   netlify deploy --prod
   ```

## Configuração de Redirecionamento para SPA

Crie um arquivo `netlify.toml` na raiz do projeto com o seguinte conteúdo:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Este arquivo garante que as rotas do React Router funcionem corretamente no Netlify.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Rafael Paragon - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

---

© 2023 Direitos reservados VirtualMark | Desenvolvido por Rafael Paragon
