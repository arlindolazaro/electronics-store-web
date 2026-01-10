import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import comprasService, { type PedidoCompra } from '../../services/compras.service';
import { formatCurrency, safeMultiply } from '../../utils/formatters';

const DetalheCompra: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [compra, setCompra] = useState<PedidoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    carregarCompra();
  }, [id]);

  const carregarCompra = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      const dados = await comprasService.obter(Number(id));
      setCompra(dados);
    } catch (error) {
      toast.error('Erro ao carregar compra');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const enviarParaAprovacao = async () => {
    if (!compra?.id) return;
    try {
      setIsSending(true);
      const compraAtualizada = await comprasService.enviarParaAprovacao(compra.id);
      setCompra(compraAtualizada);
      setShowConfirmModal(false);
      toast.success('Pedido enviado para aprovação!');
    } catch (error) {
      toast.error('Erro ao enviar pedido');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/compras')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={32} />
          <p className="text-red-600">Compra não encontrada</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ENVIADO':
      case 'SENT': return 'bg-orange-100 text-orange-800';
      case 'APROVADO':
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJEITADO': return 'bg-red-100 text-red-800';
      case 'RECEBIDO':
      case 'PARTIALLY_RECEIVED':
      case 'CLOSED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'Rascunho';
      case 'ENVIADO':
      case 'SENT': return 'Enviado';
      case 'APROVADO':
      case 'ACCEPTED': return 'Aprovado';
      case 'REJEITADO': return 'Rejeitado';
      case 'RECEBIDO':
      case 'PARTIALLY_RECEIVED': return 'Parcialmente Recebido';
      case 'CLOSED': return 'Recebido';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/compras')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compra #{compra.numeroCompra || compra.id}</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(compra.status)}`}>
          {getStatusLabel(compra.status)}
        </span>
      </div>

      {/* Informações do Fornecedor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Fornecedor</h2>
        {compra.fornecedorNome ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nome</p>
              <p className="font-semibold text-gray-900">{compra.fornecedorNome}</p>
            </div>
            {compra.fornecedorEmail && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a href={`mailto:${compra.fornecedorEmail}`} className="font-semibold text-blue-600 hover:text-blue-700">{compra.fornecedorEmail}</a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">Sem informações de fornecedor</p>
        )}
      </div>

      {/* Status do Pedido */}
      {compra.status === 'REJEITADO' && compra.justificativaRejeicao && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold mb-2">Motivo da Rejeição:</p>
          <p className="text-red-700">{compra.justificativaRejeicao}</p>
        </div>
      )}

      {/* Linhas de Compra */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Linhas de Compra</h2>
        {compra.linhas && compra.linhas.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto ID</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Quantidade</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Preço Unit.</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                  {(compra.status === 'APROVADO' || compra.status === 'ACCEPTED' || compra.status === 'PARTIALLY_RECEIVED') && (
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Recebidas</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {compra.linhas.map((linha, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">#{linha.produtoId}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{linha.quantidade}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatCurrency(linha.precoUnitario)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(safeMultiply(linha.quantidade, linha.precoUnitario))}
                    </td>
                    {(compra.status === 'APROVADO' || compra.status === 'ACCEPTED' || compra.status === 'PARTIALLY_RECEIVED') && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if (!compra?.id || Number.isNaN(Number(compra.id))) return;
                            navigate(`/compras/${compra.id}/receber/${index}`);
                          }}
                          className="text-green-600 hover:text-green-700 transition font-semibold text-sm"
                        >
                          {linha.quantidadeRecebida || 0} / {linha.quantidade}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Nenhuma linha neste pedido</p>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="text-right">
          <p className="text-gray-600 text-sm mb-2">Total do Pedido</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(compra.total)}
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        {compra.status === 'DRAFT' && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Send size={20} /> Enviar para Aprovação
          </button>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enviar para Aprovação</h3>
            <p className="text-gray-600 mb-6">
              Total do pedido: <strong>{formatCurrency(compra.total)}</strong>
            </p>
            <p className="text-gray-600 mb-6">
              {(typeof compra.total === 'number' && !Number.isNaN(compra.total) ? compra.total : 0) > 10000 
                ? 'Este pedido será enviado para aprovação de um gerente.'
                : 'Este pedido será aprovado automaticamente.'
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
                onClick={enviarParaAprovacao}
                disabled={isSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSending && <Loader2 className="animate-spin" size={16} />}
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalheCompra;
