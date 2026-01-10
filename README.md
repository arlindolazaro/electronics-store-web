# Electronics Store Web 🏪

Frontend de aplicação e-commerce para gerenciamento de loja de eletrônicos, desenvolvido com **React 18**, **TypeScript**, **Tailwind CSS** e **Vite**.

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

## 📁 Estrutura do Projeto

```
src/
├── App.tsx                        # Componente raiz da aplicação
├── main.tsx                       # Ponto de entrada
├── App.css                        # Estilos globais da aplicação
├── index.css                      # Estilos globais
│
├── components/                    # Componentes reutilizáveis
│   ├── common/
│   │   └── ProtectedRoute.tsx     # Wrapper para rotas protegidas
│   ├── layout/
│   │   ├── Layout.tsx             # Layout principal da aplicação
│   │   ├── Navbar.tsx             # Barra de navegação superior
│   │   └── Sidebar.tsx            # Menu lateral de navegação
│   └── ui/
│       └── Loading.tsx            # Componente de carregamento
│
├── pages/                         # Páginas principais
│   ├── Login.tsx                  # Página de login
│   ├── Register.tsx               # Página de registro
│   ├── Dashboard.tsx              # Dashboard principal
│   ├── Perfil.tsx                 # Perfil do usuário
│   │
│   ├── Produtos/                  # Seção de Produtos
│   │   ├── ListaProdutos.tsx      # Lista de todos os produtos
│   │   ├── CriarProduto.tsx       # Criar novo produto
│   │   ├── EditarProduto.tsx      # Editar produto existente
│   │   └── DetalheProduto.tsx     # Visualizar detalhes do produto
│   │
│   ├── Vendas/                    # Seção de Vendas
│   │   ├── ListaVendas.tsx        # Lista de vendas
│   │   ├── CriarVenda.tsx         # Criar nova venda
│   │   ├── DetalheVenda.tsx       # Detalhes da venda
│   │   └── ConfirmarEnvio.tsx     # Confirmar envio de venda
│   │
│   ├── Compras/                   # Seção de Compras/Pedidos
│   │   ├── ListaCompras.tsx       # Lista de pedidos de compra
│   │   ├── CriarCompra.tsx        # Criar novo pedido
│   │   ├── DetalheCompra.tsx      # Detalhes do pedido
│   │   ├── AprovarCompra.tsx      # Aprovar pedido
│   │   └── ReceberCompra.tsx      # Receber mercadoria do pedido
│   │
│   ├── Inventario/                # Seção de Inventário
│   │   ├── ListaInventario.tsx    # Lista de itens em estoque
│   │   └── DetalheInventario.tsx  # Detalhes do item
│   │
│   ├── Aprovacoes/                # Seção de Aprovações
│   │   ├── ListaAprovacoes.tsx    # Lista de tarefas de aprovação
│   │   └── DetalheAprovacao.tsx   # Detalhes da aprovação
│   │
│   ├── Usuarios/                  # Seção de Usuários
│   │   ├── ListaUsuarios.tsx      # Lista de usuários
│   │   ├── CriarUsuario.tsx       # Criar novo usuário
│   │   └── EditarUsuario.tsx      # Editar usuário existente
│   │
│   └── Relatorios/                # Seção de Relatórios
│       ├── VendasPorPeriodo.tsx   # Gráfico de vendas por período
│       ├── MetricasAprovacoes.tsx # Métricas de aprovações
│       └── StatusInventario.tsx   # Status do inventário
│
├── hooks/                         # Custom React Hooks
│   └── useFetch.ts                # Hook customizado para requisições
│
├── services/                      # Serviços de API
│   ├── api.ts                     # Configuração base do Axios
│   ├── auth.service.ts            # Serviço de autenticação
│   ├── produtos.service.ts        # Serviço de produtos
│   ├── vendas.service.ts          # Serviço de vendas
│   ├── compras.service.ts         # Serviço de compras
│   ├── usuarios.service.ts        # Serviço de usuários
│   └── relatorios.service.ts      # Serviço de relatórios
│
├── store/                         # State Management (Zustand)
│   └── authStore.ts               # Store de autenticação
│
└── utils/                         # Funções utilitárias
    └── formatters.ts              # Formatadores de dados
```

## 🔧 Configuração e Instalação

### Pré-requisitos

- **Node.js 18+** e **npm** (ou **yarn**) instalados
- **Backend API** rodando em http://localhost:8080/api
- Git (opcional)

### Passo 1: Clonar ou Baixar o Projeto

```bash
git clone <url-do-repositorio>
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
- Interceptadores para autenticação
- Tratamento automático de erros

## 🎯 Funcionalidades Principais

### 1. **Gerenciamento de Produtos**

- Listar, criar, editar e deletar produtos
- Busca e filtros
- Visualização detalhada

### 2. **Processamento de Vendas**

- Criar vendas associadas a produtos
- Rastrear status (pendente, enviado, entregue)
- Confirmar envio e entrega

### 3. **Pedidos de Compra**

- Criar pedidos de compra
- Fluxo de aprovação
- Receber mercadoria
- Atualizar inventário automaticamente

### 4. **Controle de Inventário**

- Visualizar estoque em tempo real
- Rastrear movimentação
- Alertas de estoque baixo

### 5. **Aprovações**

- Dashboard de tarefas de aprovação
- Aprovar ou rejeitar pedidos
- Histórico de aprovações

### 6. **Relatórios e Análises**

- Vendas por período com gráficos
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
- Entre em contato via email: **arlindolazaro202@gmail.com**

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🙌 Agradecimentos

Desenvolvido com dedicação, utilizando as melhores práticas modernas de desenvolvimento frontend com React e TypeScript.

---

**Stack Recomendado**:

- Backend: [electronics-store-api](../electronics-store-api)
- Frontend: Este projeto
- Banco de Dados: MySQL 8.0+

**Última atualização**: Janeiro de 2026
