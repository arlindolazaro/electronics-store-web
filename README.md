# Electronics Store Web 🏪

Frontend de aplicação e-commerce para gerenciamento de loja de eletrônicos, desenvolvido com **React 18**, **TypeScript**, **Tailwind CSS** e **Vite**.

## Status de Progresso: 80% Completo

| Módulo           | Status          | Progresso |
| ---------------- | --------------- | --------- |
| **Autenticação** | ✅ Concluído    | 100%      |
| **Dashboard**    | ✅ Concluído    | 100%      |
| **Produtos**     | ✅ Concluído    | 100%      |
| **Vendas**       | ✅ Concluído    | 100%      |
| **Compras**      | ✅ Concluído    | 100%      |
| **Inventário**   | ✅ Concluído    | 95%       |
| **Usuários**     | ✅ Concluído    | 100%      |
| **Aprovações**   | 🔄 Em Progresso | 85%       |
| **Relatórios**   | 🔄 Em Progresso | 75%       |

## 📋 Descrição do Projeto

Interface web completa para gerenciar um e-commerce de eletrônicos, com funcionalidades para:

- **Autenticação**: Login e registro seguro com JWT
- **Produtos**: Catálogo, criação, edição e visualização de detalhes
- **Vendas**: Processamento e rastreamento de vendas
- **Compras**: Gerenciamento de pedidos com fluxo de aprovação
- **Inventário**: Controle de estoque em tempo real
- **Usuários**: Gerenciamento de perfis e permissões
- **Relatórios**: Dashboards com métricas e análises
- **Aprovações**: Fluxo de aprovação de compras

## 🚀 Tecnologias Utilizadas

### Core

- **React 18.2** - Biblioteca de UI
- **TypeScript 5.3** - Tipagem estática
- **Vite 7.2** - Bundler e servidor de desenvolvimento
- **React Router DOM 6.20** - Roteamento

### Styling

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS 8.4** - Processador de CSS

### State Management & Forms

- **Zustand 4.4** - Gerenciamento de estado
- **React Hook Form 7.48** - Gerenciamento de formulários
- **Zod 3.22** - Validação de esquemas

### API & Comunicação

- **Axios 1.6** - Cliente HTTP
- **Sonner 1.4** - Toast notifications

### UI & Utilitários

- **Lucide React 0.309** - Ícones SVG
- **Recharts 3.6** - Gráficos e visualizações
- **date-fns 3.0** - Manipulação de datas

## 📁 Estrutura do Projeto (Atualizada)

