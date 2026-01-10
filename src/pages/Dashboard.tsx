import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import vendasService from '../services/vendas.service';
import comprasService from '../services/compras.service';
import produtosService from '../services/produtos.service';
import { aprovacaoService } from '../services/compras.service';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendas: 0,
    comprasPendentes: 0,
    produtosCadastrados: 0,
    aprovaçõesPendentes: 0,
  });

  const [ultimasVendas, setUltimasVendas] = useState<any[]>([]);
  const [ultimasCompras, setUltimasCompras] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      const [vendasData, comprasData, produtosData, aprovacoesData] =
        await Promise.all([
          vendasService.listar(),
          comprasService.listar(),
          produtosService.listar(),
          aprovacaoService.listar(),
        ]);

      const totalVendas = vendasData.reduce(
        (sum, v) =>
          sum +
          (typeof v.total === 'number' && !Number.isNaN(v.total)
            ? v.total
            : Number(v.total) || 0),
        0
      );

      const comprasPendentes = comprasData.filter(
        c => c.status === 'DRAFT' || c.status === 'ENVIADO'
      ).length;

      const aprovaçõesPendentes = aprovacoesData.filter(
        a => a.status === 'PENDING'
      ).length;

      setStats({
        totalVendas,
        comprasPendentes,
        produtosCadastrados: produtosData.length,
        aprovaçõesPendentes,
      });

      setUltimasVendas(
        vendasData.slice(0, 3).map(v => ({
          id: v.id,
          data: v.data,
          cliente: v.clienteNome,
          total:
            typeof v.total === 'number' && !Number.isNaN(v.total)
              ? v.total
              : Number(v.total) || 0,
          status: v.status,
        }))
      );

      setUltimasCompras(
        comprasData.slice(0, 3).map(c => ({
          id: c.id,
          data: c.data,
          fornecedor: c.fornecedorNome,
          total:
            typeof c.total === 'number' && !Number.isNaN(c.total)
              ? c.total
              : Number(c.total) || 0,
          status: c.status,
        }))
      );
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ======== AJUSTE SOMENTE DE UI ======== */
  const StatCard = ({ icon: Icon, title, value, color, onClick }: any) => (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer min-w-0"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">
            {title}
          </p>

          <div className="flex items-baseline gap-1 overflow-hidden min-w-0">
            <span className="text-sm font-semibold text-gray-500 flex-shrink-0">MZN</span>
            <span className="text-xl md:text-2xl font-semibold text-gray-900 truncate block min-w-0">
              {typeof value === 'string'
                ? value.replace('MZN', '').trim()
                : value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-green-100 text-green-800';
      case 'ENVIADO':
        return 'bg-orange-100 text-orange-800';
      case 'APROVADO':
        return 'bg-green-100 text-green-800';
      case 'REJEITADO':
        return 'bg-red-100 text-red-800';
      case 'RECEBIDO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string, type: 'venda' | 'compra') => {
    if (type === 'venda') {
      switch (status) {
        case 'DRAFT':
          return 'Rascunho';
        case 'CONFIRMED':
          return 'Confirmada';
        case 'SHIPPED':
          return 'Enviada';
        default:
          return status;
      }
    } else {
      switch (status) {
        case 'DRAFT':
          return 'Rascunho';
        case 'ENVIADO':
          return 'Enviado';
        case 'APROVADO':
          return 'Aprovado';
        case 'REJEITADO':
          return 'Rejeitado';
        case 'RECEBIDO':
          return 'Recebido';
        default:
          return status;
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao Ecommerce Management</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={TrendingUp}
              title="Total de Vendas"
              value={formatCurrency(stats.totalVendas)}
              color="bg-blue-600"
              onClick={() => navigate('/vendas')}
            />
            <StatCard
              icon={ShoppingCart}
              title="Compras Pendentes"
              value={stats.comprasPendentes}
              color="bg-orange-600"
              onClick={() => navigate('/compras')}
            />
            <StatCard
              icon={Package}
              title="Produtos Cadastrados"
              value={stats.produtosCadastrados}
              color="bg-green-600"
              onClick={() => navigate('/produtos')}
            />
            <StatCard
              icon={AlertCircle}
              title="Aprovações Pendentes"
              value={stats.aprovaçõesPendentes}
              color={stats.aprovaçõesPendentes > 0 ? 'bg-red-600' : 'bg-gray-600'}
              onClick={() => navigate('/aprovacoes')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimas Vendas */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Últimas Vendas
                </h2>
              </div>

              {ultimasVendas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimasVendas.map(venda => (
                        <tr
                          key={venda.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {venda.cliente}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-center whitespace-nowrap">
                            {formatCurrency(venda.total)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                venda.status
                              )}`}
                            >
                              {getStatusLabel(venda.status, 'venda')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Nenhuma venda registrada
                </div>
              )}
            </div>

            {/* Últimas Compras */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Últimas Compras
                </h2>
              </div>

              {ultimasCompras.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Fornecedor
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimasCompras.map(compra => (
                        <tr
                          key={compra.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {compra.fornecedor}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-center whitespace-nowrap">
                            {formatCurrency(compra.total)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                compra.status
                              )}`}
                            >
                              {getStatusLabel(compra.status, 'compra')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Nenhuma compra registrada
                </div>
              )}
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Atalhos Rápidos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/vendas/nova')}
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-center"
              >
                <p className="font-semibold text-blue-900">+ Nova Venda</p>
              </button>
              <button
                onClick={() => navigate('/compras/nova')}
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-center"
              >
                <p className="font-semibold text-blue-900">+ Nova Compra</p>
              </button>
              <button
                onClick={() => navigate('/produtos/novo')}
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-center"
              >
                <p className="font-semibold text-blue-900">+ Novo Produto</p>
              </button>
              <button
                onClick={() => navigate('/aprovacoes')}
                className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-center"
              >
                <p className="font-semibold text-blue-900">Aprovações</p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
