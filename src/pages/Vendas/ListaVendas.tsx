import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Venda } from '../../services/vendas.service';
import vendasService from '../../services/vendas.service';
import { formatCurrency } from '../../utils/formatters';

const ListaVendas: React.FC = () => {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'CONFIRMED' | 'SHIPPED'>('ALL');

  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    try {
      setIsLoading(true);
      const dados = await vendasService.listar();
      setVendas(dados);
    } catch (error) {
      toast.error('Erro ao carregar vendas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVendas = filterStatus === 'ALL' 
    ? vendas 
    : vendas.filter(v => v.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'Rascunho';
      case 'CONFIRMED': return 'Confirmada';
      case 'SHIPPED': return 'Enviada';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendas</h1>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {(['ALL', 'DRAFT', 'CONFIRMED', 'SHIPPED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Tabela de Vendas */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filteredVendas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Nenhuma venda encontrada</p>
          <button
            onClick={() => navigate('/vendas/nova')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Criar primeira venda →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Itens</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendas.map(venda => (
                <tr key={venda.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{venda.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{venda.clienteNome}</div>
                    {venda.clienteEmail && <div className="text-xs text-gray-400">{venda.clienteEmail}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {venda.itens?.length || 0} item(s)
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(venda.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(venda.status)}`}>
                      {getStatusLabel(venda.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/vendas/${venda.id}`)}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Ver detalhes"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaVendas;
