import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import vendasService, { type Venda } from '../../services/vendas.service';
import { formatCurrency, safeMultiply } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const DetalheVenda: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [venda, setVenda] = useState<Venda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorDetails, setLoadErrorDetails] = useState<any | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [action, setAction] = useState<'confirm' | 'ship'>('confirm');

  useEffect(() => {
    carregarVenda();
  }, [id]);

  const carregarVenda = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      if (!id) return;
      const dados = await vendasService.obter(Number(id));
      setVenda(dados);
    } catch (error) {
      // Mostrar mensagem de erro mais detalhada quando disponível
      // (por exemplo: error.response.data.message)
      // e permitir ao usuário tentar recarregar.
      let message = 'Erro ao carregar venda';
      // @ts-ignore
      if (error?.response?.data?.message) message = error.response.data.message;
      // @ts-ignore
      else if (error?.message) message = error.message;
      setLoadError(message);
      // @ts-ignore
      setLoadErrorDetails(error?.response?.data ?? error?.toString());
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const criarVendaExemplo = () => {
    const exemplo: Venda = {
      id: id ? Number(id) : 0,
      data: new Date(),
      clienteNome: 'Geraldo Pedro (Exemplo)',
      clienteEmail: 'geraldo@example.com',
      clienteTelefone: '865304919',
      status: 'DRAFT',
      total: 25000,
      itens: [
        {
          produtoId: 1,
          variacaoId: 0,
          quantidade: 1,
          precoUnitario: 25000,
          total: 25000,
        },
      ],
    };

    setVenda(exemplo);
    setLoadError(null);
  };

  const confirmarVenda = async () => {
    if (!venda?.id) return;
    try {
      setIsConfirming(true);
      const username = user?.name || user?.email || 'system';
      const vendaAtualizada = await vendasService.confirmar(venda.id, 'Maputo', username);
      setVenda(vendaAtualizada);
      setShowConfirmModal(false);
      toast.success('Venda confirmada com sucesso!');
    } catch (error) {
      toast.error('Erro ao confirmar venda');
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  const enviarVenda = async () => {
    if (!venda?.id) return;
    try {
      setIsShipping(true);
      const username = user?.name || user?.email || 'system';
      const vendaAtualizada = await vendasService.marcarEnviada(venda.id, 'Maputo', username);
      setVenda(vendaAtualizada);
      setShowConfirmModal(false);
      toast.success('Venda marcada como enviada!');
    } catch (error) {
      toast.error('Erro ao enviar venda');
      console.error(error);
    } finally {
      setIsShipping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/vendas')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={32} />
          {loadError ? (
            <>
              <p className="text-red-600 mb-3">{loadError}</p>
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => carregarVenda()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Tentar novamente
                  </button>
                  <button
                    onClick={() => criarVendaExemplo()}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
                  >
                    Mostrar exemplo
                  </button>
                  <button
                    onClick={() => navigate('/vendas')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Voltar
                  </button>
                </div>
                {loadErrorDetails && (
                  <div className="w-full max-w-3xl">
                    <button
                      onClick={() => setShowErrorDetails(s => !s)}
                      className="px-3 py-1 text-sm text-gray-700 underline"
                    >
                      {showErrorDetails ? 'Ocultar detalhes' : 'Mostrar detalhes do erro'}
                    </button>
                    {showErrorDetails && (
                      <pre className="mt-2 p-3 bg-gray-50 text-xs text-gray-800 overflow-auto rounded border border-gray-200">
                        {typeof loadErrorDetails === 'string' ? loadErrorDetails : JSON.stringify(loadErrorDetails, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-red-600">Venda não encontrada</p>
          )}
        </div>
      </div>
    );
  }

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
      <button
        onClick={() => navigate('/vendas')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Venda #{venda.id}</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(venda.status)}`}>
          {getStatusLabel(venda.status)}
        </span>
      </div>

      {/* Informações do Cliente */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nome</p>
            <p className="font-semibold text-gray-900">{venda.clienteNome || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-semibold text-gray-900">{venda.clienteEmail || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Telefone</p>
            <p className="font-semibold text-gray-900">{venda.clienteTelefone || 'Não informado'}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">Obs: o backend actual não persiste dados de cliente; exibindo informações disponíveis.</p>
      </div>

      {/* Itens da Venda */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Itens</h2>
        {venda.itens && venda.itens.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto ID</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Quantidade</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Preço Unitário</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {venda.itens.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">#{item.produtoId}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.quantidade}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatCurrency(item.precoUnitario)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(safeMultiply(item.quantidade, item.precoUnitario))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Nenhum item nesta venda</p>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="text-right">
          <p className="text-gray-600 text-sm mb-2">Total da Venda</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(venda.total)}
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        {venda.status === 'DRAFT' && (
          <button
            onClick={() => {
              setAction('confirm');
              setShowConfirmModal(true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Check size={20} /> Confirmar Venda
          </button>
        )}

        {venda.status === 'CONFIRMED' && (
          <button
            onClick={() => {
              setAction('ship');
              setShowConfirmModal(true);
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Package size={20} /> Marcar como Enviada
          </button>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'confirm' ? 'Confirmar Venda' : 'Marcar como Enviada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {action === 'confirm' 
                ? 'Ao confirmar, o estoque será reservado. Tem certeza?'
                : 'Tem certeza que deseja marcar esta venda como enviada?'
              }
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={action === 'confirm' ? confirmarVenda : enviarVenda}
                disabled={isConfirming || isShipping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {(isConfirming || isShipping) && <Loader2 className="animate-spin" size={16} />}
                {action === 'confirm' ? 'Confirmar' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalheVenda;
