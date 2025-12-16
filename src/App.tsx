import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';

// Produtos
import ListaProdutos from './pages/Produtos/ListaProdutos';
import CriarProduto from './pages/Produtos/CriarProduto';
import EditarProduto from './pages/Produtos/EditarProduto';
import DetalheProduto from './pages/Produtos/DetalheProduto';

// Vendas
import ListaVendas from './pages/Vendas/ListaVendas';
import CriarVenda from './pages/Vendas/CriarVenda';
import DetalheVenda from './pages/Vendas/DetalheVenda';
import ConfirmarEnvio from './pages/Vendas/ConfirmarEnvio';

// Compras
import ListaCompras from './pages/Compras/ListaCompras';
import CriarCompra from './pages/Compras/CriarCompra';
import DetalheCompra from './pages/Compras/DetalheCompra';
import AprovarCompra from './pages/Compras/AprovarCompra';
import ReceberCompra from './pages/Compras/ReceberCompra';

// Inventário
import ListaInventario from './pages/Inventario/ListaInventario';
import DetalheInventario from './pages/Inventario/DetalheInventario';

// Aprovações
import ListaAprovacoes from './pages/Aprovacoes/ListaAprovacoes';
import DetalheAprovacao from './pages/Aprovacoes/DetalheAprovacao';

// Usuários
import ListaUsuarios from './pages/Usuarios/ListaUsuarios';
import CriarUsuario from './pages/Usuarios/CriarUsuario';
import EditarUsuario from './pages/Usuarios/EditarUsuario';

// Relatórios
import VendasPorPeriodo from './pages/Relatorios/VendasPorPeriodo';
import StatusInventario from './pages/Relatorios/StatusInventario';
import MetricasAprovacoes from './pages/Relatorios/MetricasAprovacoes';

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="perfil" element={<Perfil />} />

          {/* Produtos Routes */}
          <Route path="produtos">
            <Route index element={<ListaProdutos />} />
            <Route path="novo" element={<CriarProduto />} />
            <Route path=":id" element={<DetalheProduto />} />
            <Route path=":id/editar" element={<EditarProduto />} />
          </Route>

          {/* Vendas Routes */}
          <Route path="vendas">
            <Route index element={<ListaVendas />} />
            <Route path="nova" element={<CriarVenda />} />
            <Route path=":id" element={<DetalheVenda />} />
            <Route path=":id/confirmar-envio" element={<ConfirmarEnvio />} />
          </Route>

          {/* Compras Routes */}
          <Route path="compras">
            <Route index element={<ListaCompras />} />
            <Route path="nova" element={<CriarCompra />} />
            <Route path=":id" element={<DetalheCompra />} />
            <Route path=":id/aprovar" element={<AprovarCompra />} />
            <Route path=":id/receber" element={<ReceberCompra />} />
          </Route>

          {/* Inventário Routes */}
          <Route path="inventario">
            <Route index element={<ListaInventario />} />
            <Route path=":id" element={<DetalheInventario />} />
          </Route>

          {/* Aprovações Routes */}
          <Route path="aprovacoes">
            <Route index element={<ListaAprovacoes />} />
            <Route path=":id" element={<DetalheAprovacao />} />
          </Route>

          {/* Usuários Routes */}
          <Route path="usuarios">
            <Route index element={<ListaUsuarios />} />
            <Route path="novo" element={<CriarUsuario />} />
            <Route path=":id/editar" element={<EditarUsuario />} />
          </Route>

          {/* Relatórios Routes */}
          <Route path="relatorios">
            <Route path="vendas" element={<VendasPorPeriodo />} />
            <Route path="inventario" element={<StatusInventario />} />
            <Route path="metricas" element={<MetricasAprovacoes />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;