```
electronics-store-web/
├── src/
│   ├── App.tsx                                  # Componente raiz
│   ├── App.css                                  # Estilos globais
│   ├── index.css                                # Estilos de reset
│   ├── main.tsx                                 # Ponto de entrada
│   │
│   ├── components/                              # Componentes reutilizáveis
│   │   ├── common/
│   │   │   └── ProtectedRoute.tsx               # ✅ Proteção de rotas
│   │   ├── layout/
│   │   │   ├── Layout.tsx                       # ✅ Layout principal
│   │   │   ├── Navbar.tsx                       # ✅ Barra de navegação
│   │   │   └── Sidebar.tsx                      # ✅ Menu lateral
│   │   └── ui/
│   │       └── Loading.tsx                      # ✅ Componente loading
│   │
│   ├── pages/                                   # Páginas principais
│   │   ├── Login.tsx                            # ✅ 100% - Login
│   │   ├── Register.tsx                         # ✅ 100% - Registro
│   │   ├── Dashboard.tsx                        # ✅ 100% - Dashboard
│   │   ├── Perfil.tsx                           # ✅ 100% - Perfil usuário
│   │   │
│   │   ├── Produtos/                            # ✅ 100% - Gerenciamento de produtos
│   │   │   ├── ListaProdutos.tsx
│   │   │   ├── CriarProduto.tsx
│   │   │   ├── EditarProduto.tsx
│   │   │   └── DetalheProduto.tsx
│   │   │
│   │   ├── Vendas/                              # ✅ 100% - Processamento de vendas
│   │   │   ├── ListaVendas.tsx
│   │   │   ├── CriarVenda.tsx
│   │   │   ├── DetalheVenda.tsx
│   │   │   └── ConfirmarEnvio.tsx
│   │   │
│   │   ├── Compras/                             # ✅ 100% - Gestão de compras
│   │   │   ├── ListaCompras.tsx
│   │   │   ├── CriarCompra.tsx
│   │   │   ├── DetalheCompra.tsx
│   │   │   ├── AprovarCompra.tsx
│   │   │   └── ReceberCompra.tsx
│   │   │
│   │   ├── Inventario/                          # ✅ 95% - Controle de estoque
│   │   │   ├── ListaInventario.tsx
│   │   │   └── DetalheInventario.tsx
│   │   │
│   │   ├── Aprovacoes/                          # 🔄 85% - Fluxo de aprovação
│   │   │   ├── ListaAprovacoes.tsx
│   │   │   └── DetalheAprovacao.tsx
│   │   │
│   │   ├── Usuarios/                            # ✅ 100% - Gestão de usuários
│   │   │   ├── ListaUsuarios.tsx
│   │   │   ├── CriarUsuario.tsx
│   │   │   └── EditarUsuario.tsx
│   │   │
│   │   └── Relatorios/                          # 🔄 75% - Análises e métricas
│   │       ├── VendasPorPeriodo.tsx
│   │       ├── MetricasAprovacoes.tsx
│   │       └── StatusInventario.tsx
│   │
│   ├── hooks/                                   # Custom React Hooks
│   │   └── useFetch.ts                          # ✅ Hook para requisições HTTP
│   │
│   ├── services/                                # Camada de API
│   │   ├── api.ts                               # ✅ Configuração Axios base
│   │   ├── auth.service.ts                      # ✅ Serviço de autenticação
│   │   ├── produtos.service.ts                  # ✅ Serviço de produtos
│   │   ├── vendas.service.ts                    # ✅ Serviço de vendas
│   │   ├── compras.service.ts                   # ✅ Serviço de compras
│   │   ├── usuarios.service.ts                  # ✅ Serviço de usuários
│   │   └── relatorios.service.ts                # 🔄 Serviço de relatórios
│   │
│   ├── store/                                   # State Management (Zustand)
│   │   └── authStore.ts                         # ✅ Store de autenticação
│   │
│   ├── assets/                                  # Imagens e assets
│   │
│   └── utils/                                   # Funções utilitárias
│       └── formatters.ts                        # ✅ Formatadores de dados
│
├── public/                                      # Arquivos estáticos
├── .env                                         # Variáveis de ambiente
├── .env.example                                 # Exemplo de variáveis
├── index.html                                   # Template HTML
├── tailwind.config.js                           # Configuração Tailwind
├── postcss.config.js                            # Configuração PostCSS
├── vite.config.ts                               # Configuração Vite
├── tsconfig.json                                # Configuração TypeScript
├── tsconfig.app.json                            # Config TypeScript para app
├── tsconfig.node.json                           # Config TypeScript para build
├── eslint.config.js                             # Configuração ESLint
├── package.json                                 # Dependências do projeto
└── README.md
```

## 🔧 Configuração e Instalação

### Pré-requisitos

- **Node.js 18+** e **npm** (ou **yarn**) instalados
- **Backend API** rodando em http://localhost:8080/api
- Git (opcional)

### Passo 1: Clonar ou Baixar o Projeto

```bash
git clone https://github.com/arlindolazaro/electronics-store-web.git
cd electronics-store-web
```

### Passo 2: Instalar Dependências

```bash
npm install
# ou com yarn
yarn install
```

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Electronics Store
```

### Passo 4: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

# Executar testes (se configurado)

npm run test

## 📚 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento com hot reload
npm run dev

# Compilar para produção
npm run build

# Preview da build de produção
npm run preview

# Executar linter (ESLint)
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

## 🏗️ Arquitetura e Padrões

### Arquitetura em Camadas

```
Componentes (UI)
     ↓
Custom Hooks (useFetch)
     ↓
Services (API calls)
     ↓
Store (Zustand - Estado Global)
     ↓
Axios Client
     ↓
