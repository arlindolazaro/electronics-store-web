import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import comprasService, { type PedidoCompra } from '../../services/compras.service';
import { formatCurrency } from '../../utils/formatters';

const ListaCompras: React.FC = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState<PedidoCompra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'RECEBIDO'>('ALL');

  useEffect(() => {
    carregarCompras();
  }, []);

  const carregarCompras = async () => {
    try {
      setIsLoading(true);
      const dados = await comprasService.listar();
      setCompras(dados);
    } catch (error) {
      toast.error('Erro ao carregar compras');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompras = filterStatus === 'ALL' 
    ? compras 
    : compras.filter(c => c.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ENVIADO': return 'bg-orange-100 text-orange-800';
      case 'APROVADO': return 'bg-green-100 text-green-800';
      case 'REJEITADO': return 'bg-red-100 text-red-800';
      case 'RECEBIDO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'Rascunho';
      case 'ENVIADO': return 'Enviado';
      case 'APROVADO': return 'Aprovado';
      case 'REJEITADO': return 'Rejeitado';
      case 'RECEBIDO': return 'Recebido';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compras</h1>
        <button
          onClick={() => navigate('/compras/nova')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Nova Compra
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['ALL', 'DRAFT', 'ENVIADO', 'APROVADO', 'REJEITADO', 'RECEBIDO'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Tabela de Compras */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filteredCompras.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Nenhuma compra encontrada</p>
          <button
            onClick={() => navigate('/compras/nova')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Criar primeira compra →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nº Compra</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fornecedor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Linhas</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompras.map(compra => (
                <tr key={compra.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{compra.numeroCompra || compra.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{compra.fornecedorNome}</div>
                    {compra.fornecedorEmail && <div className="text-xs text-gray-400">{compra.fornecedorEmail}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {compra.linhas?.length || 0} linha(s)
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(compra.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(compra.status)}`}>
                      {getStatusLabel(compra.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/compras/${compra.id}`)}
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

export default ListaCompras;