Backend API REST
```

### Padrões Utilizados

#### 1. **Custom Hook - useFetch**

Hook reutilizável para requisições HTTP com tratamento de loading e erros.

#### 2. **Service Layer**

Camada de serviço centralizada para todas as requisições API.

#### 3. **State Management com Zustand**

Store simples e reativo para estado global (autenticação, usuário).

#### 4. **Validação com Zod + React Hook Form**

Validação de formulários com schemas tipados.

#### 5. **Componente ProtectedRoute**

Proteção de rotas que requerem autenticação.

### Convenções de Código

- **Componentes**: PascalCase (`ListaProdutos.tsx`)
- **Funções/Métodos**: camelCase (`fetchProdutos()`)
- **Variáveis**: camelCase (`userName`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes**: kebab-case (Tailwind padrão)

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação:

1. Usuário faz login com credenciais
2. Backend retorna JWT token
3. Frontend armazena token no localStorage/sessionStorage
4. Token é incluído em todas as requisições (header Authorization)
5. Routes protegidas verificam autenticação antes de renderizar

## 🎨 Styling com Tailwind CSS

A aplicação utiliza **Tailwind CSS** para estilização com:

- Utility-first approach
- Configuração em `tailwind.config.js`
- Suporte a dark mode (configurável)
- Responsividade integrada

## 📡 Comunicação com Backend

### Configuração do Cliente Axios

Arquivo `src/services/api.ts` com:

- BaseURL configurável por variável de ambiente
- Timeout de 30 segundos
- Interceptadores para autentica e Status

### ✅ Concluídas (100%)

1. **Autenticação e Autorização**

   - Login seguro com JWT
   - Registro de novos usuários
   - Proteção de rotas com ProtectedRoute
   - Armazenamento de token no localStorage
   - Refresh token automático

2. **Gerenciamento de Produtos**

   - Listar, criar, editar e deletar produtos
   - Busca e filtros
   - Visualização detalhada
   - Integração com backend

3. **Processamento de Vendas**

   - Criar vendas associadas a produtos
   - Rastrear status (pendente, enviado, entregue)
   - Confirmar envio e entrega
   - Visualizar histórico

4. **Pedidos de Compra**

   - Criar pedidos de compra
   - Fluxo de aprovação completo
   - Receber mercadoria
   - Atualizar inventário automaticamente

5. **Gerenciamento de Usuários**
   - Listar usuários
   - Criar e editar usuários
   - Gerenciar permissões e papéis
   - Visualizar perfil

### 🔄 Em Progresso (75-95%)

6. **Controle de Inventário** (95%)

   - Visualizar estoque em tempo real
   - Rastrear movimentação
   - Alertas de estoque baixo
   - _Pendente: Configuração de alertas automáticos_

7. **Fluxo de Aprovações** (85%)

   - Dashboard de tarefas de aprovação
   - Aprovar ou rejeitar pedidos
   - Histórico de aprovações
   - _Pendente: Notificações em tempo real_

8. **Relatórios e Análises** (75%)
   - Vendas por período com gráficos
   - Métricas de aprovação
   - Status de inventário
   - *Pendente: Exportação de dados em PDF/Excel*com gráficos

- Métricas de aprovação
- Status de inventário
- Exportação de dados

## 🐛 Troubleshooting

### Erro: CORS

Verificar configuração CORS no backend e URL base em `.env`

### Erro: Token expirado

Implementar refresh token automático nos interceptadores

### Erro: Componentes não atualizam

Verificar uso correto de hooks e Zustand

### Build falha com erros TypeScript

```bash
npm run type-check
```

## 📝 Contribuindo

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Guia de Estilo

- Use TypeScript em todos os arquivos `.ts` e `.tsx`
- Siga as convenções de nome do projeto
- Mantenha componentes pequenos e reutilizáveis
- Documente componentes complexos

## 📦 Build e Deploy

### Compilar para Produção

```bash
npm run build
```

Gera pasta `dist/` pronta para deploy.

### Deploy em Vercel

```bash
npm install -g vercel
vercel
```

### Deploy em Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🔗 Integração com Backend

A aplicação espera que o backend esteja rodando em:

```
http://localhost:8080/api
```

Para mudar, edite a variável de ambiente em `.env`:

```env
VITE_API_URL=https://seu-backend.com/api
```

## 📞 Suporte e Contato

Para dúvidas ou sugestões:

- Abra uma **Issue** no repositório
- Entre em contato via e15 de Janeiro de 2026  
  **Versão**: 1.0.0  
  **Status Geral**: 80% Completo - Funcionalidades core prontas, aguardando finalizações de features avançadas arlindolazaro202@gmail.com**

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🙌 Agradecimentos

Desenvolvido com dedicação, utilizando as melhores práticas modernas de desenvolvimento frontend com React e TypeScript.

---

**Stack Recomendado**:

- Backend: [electronics-store-api](https://github.com/arlindolazaro/electronics-store-api)
- Frontend: [electronics-store-web](https://github.com/arlindolazaro/electronics-store-web)
- Banco de Dados: MySQL 8.0+

**Última atualização**: Janeiro de 2026
